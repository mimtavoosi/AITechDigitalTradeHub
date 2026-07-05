using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels.Admin;
using AITechDigitalTradeHub.Api.ViewModels.Investments;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InvestmentsController : ControllerBase
    {
        private readonly TheAppContext _context;
        private readonly IFinanceRep _financeRep;
        private readonly IProjectAccessService _projectAccessService;
        private readonly IUserNotificationService _userNotificationService;

        public InvestmentsController(
            TheAppContext context,
            IFinanceRep financeRep,
            IProjectAccessService projectAccessService,
            IUserNotificationService userNotificationService)
        {
            _context = context;
            _financeRep = financeRep;
            _projectAccessService = projectAccessService;
            _userNotificationService = userNotificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] InvestmentOpportunityStatus? status = InvestmentOpportunityStatus.Open,
            [FromQuery] FundraisingStage? stage = null,
            [FromQuery] InvestmentRiskLevel? riskLevel = null,
            [FromQuery] decimal? minRequiredCapital = null,
            [FromQuery] decimal? maxRequiredCapital = null,
            [FromQuery] decimal? minExpectedRoi = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var query = BuildOpportunityQuery(includePrivate: false);

            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (stage.HasValue) query = query.Where(x => x.Stage == stage.Value);
            if (riskLevel.HasValue) query = query.Where(x => x.RiskLevel == riskLevel.Value);
            if (minRequiredCapital.HasValue) query = query.Where(x => x.RequiredCapital >= minRequiredCapital.Value);
            if (maxRequiredCapital.HasValue) query = query.Where(x => x.RequiredCapital <= maxRequiredCapital.Value);
            if (minExpectedRoi.HasValue) query = query.Where(x => x.ExpectedRoiPercent >= minExpectedRoi.Value);
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var term = searchText.Trim();
                query = query.Where(x => x.Title.Contains(term) || (x.Summary != null && x.Summary.Contains(term)));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.OpenedAt ?? x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<InvestmentOpportunityResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = items.Select(x => InvestmentOpportunityResponse.FromEntity(x)).ToList()
            });
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var userId = GetCurrentUserId();
            var item = await BuildOpportunityQuery(includePrivate: true)
                .SingleOrDefaultAsync(x => x.ID == id);
            if (item == null)
            {
                return NotFound();
            }

            var includePrivate = item.OwnerUserId == userId || await HasInvestmentAccessAsync(item.ID, userId);
            if (!includePrivate && item.Status != InvestmentOpportunityStatus.Open)
            {
                return NotFound();
            }

            return Ok(new RowResultObject<InvestmentOpportunityResponse>
            {
                Result = InvestmentOpportunityResponse.FromEntity(item, includePrivate)
            });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminAll(
            [FromQuery] InvestmentOpportunityStatus? status = null,
            [FromQuery] FundraisingStage? stage = null,
            [FromQuery] InvestmentRiskLevel? riskLevel = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var query = BuildOpportunityQuery(includePrivate: true);
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (stage.HasValue) query = query.Where(x => x.Stage == stage.Value);
            if (riskLevel.HasValue) query = query.Where(x => x.RiskLevel == riskLevel.Value);
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var term = searchText.Trim();
                query = query.Where(x =>
                    x.Title.Contains(term) ||
                    (x.Summary != null && x.Summary.Contains(term)) ||
                    x.Slug.Contains(term));
            }

            var total = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<InvestmentOpportunityResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = items.Select(x => InvestmentOpportunityResponse.FromEntity(x, includePrivate: true)).ToList()
            });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin/{id:long}")]
        public async Task<IActionResult> GetAdminById(long id)
        {
            var item = await BuildOpportunityQuery(includePrivate: true)
                .SingleOrDefaultAsync(x => x.ID == id);
            return item == null
                ? NotFound()
                : Ok(new RowResultObject<InvestmentOpportunityResponse> { Result = InvestmentOpportunityResponse.FromEntity(item, includePrivate: true) });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateAdminStatus(long id, [FromBody] AdminInvestmentStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await _context.InvestmentOpportunities.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (opportunity == null) return NotFound();

            opportunity.Status = request.Status;
            opportunity.UpdateDate = DateTime.UtcNow;
            if (request.Status == InvestmentOpportunityStatus.Open) opportunity.OpenedAt ??= DateTime.UtcNow;
            if (request.Status is InvestmentOpportunityStatus.Funded or InvestmentOpportunityStatus.Closed or InvestmentOpportunityStatus.Rejected)
            {
                opportunity.ClosedAt ??= DateTime.UtcNow;
            }

            await _userNotificationService.AddInAppAsync(
                opportunity.OwnerUserId,
                $"وضعیت فرصت سرمایه‌گذاری «{opportunity.Title}» توسط ادمین به {request.Status} تغییر کرد.",
                NotificationCategory.Financial,
                userId);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = opportunity.ID });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateInvestmentOpportunityRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0) return Unauthorized();

            if (request.ProjectId.HasValue)
            {
                var canAccessProject = await _projectAccessService.CanAccessAsync(request.ProjectId.Value, userId, IsAdministrator());
                if (!canAccessProject)
                {
                    return Forbid();
                }
            }

            var now = DateTime.UtcNow;
            var opportunity = new InvestmentOpportunity
            {
                OwnerUserId = userId,
                OrganizationId = request.OrganizationId,
                ProjectId = request.ProjectId,
                Title = request.Title.Trim(),
                Slug = await GenerateUniqueSlugAsync(request.Slug, request.Title),
                Summary = request.Summary,
                BusinessModel = request.BusinessModel,
                Roadmap = request.Roadmap,
                Stage = request.Stage,
                RiskLevel = request.RiskLevel,
                RequiredCapital = request.RequiredCapital,
                OfferedSharePercent = request.OfferedSharePercent,
                ExpectedRoiPercent = request.ExpectedRoiPercent,
                Currency = string.IsNullOrWhiteSpace(request.Currency) ? "IRR" : request.Currency.Trim().ToUpperInvariant(),
                Status = request.SubmitForReview ? InvestmentOpportunityStatus.Open : InvestmentOpportunityStatus.Draft,
                OpenedAt = request.SubmitForReview ? now : null,
                CreateDate = now,
                UpdateDate = now,
                CreatorId = userId,
                IsActive = true
            };

            await _context.InvestmentOpportunities.AddAsync(opportunity);
            await _context.SaveChangesAsync();
            return Ok(new RowResultObject<InvestmentOpportunityResponse>
            {
                Result = InvestmentOpportunityResponse.FromEntity(opportunity, includePrivate: true)
            });
        }

        [Authorize]
        [HttpPost("{id:long}/documents")]
        public async Task<IActionResult> AddDocument(long id, [FromBody] AddInvestmentDocumentRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await GetOwnedOpportunityAsync(id, userId);
            if (opportunity == null) return Forbid();

            var ownsFile = await _context.FileUploads.AnyAsync(x => x.ID == request.FileUploadId && x.CreatorId == userId && x.DeleteDate == null);
            if (!ownsFile)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "فایل مستند پیدا نشد یا متعلق به شما نیست" });
            }

            var document = new InvestmentDocument
            {
                InvestmentOpportunityId = id,
                FileUploadId = request.FileUploadId,
                DocumentType = request.DocumentType,
                Title = request.Title.Trim(),
                IsConfidential = request.IsConfidential,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };
            await _context.InvestmentDocuments.AddAsync(document);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = document.ID });
        }

        [Authorize]
        [HttpPost("{id:long}/tranches")]
        public async Task<IActionResult> AddTranche(long id, [FromBody] AddInvestmentTrancheRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await GetOwnedOpportunityAsync(id, userId);
            if (opportunity == null) return Forbid();

            var tranche = new InvestmentTranche
            {
                InvestmentOpportunityId = id,
                Title = request.Title.Trim(),
                Amount = request.Amount,
                ReleaseCondition = request.ReleaseCondition,
                DueAt = request.DueAt,
                Status = InvestmentTrancheStatus.Planned,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };
            await _context.InvestmentTranches.AddAsync(tranche);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = tranche.ID });
        }

        [Authorize]
        [HttpPost("{id:long}/reports")]
        public async Task<IActionResult> AddReport(long id, [FromBody] AddInvestmentReportRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await GetOwnedOpportunityAsync(id, userId);
            if (opportunity == null) return Forbid();

            var report = new InvestmentReport
            {
                InvestmentOpportunityId = id,
                Title = request.Title.Trim(),
                Content = request.Content,
                SpentAmount = request.SpentAmount,
                RoiPercent = request.RoiPercent,
                ReportedAt = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };
            await _context.InvestmentReports.AddAsync(report);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = report.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("{id:long}/invest")]
        public async Task<IActionResult> Invest(long id, [FromBody] DirectInvestmentRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await _context.InvestmentOpportunities.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (opportunity == null) return NotFound();
            if (opportunity.Status != InvestmentOpportunityStatus.Open)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این فرصت در وضعیت جذب سرمایه فعال نیست" });
            }
            if (opportunity.OwnerUserId == userId)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "مالک فرصت نمی‌تواند روی فرصت خودش سرمایه‌گذاری کند" });
            }

            var payerWallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == request.PayerWalletId && x.OwnerType == WalletOwnerType.User && x.OwnerUserId == userId);
            if (payerWallet == null) return Forbid();

            var ownerWallet = await GetOrCreateUserWalletAsync(opportunity.OwnerUserId, opportunity.Currency);
            var now = DateTime.UtcNow;
            var commitment = new InvestmentCommitment
            {
                InvestmentOpportunityId = id,
                InvestorUserId = userId,
                InvestorOrganizationId = request.InvestorOrganizationId,
                Amount = request.Amount,
                SharePercent = request.SharePercent,
                Status = InvestmentCommitmentStatus.Pending,
                CreateDate = now,
                UpdateDate = now,
                CreatorId = userId,
                IsActive = true
            };
            await _context.InvestmentCommitments.AddAsync(commitment);
            await _context.SaveChangesAsync();

            var escrowResult = await _financeRep.HoldEscrowAsync(payerWallet.ID, ownerWallet.ID, request.Amount, "Investment", commitment.ID);
            if (!escrowResult.Status)
            {
                commitment.Status = InvestmentCommitmentStatus.Rejected;
                commitment.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return BadRequest(escrowResult);
            }

            commitment.Status = InvestmentCommitmentStatus.Funded;
            commitment.EscrowId = escrowResult.ID;
            commitment.UpdateDate = DateTime.UtcNow;

            var contract = new InvestmentContract
            {
                InvestmentOpportunityId = id,
                InvestorUserId = userId,
                InvestorOrganizationId = request.InvestorOrganizationId,
                EscrowId = escrowResult.ID,
                ContractFileId = request.ContractFileId,
                Amount = request.Amount,
                SharePercent = request.SharePercent,
                Currency = opportunity.Currency,
                Status = InvestmentContractStatus.Active,
                TermsJson = request.TermsJson,
                ReleaseConditionsJson = request.ReleaseConditionsJson,
                SignedAt = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };
            await _context.InvestmentContracts.AddAsync(contract);

            var fundedBeforeThisCommitment = await _context.InvestmentCommitments
                .Where(x => x.InvestmentOpportunityId == id && x.ID != commitment.ID && x.Status == InvestmentCommitmentStatus.Funded)
                .SumAsync(x => x.Amount);
            opportunity.RaisedCapital = fundedBeforeThisCommitment + request.Amount;
            opportunity.Status = opportunity.RaisedCapital >= opportunity.RequiredCapital ? InvestmentOpportunityStatus.Funded : opportunity.Status;
            opportunity.UpdateDate = DateTime.UtcNow;
            if (opportunity.Status == InvestmentOpportunityStatus.Funded) opportunity.ClosedAt = DateTime.UtcNow;

            await _userNotificationService.AddInAppAsync(
                opportunity.OwnerUserId,
                $"سرمایه‌گذاری مستقیم به مبلغ {request.Amount:N0} {opportunity.Currency} برای فرصت «{opportunity.Title}» ثبت و در Escrow نگهداری شد.",
                NotificationCategory.Financial,
                userId);
            await _context.SaveChangesAsync();

            return Ok(new BitResultObject { ID = commitment.ID });
        }

        [Authorize]
        [HttpPost("{id:long}/disputes")]
        public async Task<IActionResult> OpenDispute(long id, [FromBody] OpenInvestmentDisputeRequest request)
        {
            var userId = GetCurrentUserId();
            var opportunity = await _context.InvestmentOpportunities.SingleOrDefaultAsync(x => x.ID == id);
            if (opportunity == null) return NotFound();

            var isInvestor = await _context.InvestmentCommitments.AnyAsync(x => x.InvestmentOpportunityId == id && x.InvestorUserId == userId && x.Status == InvestmentCommitmentStatus.Funded);
            if (opportunity.OwnerUserId != userId && !isInvestor && !IsAdministrator())
            {
                return Forbid();
            }

            var respondentUserId = opportunity.OwnerUserId == userId
                ? await _context.InvestmentCommitments
                    .Where(x => x.InvestmentOpportunityId == id && x.Status == InvestmentCommitmentStatus.Funded)
                    .OrderByDescending(x => x.CreateDate)
                    .Select(x => (long?)x.InvestorUserId)
                    .FirstOrDefaultAsync()
                : opportunity.OwnerUserId;

            var dispute = new Dispute
            {
                ContextType = DisputeContextType.Investment,
                ContextId = id,
                OpenedByUserId = userId,
                RespondentUserId = respondentUserId,
                Title = request.Title.Trim(),
                Description = request.Description,
                Reason = request.Reason,
                Status = DisputeStatus.Open,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };
            await _context.Disputes.AddAsync(dispute);

            if (respondentUserId.HasValue)
            {
                await _userNotificationService.AddInAppAsync(
                    respondentUserId.Value,
                    $"برای فرصت سرمایه‌گذاری «{opportunity.Title}» پرونده اختلاف «{dispute.Title}» ثبت شد.",
                    NotificationCategory.Dispute,
                    userId);
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = dispute.ID });
        }

        private IQueryable<InvestmentOpportunity> BuildOpportunityQuery(bool includePrivate)
        {
            return _context.InvestmentOpportunities
                .AsNoTracking()
                .Include(x => x.Documents.Where(d => includePrivate || !d.IsConfidential))
                    .ThenInclude(x => x.FileUpload)
                .Include(x => x.Tranches)
                .Include(x => x.Reports)
                .Include(x => x.Commitments);
        }

        private async Task<InvestmentOpportunity?> GetOwnedOpportunityAsync(long id, long userId)
        {
            if (userId <= 0) return null;
            return await _context.InvestmentOpportunities.SingleOrDefaultAsync(x => x.ID == id && (x.OwnerUserId == userId || IsAdministrator()));
        }

        private async Task<bool> HasInvestmentAccessAsync(long opportunityId, long userId)
        {
            if (userId <= 0) return false;
            return await _context.InvestmentCommitments.AnyAsync(x => x.InvestmentOpportunityId == opportunityId && x.InvestorUserId == userId)
                   || await _context.InvestmentContracts.AnyAsync(x => x.InvestmentOpportunityId == opportunityId && x.InvestorUserId == userId);
        }

        private async Task<Wallet> GetOrCreateUserWalletAsync(long userId, string currency)
        {
            var wallet = await _context.Wallets.SingleOrDefaultAsync(x =>
                x.OwnerType == WalletOwnerType.User &&
                x.OwnerUserId == userId &&
                x.Currency == currency &&
                x.DeleteDate == null);
            if (wallet != null) return wallet;

            wallet = new Wallet
            {
                OwnerType = WalletOwnerType.User,
                OwnerUserId = userId,
                Currency = currency,
                Status = WalletStatus.Active,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };
            await _context.Wallets.AddAsync(wallet);
            await _context.SaveChangesAsync();
            return wallet;
        }

        private async Task<string> GenerateUniqueSlugAsync(string? requestedSlug, string title)
        {
            var baseSlug = Slugify(string.IsNullOrWhiteSpace(requestedSlug) ? title : requestedSlug);
            var slug = baseSlug;
            var suffix = 2;
            while (await _context.InvestmentOpportunities.AnyAsync(x => x.Slug == slug))
            {
                slug = $"{baseSlug}-{suffix++}";
            }
            return slug;
        }

        private static string Slugify(string value)
        {
            var normalized = new string(value.Trim().ToLowerInvariant()
                .Select(ch => char.IsLetterOrDigit(ch) ? ch : '-')
                .ToArray());
            normalized = string.Join("-", normalized.Split('-', StringSplitOptions.RemoveEmptyEntries));
            return string.IsNullOrWhiteSpace(normalized) ? $"investment-{DateTime.UtcNow:yyyyMMddHHmmss}" : normalized[..Math.Min(normalized.Length, 220)];
        }

        private bool IsAdministrator()
        {
            return User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
