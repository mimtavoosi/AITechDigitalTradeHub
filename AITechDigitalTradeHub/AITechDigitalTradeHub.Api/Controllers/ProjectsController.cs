using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Projects;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OutputCaching;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public partial class ProjectsController : ControllerBase
    {
        private readonly IProjectRep _projectRep;
        private readonly IFinanceRep _financeRep;
        private readonly TheAppContext _context;
        private readonly IProjectAccessService _projectAccessService;
        private readonly IUserNotificationService _userNotificationService;

        public ProjectsController(IProjectRep projectRep, IFinanceRep financeRep, TheAppContext context, IProjectAccessService projectAccessService, IUserNotificationService userNotificationService)
        {
            _projectRep = projectRep;
            _financeRep = financeRep;
            _context = context;
            _projectAccessService = projectAccessService;
            _userNotificationService = userNotificationService;
        }

        [HttpGet]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetAll(
            [FromQuery] ProjectStatus? status,
            [FromQuery] long categoryId = 0,
            [FromQuery] decimal? minBudget = null,
            [FromQuery] decimal? maxBudget = null,
            [FromQuery] long skillTagId = 0,
            [FromQuery] ProjectType? projectType = null,
            [FromQuery] LocationMode? locationMode = null,
            [FromQuery] DateTime? deadlineFrom = null,
            [FromQuery] DateTime? deadlineTo = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _projectRep.GetAllProjectsAsync(
                status,
                categoryId,
                minBudget,
                maxBudget,
                skillTagId,
                projectType,
                locationMode,
                deadlineFrom,
                deadlineTo,
                pageIndex,
                pageSize,
                searchText,
                sortQuery);

            return result.Status ? Ok(result.Map(ProjectListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetUserProjectsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ProjectListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("my-proposals")]
        public async Task<IActionResult> GetMyProposals([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetUserProposalsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ProposalResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminList(
            [FromQuery] ProjectStatus? status,
            [FromQuery] long organizationId = 0,
            [FromQuery] string searchText = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.Projects
                .AsNoTracking()
                .Include(x => x.EmployerUser)
                .Include(x => x.Organization)
                .Include(x => x.Category)
                .Where(x =>
                    (status == null || x.Status == status) &&
                    (organizationId <= 0 || x.OrganizationId == organizationId) &&
                    (string.IsNullOrEmpty(searchText) ||
                     x.Title.Contains(searchText) ||
                     (x.Description != null && x.Description.Contains(searchText)) ||
                     x.EmployerUser.Username.Contains(searchText) ||
                     (x.Organization != null && x.Organization.Title.Contains(searchText))));

            var result = new ListResultObject<ProjectListItemResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var projects = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            await PopulateProjectProposalCountsAsync(projects);
            result.Results = projects.Select(ProjectListItemResponse.FromEntity).ToList();
            await PopulateAdminProjectDisputeCountsAsync(result.Results);

            return Ok(result);
        }

        [Authorize]
        [HttpGet("organizations/{organizationId:long}")]
        public async Task<IActionResult> GetOrganizationProjects(long organizationId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var isMember = await _context.OrganizationMembers.AnyAsync(x =>
                x.OrganizationId == organizationId &&
                x.UserId == userId &&
                x.IsActive &&
                x.DeleteDate == null);

            var isOwner = await _context.Organizations.AnyAsync(x => x.ID == organizationId && x.OwnerUserId == userId);
            if (!isMember && !isOwner)
            {
                return Forbid();
            }

            var query = _context.Projects
                .AsNoTracking()
                .Include(x => x.EmployerUser)
                .Include(x => x.Organization)
                .Include(x => x.Category)
                .Where(x => x.OrganizationId == organizationId);

            var result = new ListResultObject<ProjectListItemResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var projects = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            await PopulateProjectProposalCountsAsync(projects);
            result.Results = projects.Select(ProjectListItemResponse.FromEntity).ToList();

            return Ok(result);
        }

        [HttpGet("{id:long}")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _projectRep.GetProjectByIdAsync(id);
            if (!result.Status || result.Result == null)
            {
                return NotFound(result);
            }

            var mapped = result.Map(ProjectDetailResponse.FromEntity);
            await PopulateMilestoneEscrowsAsync(mapped.Result?.Contract?.Milestones);
            if (mapped.Result != null)
            {
                await PopulateProposalResumeFilesAsync(mapped.Result.Proposals);
            }
            return Ok(mapped);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.CreateProject)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProjectUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var project = request.ToEntity(userId);
            var result = await _projectRep.AddProjectAsync(project);
            if (result.Status)
            {
                await ReplaceProjectSkillsAsync(result.ID, request.SkillTagIds);
            }
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] ProjectUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var project = request.ToEntity(userId);
            project.ID = id;
            var result = await _projectRep.EditProjectAsync(project, userId);
            if (result.Status)
            {
                await ReplaceProjectSkillsAsync(id, request.SkillTagIds);
            }
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private async Task ReplaceProjectSkillsAsync(long projectId, IEnumerable<long>? skillTagIds)
        {
            var requestedIds = (skillTagIds ?? Enumerable.Empty<long>())
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            var existing = await _context.ProjectSkills.Where(x => x.ProjectId == projectId).ToListAsync();
            _context.ProjectSkills.RemoveRange(existing);

            if (requestedIds.Count > 0)
            {
                var validIds = await _context.Tags
                    .AsNoTracking()
                    .Where(x => requestedIds.Contains(x.ID) && x.IsActive && x.DeleteDate == null)
                    .Select(x => x.ID)
                    .ToListAsync();

                await _context.ProjectSkills.AddRangeAsync(validIds.Select(tagId => new ProjectSkill
                {
                    ProjectId = projectId,
                    TagId = tagId
                }));
            }

            await _context.SaveChangesAsync();
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPost("{id:long}/publish")]
        public async Task<IActionResult> Publish(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.PublishProjectAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.RemoveProjectAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:long}/proposals")]
        public async Task<IActionResult> GetProposals(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _projectRep.GetProjectProposalsAsync(id, pageIndex, pageSize);
            var mapped = result.Map(ProposalResponse.FromEntity);
            await PopulateProposalResumeFilesAsync(mapped.Results);
            return result.Status ? Ok(mapped) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.SubmitProposal)]
        [HttpPost("{id:long}/proposals")]
        public async Task<IActionResult> CreateProposal(long id, [FromBody] CreateProposalRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var proposal = request.ToEntity(id, userId);
            var result = await _projectRep.AddProposalAsync(proposal);
            if (result.Status && request.ResumeFileUploadId.HasValue)
            {
                var file = await _context.FileUploads.SingleOrDefaultAsync(x => x.ID == request.ResumeFileUploadId.Value);
                if (file != null)
                {
                    file.EntityType = "ProposalResume";
                    file.ForeignKeyId = result.ID;
                    file.Tag = "رزومه پیشنهاد";
                    file.UpdateDate = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }
            }
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageProjectProposal)]
        [HttpPatch("proposals/{proposalId:long}/status")]
        public async Task<IActionResult> UpdateProposalStatus(long proposalId, [FromBody] UpdateProposalStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.UpdateProposalStatusAsync(proposalId, request.Status, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageProjectProposal)]
        [HttpPost("proposals/{proposalId:long}/accept")]
        public async Task<IActionResult> AcceptProposal(long proposalId, [FromBody] AcceptProposalRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestones = request.Milestones.Select(x => x.ToEntity()).ToList();
            var result = await _projectRep.AcceptProposalAsync(proposalId, userId, milestones);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageProjectProposal)]
        [HttpPost("proposals/{proposalId:long}/counter-offer")]
        public async Task<IActionResult> CreateProposalCounterOffer(long proposalId, [FromBody] CreateProposalCounterOfferRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var proposal = await _context.Proposals
                .Include(x => x.Project)
                .SingleOrDefaultAsync(x => x.ID == proposalId && x.Project.EmployerUserId == userId);

            if (proposal == null)
            {
                return Forbid();
            }

            if (proposal.Project.Status is not (ProjectStatus.Published or ProjectStatus.Bidding))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این پروژه دیگر در مرحله مذاکره پیشنهاد نیست" });
            }

            bool hasContract = await _context.Contracts.AnyAsync(x => x.ProjectId == proposal.ProjectId);
            if (hasContract)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این پروژه قرارداد ساخته شده و مذاکره جدید مجاز نیست" });
            }

            proposal.CounterPrice = request.CounterPrice;
            proposal.CounterDays = request.CounterDays;
            proposal.CounterMessage = request.Message?.Trim();
            proposal.CounterOfferAt = DateTime.UtcNow;
            proposal.CounterAcceptedAt = null;
            proposal.CounterRejectedAt = null;
            proposal.Status = ProposalStatus.Shortlisted;
            proposal.UpdateDate = DateTime.UtcNow;

            await AddProjectActivityAsync(
                proposal.ProjectId,
                userId,
                ProjectActivityType.DecisionRecorded,
                "پیشنهاد اصلاح قیمت/زمان ارسال شد",
                $"{{\"proposalId\":{proposal.ID},\"counterPrice\":{request.CounterPrice},\"counterDays\":{request.CounterDays}}}");

            await _userNotificationService.AddInAppAsync(
                proposal.FreelancerUserId,
                $"کارفرما برای پروژه «{proposal.Project.Title}» قیمت/زمان جدید پیشنهاد کرد.",
                NotificationCategory.Project,
                userId);

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = proposal.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.SubmitProposal)]
        [HttpPost("proposals/{proposalId:long}/counter-offer/respond")]
        public async Task<IActionResult> RespondProposalCounterOffer(long proposalId, [FromBody] RespondProposalCounterOfferRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var proposal = await _context.Proposals
                .Include(x => x.Project)
                .SingleOrDefaultAsync(x => x.ID == proposalId && x.FreelancerUserId == userId);

            if (proposal == null)
            {
                return Forbid();
            }

            if (proposal.CounterPrice == null || proposal.CounterDays == null || proposal.CounterOfferAt == null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "پیشنهاد اصلاحی فعالی برای پاسخ وجود ندارد" });
            }

            bool hasContract = await _context.Contracts.AnyAsync(x => x.ProjectId == proposal.ProjectId);
            if (hasContract)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این پروژه قرارداد ساخته شده و پاسخ به مذاکره مجاز نیست" });
            }

            if (request.Accepted)
            {
                proposal.ProposedPrice = proposal.CounterPrice.Value;
                proposal.ProposedDays = proposal.CounterDays.Value;
                proposal.CounterAcceptedAt = DateTime.UtcNow;
                proposal.CounterRejectedAt = null;
                proposal.Status = ProposalStatus.Shortlisted;
            }
            else
            {
                proposal.CounterRejectedAt = DateTime.UtcNow;
                proposal.CounterAcceptedAt = null;
                proposal.Status = ProposalStatus.Sent;
            }

            proposal.UpdateDate = DateTime.UtcNow;

            await AddProjectActivityAsync(
                proposal.ProjectId,
                userId,
                ProjectActivityType.DecisionRecorded,
                request.Accepted ? "مجری پیشنهاد اصلاحی را پذیرفت" : "مجری پیشنهاد اصلاحی را رد کرد",
                $"{{\"proposalId\":{proposal.ID},\"accepted\":{request.Accepted.ToString().ToLowerInvariant()},\"message\":\"{EscapeJson(request.Message)}\"}}");

            await _userNotificationService.AddInAppAsync(
                proposal.Project.EmployerUserId,
                request.Accepted
                    ? $"مجری قیمت/زمان اصلاحی پروژه {proposal.Project.Title} را پذیرفت."
                    : $"مجری قیمت/زمان اصلاحی پروژه {proposal.Project.Title} را رد کرد.",
                NotificationCategory.Project,
                userId);

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = proposal.ID });
        }

        [Authorize]
        [HttpGet("contracts/{contractId:long}/milestones")]
        public async Task<IActionResult> GetMilestones(long contractId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.GetContractMilestonesAsync(contractId, userId, pageIndex, pageSize);
            var mapped = result.Map(MilestoneResponse.FromEntity);
            await PopulateMilestoneEscrowsAsync(mapped.Results);
            return result.Status ? Ok(mapped) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnProject)]
        [HttpPost("contracts/{contractId:long}/milestones")]
        public async Task<IActionResult> AddMilestone(long contractId, [FromBody] CreateContractMilestoneRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.AddMilestoneAsync(contractId, userId, request.ToEntity());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpPatch("milestones/{milestoneId:long}/status")]
        public async Task<IActionResult> UpdateMilestoneStatus(long milestoneId, [FromBody] UpdateMilestoneStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _projectRep.UpdateMilestoneStatusAsync(milestoneId, userId, request.Status);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/hold")]
        public async Task<IActionResult> HoldMilestoneEscrow(long milestoneId, [FromBody] HoldProjectMilestoneEscrowRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            if (!milestone.Contract.ContractorUserId.HasValue)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای قرارداد این مرحله مجری مشخص نشده است" });
            }

            var currency = milestone.Contract.Project?.Currency ?? "IRR";
            var payerWalletId = request.PayerWalletId ?? (await GetOrCreateUserWalletAsync(userId, currency)).ID;
            var payeeWalletId = request.PayeeWalletId ?? (await GetOrCreateUserWalletAsync(milestone.Contract.ContractorUserId.Value, currency)).ID;

            var result = await _financeRep.HoldEscrowAsync(
                payerWalletId,
                payeeWalletId,
                milestone.Amount,
                "ProjectMilestone",
                milestone.ID);

            if (result.Status)
            {
                milestone.Status = MilestoneStatus.InProgress;
                milestone.UpdateDate = DateTime.UtcNow;
                await _userNotificationService.AddInAppAsync(
                    milestone.Contract.ContractorUserId.Value,
                    $"وجه مرحله «{milestone.Title}» پروژه «{milestone.Contract.Project?.Title ?? $"#{milestone.Contract.ProjectId}"}» در Escrow نگهداری شد.",
                    NotificationCategory.Financial,
                    userId);
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/{escrowId:long}/release")]
        public async Task<IActionResult> ReleaseMilestoneEscrow(long milestoneId, long escrowId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            bool hasActiveDispute = await HasActiveMilestoneDisputeAsync(milestoneId);
            if (hasActiveDispute)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این مرحله اختلاف فعال وجود دارد و آزادسازی وجه مجاز نیست" });
            }

            var result = await _financeRep.ReleaseEscrowAsync(escrowId);
            if (result.Status)
            {
                milestone.Status = MilestoneStatus.Approved;
                milestone.UpdateDate = DateTime.UtcNow;
                if (milestone.Contract.ContractorUserId.HasValue)
                {
                    await _userNotificationService.AddInAppAsync(
                        milestone.Contract.ContractorUserId.Value,
                        $"وجه مرحله «{milestone.Title}» پروژه «{milestone.Contract.Project?.Title ?? $"#{milestone.Contract.ProjectId}"}» آزاد شد.",
                        NotificationCategory.Financial,
                        userId);
                }
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.UseWallet)]
        [HttpPost("milestones/{milestoneId:long}/escrow/{escrowId:long}/refund")]
        public async Task<IActionResult> RefundMilestoneEscrow(long milestoneId, long escrowId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await GetMilestoneForEmployerAsync(milestoneId, userId);
            if (milestone == null)
            {
                return Forbid();
            }

            bool hasActiveDispute = await HasActiveMilestoneDisputeAsync(milestoneId);
            if (hasActiveDispute)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این مرحله اختلاف فعال وجود دارد و بازگشت وجه عادی مجاز نیست" });
            }

            var result = await _financeRep.RefundEscrowAsync(escrowId);
            if (result.Status)
            {
                milestone.Status = MilestoneStatus.Rejected;
                milestone.UpdateDate = DateTime.UtcNow;
                await _userNotificationService.AddInAppAsync(
                    milestone.Contract.EmployerUserId,
                    $"وجه مرحله «{milestone.Title}» پروژه «{milestone.Contract.Project?.Title ?? $"#{milestone.Contract.ProjectId}"}» به کیف پول شما برگشت داده شد.",
                    NotificationCategory.Financial,
                    userId);
                await _context.SaveChangesAsync();
            }

            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpPost("milestones/{milestoneId:long}/deliverables")]
        public async Task<IActionResult> SubmitDeliverable(long milestoneId, [FromBody] SubmitDeliverableRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var milestone = await _context.Milestones
                .Include(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == milestoneId && x.Contract.ContractorUserId == userId);

            if (milestone == null)
            {
                return Forbid();
            }

            var deliverable = new Deliverable
            {
                MilestoneId = milestoneId,
                Note = request.Note,
                FileUploadId = request.FileUploadId,
                SubmittedAt = DateTime.UtcNow,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true,
                CreatorId = userId
            };

            milestone.Status = MilestoneStatus.Submitted;
            milestone.UpdateDate = DateTime.UtcNow;

            await _context.Deliverables.AddAsync(deliverable);
            await AddProjectActivityAsync(
                milestone.Contract.ProjectId,
                userId,
                ProjectActivityType.DeliverableSubmitted,
                "تحویل مرحله ثبت شد",
                $"{{\"milestoneId\":{milestoneId}}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = deliverable.ID });
        }

        [Authorize]
        [HttpPost("deliverables/{deliverableId:long}/approve")]
        public async Task<IActionResult> ApproveDeliverable(long deliverableId, [FromBody] ReviewDeliverableRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var deliverable = await _context.Deliverables
                .Include(x => x.Milestone)
                    .ThenInclude(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == deliverableId && x.Milestone.Contract.EmployerUserId == userId);

            if (deliverable == null)
            {
                return Forbid();
            }

            deliverable.ApprovedAt = DateTime.UtcNow;
            deliverable.UpdateDate = DateTime.UtcNow;
            deliverable.Milestone.Status = MilestoneStatus.Approved;
            deliverable.Milestone.UpdateDate = DateTime.UtcNow;

            await AddProjectActivityAsync(
                deliverable.Milestone.Contract.ProjectId,
                userId,
                ProjectActivityType.DecisionRecorded,
                "تحویل مرحله تایید شد",
                $"{{\"milestoneId\":{deliverable.MilestoneId},\"deliverableId\":{deliverableId},\"note\":\"{EscapeJson(request.Note)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = deliverable.ID });
        }

        [Authorize]
        [HttpPost("deliverables/{deliverableId:long}/request-revision")]
        public async Task<IActionResult> RequestDeliverableRevision(long deliverableId, [FromBody] ReviewDeliverableRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var deliverable = await _context.Deliverables
                .Include(x => x.Milestone)
                    .ThenInclude(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == deliverableId && x.Milestone.Contract.EmployerUserId == userId);

            if (deliverable == null)
            {
                return Forbid();
            }

            deliverable.UpdateDate = DateTime.UtcNow;
            deliverable.Milestone.Status = MilestoneStatus.Rejected;
            deliverable.Milestone.UpdateDate = DateTime.UtcNow;

            await AddProjectActivityAsync(
                deliverable.Milestone.Contract.ProjectId,
                userId,
                ProjectActivityType.DecisionRecorded,
                "درخواست اصلاح تحویل ثبت شد",
                $"{{\"milestoneId\":{deliverable.MilestoneId},\"deliverableId\":{deliverableId},\"note\":\"{EscapeJson(request.Note)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = deliverable.ID });
        }

        [Authorize]
        [HttpPost("contracts/{contractId:long}/timesheets")]
        public async Task<IActionResult> AddTimesheet(long contractId, [FromBody] CreateTimesheetRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var contract = await _context.Contracts.SingleOrDefaultAsync(x =>
                x.ID == contractId &&
                (x.EmployerUserId == userId || x.ContractorUserId == userId) &&
                x.Status == ContractStatus.Active);

            if (contract == null)
            {
                return Forbid();
            }

            bool duplicate = await _context.Timesheets.AnyAsync(x => x.ContractId == contractId && x.UserId == userId && x.Date == request.Date);
            if (duplicate)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این تاریخ قبلاً تایم‌شیت ثبت شده است" });
            }

            var timesheet = request.ToEntity(contractId, userId);
            timesheet.CreateDate = DateTime.UtcNow;
            timesheet.UpdateDate = DateTime.UtcNow;
            timesheet.CreatorId = userId;
            timesheet.IsActive = true;

            await _context.Timesheets.AddAsync(timesheet);
            await AddProjectActivityAsync(
                contract.ProjectId,
                userId,
                ProjectActivityType.MilestoneUpdated,
                "تایم‌شیت پروژه ثبت شد",
                $"{{\"contractId\":{contractId},\"minutes\":{request.Minutes}}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = timesheet.ID });
        }

        [Authorize]
        [HttpPatch("timesheets/{timesheetId:long}/status")]
        public async Task<IActionResult> UpdateTimesheetStatus(long timesheetId, [FromBody] UpdateTimesheetStatusRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var timesheet = await _context.Timesheets
                .Include(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == timesheetId && x.Contract.EmployerUserId == userId);

            if (timesheet == null)
            {
                return Forbid();
            }

            timesheet.Status = request.Status;
            timesheet.UpdateDate = DateTime.UtcNow;

            await AddProjectActivityAsync(
                timesheet.Contract.ProjectId,
                userId,
                ProjectActivityType.DecisionRecorded,
                "وضعیت تایم‌شیت تغییر کرد",
                $"{{\"timesheetId\":{timesheetId},\"status\":\"{request.Status}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = timesheet.ID });
        }

        [Authorize]
        [HttpPost("contracts/{contractId:long}/complete")]
        public async Task<IActionResult> CompleteContract(long contractId, [FromBody] CompleteProjectRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var contract = await _context.Contracts
                .Include(x => x.Project)
                .Include(x => x.Milestones)
                    .ThenInclude(x => x.Deliverables)
                .SingleOrDefaultAsync(x => x.ID == contractId && x.EmployerUserId == userId);

            if (contract == null)
            {
                return Forbid();
            }

            if (contract.Status != ContractStatus.Active)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "قرارداد فعال نیست" });
            }

            bool hasPendingMilestones = contract.Milestones.Any(x => x.Status != MilestoneStatus.Approved);
            if (hasPendingMilestones)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "همه مراحل باید قبل از اختتام تایید شوند" });
            }

            contract.Status = ContractStatus.Completed;
            contract.UpdateDate = DateTime.UtcNow;
            contract.Project.Status = ProjectStatus.Done;
            contract.Project.ClosedAt = DateTime.UtcNow;
            contract.Project.UpdateDate = DateTime.UtcNow;

            if (request.AddToContractorPortfolio && contract.ContractorUserId.HasValue)
            {
                bool portfolioExists = await _context.PortfolioItems.AnyAsync(x =>
                    x.OwnerType == PortfolioOwnerType.User &&
                    x.OwnerId == contract.ContractorUserId.Value &&
                    x.SourceType == PortfolioSourceType.CompletedProject &&
                    x.SourceId == contract.ProjectId);

                if (!portfolioExists)
                {
                    await _context.PortfolioItems.AddAsync(new PortfolioItem
                    {
                        OwnerType = PortfolioOwnerType.User,
                        OwnerId = contract.ContractorUserId.Value,
                        SourceType = PortfolioSourceType.CompletedProject,
                        SourceId = contract.ProjectId,
                        Title = contract.Project.Title,
                        Description = contract.Project.Description,
                        ExternalUrl = request.PortfolioExternalUrl,
                        IsPublic = true,
                        CreateDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow,
                        IsActive = true,
                        CreatorId = userId
                    });
                }
            }

            await AddProjectActivityAsync(
                contract.ProjectId,
                userId,
                ProjectActivityType.StatusChanged,
                "پروژه مختومه شد",
                $"{{\"contractId\":{contractId}}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = contract.ID });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateAdminProjectStatus(long id, [FromBody] AdminUpdateProjectStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects.SingleOrDefaultAsync(x => x.ID == id);
            if (project == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "پروژه پیدا نشد" });
            }

            project.Status = request.Status;
            project.UpdateDate = DateTime.UtcNow;
            if (request.Status is ProjectStatus.Done or ProjectStatus.Cancelled)
            {
                project.ClosedAt ??= DateTime.UtcNow;
            }

            await AddProjectActivityAsync(
                project.ID,
                userId,
                ProjectActivityType.StatusChanged,
                "وضعیت پروژه توسط ادمین تغییر کرد",
                $"{{\"status\":\"{request.Status}\",\"note\":\"{EscapeJson(request.Note)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = project.ID });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPost("admin/{id:long}/block")]
        public async Task<IActionResult> BlockProject(long id, [FromBody] AdminUpdateProjectStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var project = await _context.Projects
                .Include(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == id);

            if (project == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "پروژه پیدا نشد" });
            }

            project.Status = ProjectStatus.Cancelled;
            project.IsActive = false;
            project.ClosedAt ??= DateTime.UtcNow;
            project.UpdateDate = DateTime.UtcNow;

            if (project.Contract != null && project.Contract.Status == ContractStatus.Active)
            {
                project.Contract.Status = ContractStatus.Terminated;
                project.Contract.UpdateDate = DateTime.UtcNow;
            }

            await AddProjectActivityAsync(
                project.ID,
                userId,
                ProjectActivityType.StatusChanged,
                "پروژه توسط ادمین مسدود شد",
                $"{{\"note\":\"{EscapeJson(request.Note)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = project.ID });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPost("admin/{id:long}/contract/terminate")]
        public async Task<IActionResult> TerminateProjectContract(long id, [FromBody] AdminUpdateProjectStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var contract = await _context.Contracts.SingleOrDefaultAsync(x => x.ProjectId == id && x.Status == ContractStatus.Active);
            if (contract == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "قرارداد فعال برای این پروژه پیدا نشد" });
            }

            contract.Status = ContractStatus.Terminated;
            contract.UpdateDate = DateTime.UtcNow;

            var project = await _context.Projects.SingleOrDefaultAsync(x => x.ID == id);
            if (project != null)
            {
                project.Status = ProjectStatus.Cancelled;
                project.ClosedAt ??= DateTime.UtcNow;
                project.UpdateDate = DateTime.UtcNow;
            }

            await AddProjectActivityAsync(
                id,
                userId,
                ProjectActivityType.StatusChanged,
                "قرارداد پروژه توسط ادمین خاتمه داده شد",
                $"{{\"contractId\":{contract.ID},\"note\":\"{EscapeJson(request.Note)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = contract.ID });
        }

        [Authorize]
        [HttpGet("{id:long}/documents")]
        public async Task<IActionResult> GetDocuments(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            var query = _context.FileUploads
                .AsNoTracking()
                .Where(x => x.EntityType == "Project" && x.ForeignKeyId == id);
            var totalCount = await query.CountAsync();
            var documents = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .Select(x => ProjectDocumentResponse.FromEntity(x))
                .ToListAsync();

            return Ok(new ListResultObject<ProjectDocumentResponse> { Results = documents, TotalCount = totalCount, PageCount = DbTools.GetPageCount(totalCount, pageSize) });
        }

        [Authorize]
        [HttpPost("{id:long}/documents")]
        public async Task<IActionResult> AttachDocument(long id, [FromBody] AttachProjectDocumentRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            var file = await _context.FileUploads.SingleOrDefaultAsync(x => x.ID == request.FileUploadId);
            if (file == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "فایل پیدا نشد" });
            }

            file.ForeignKeyId = id;
            file.EntityType = "Project";
            file.Tag = string.IsNullOrWhiteSpace(request.Title) ? "ProjectDocument" : request.Title.Trim();
            file.Note = request.Note;
            file.UpdateDate = DateTime.UtcNow;
            if (file.CreatorId <= 0)
            {
                file.CreatorId = userId;
            }

            await AddProjectActivityAsync(
                id,
                userId,
                ProjectActivityType.DocumentAdded,
                "مستند پروژه اضافه شد",
                $"{{\"fileUploadId\":{file.ID},\"title\":\"{EscapeJson(file.Tag)}\"}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = file.ID });
        }

        [Authorize]
        [HttpGet("{id:long}/conversation")]
        public async Task<IActionResult> GetConversation(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            var conversation = await GetOrCreateProjectConversationAsync(id);
            return Ok(new RowResultObject<ProjectConversationResponse> { Result = ProjectConversationResponse.FromEntity(conversation) });
        }

        [Authorize]
        [HttpPost("{id:long}/messages")]
        public async Task<IActionResult> SendMessage(long id, [FromBody] SendProjectMessageRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            if (string.IsNullOrWhiteSpace(request.Text) && request.FileUploadId == null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "متن یا فایل پیام الزامی است" });
            }

            var conversation = await GetOrCreateProjectConversationAsync(id);
            var message = new Message
            {
                ConversationId = conversation.ID,
                SenderUserId = userId,
                MessageType = request.FileUploadId.HasValue ? MessageType.File : MessageType.Text,
                Text = string.IsNullOrWhiteSpace(request.Text) ? null : request.Text.Trim(),
                FileUploadId = request.FileUploadId,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            await _context.Messages.AddAsync(message);
            await AddProjectActivityAsync(
                id,
                userId,
                ProjectActivityType.MessageSent,
                "پیام پروژه ارسال شد",
                $"{{\"conversationId\":{conversation.ID}}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = message.ID });
        }

        [Authorize]
        [HttpGet("{id:long}/disputes")]
        public async Task<IActionResult> GetDisputes(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()) && !User.IsInRole(RoleNames.Arbitrator))
            {
                return Forbid();
            }

            var query = _context.Disputes
                .AsNoTracking()
                .AsSplitQuery()
                .Include(x => x.OpenedByUser)
                .Include(x => x.RespondentUser)
                .Include(x => x.EvidenceItems)
                    .ThenInclude(x => x.FileUpload)
                .Include(x => x.EvidenceItems)
                    .ThenInclude(x => x.SubmittedByUser)
                .Where(x =>
                    (x.ContextType == DisputeContextType.Project && x.ContextId == id) ||
                    (x.ContextType == DisputeContextType.Milestone && _context.Milestones.Any(m => m.ID == x.ContextId && m.Contract.ProjectId == id)) ||
                    (x.ContextType == DisputeContextType.Contract && _context.Contracts.Any(c => c.ID == x.ContextId && c.ProjectId == id)));
            var totalCount = await query.CountAsync();
            var disputes = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .Select(x => ProjectDisputeResponse.FromEntity(x))
                .ToListAsync();

            return Ok(new ListResultObject<ProjectDisputeResponse> { Results = disputes, TotalCount = totalCount, PageCount = DbTools.GetPageCount(totalCount, pageSize) });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin + "," + RoleNames.Arbitrator)]
        [HttpGet("admin/disputes")]
        public async Task<IActionResult> GetAdminDisputes([FromQuery] DisputeStatus? status = null, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 50)
        {
            var query = _context.Disputes
                .AsNoTracking()
                .Include(x => x.OpenedByUser)
                .Include(x => x.RespondentUser)
                .Include(x => x.Decision)
                .Include(x => x.EvidenceItems)
                    .ThenInclude(x => x.FileUpload)
                .Include(x => x.EvidenceItems)
                    .ThenInclude(x => x.SubmittedByUser)
                .Where(x =>
                    (status == null || x.Status == status) &&
                    (x.ContextType == DisputeContextType.Project ||
                     x.ContextType == DisputeContextType.Contract ||
                     x.ContextType == DisputeContextType.Milestone));

            var result = new ListResultObject<ProjectDisputeResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var disputes = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            result.Results = disputes.Select(ProjectDisputeResponse.FromEntity).ToList();
            return Ok(result);
        }

        [Authorize]
        [HttpPost("{id:long}/disputes")]
        public async Task<IActionResult> OpenDispute(long id, [FromBody] OpenProjectDisputeRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var project = await _context.Projects
                .Include(x => x.Contract)
                .SingleOrDefaultAsync(x => x.ID == id);

            if (project == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "پروژه پیدا نشد" });
            }

            if (!await _projectAccessService.CanAccessAsync(id, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            long? respondentUserId = project.EmployerUserId == userId
                ? project.Contract?.ContractorUserId
                : project.EmployerUserId;

            if (request.MilestoneId.HasValue)
            {
                bool milestoneBelongsToProject = await _context.Milestones.AnyAsync(x => x.ID == request.MilestoneId.Value && x.Contract.ProjectId == id);
                if (!milestoneBelongsToProject)
                {
                    return BadRequest(new BitResultObject { Status = false, ErrorMessage = "مرحله انتخاب‌شده متعلق به این پروژه نیست" });
                }
            }

            bool duplicateOpen = await _context.Disputes.AnyAsync(x =>
                x.ContextType == (request.MilestoneId.HasValue ? DisputeContextType.Milestone : DisputeContextType.Project) &&
                x.ContextId == (request.MilestoneId ?? id) &&
                x.Status != DisputeStatus.Closed &&
                x.Status != DisputeStatus.Cancelled);

            if (duplicateOpen)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این بخش اختلاف فعال وجود دارد" });
            }

            var dispute = new Dispute
            {
                ContextType = request.MilestoneId.HasValue ? DisputeContextType.Milestone : DisputeContextType.Project,
                ContextId = request.MilestoneId ?? id,
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

            if (request.FileUploadId.HasValue)
            {
                await _context.DisputeEvidenceItems.AddAsync(new DisputeEvidence
                {
                    Dispute = dispute,
                    SubmittedByUserId = userId,
                    FileUploadId = request.FileUploadId,
                    Title = string.IsNullOrWhiteSpace(request.EvidenceTitle) ? "مستند اولیه اختلاف" : request.EvidenceTitle.Trim(),
                    Note = request.EvidenceNote,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    CreatorId = userId,
                    IsActive = true
                });
            }

            project.Status = ProjectStatus.Disputed;
            project.UpdateDate = DateTime.UtcNow;

            if (request.MilestoneId.HasValue)
            {
                var escrows = await _context.Escrows
                    .Where(x => x.ContextType == "ProjectMilestone" && x.ContextId == request.MilestoneId.Value && x.Status == EscrowStatus.Held)
                    .ToListAsync();

                foreach (var escrow in escrows)
                {
                    escrow.Status = EscrowStatus.Disputed;
                    escrow.UpdateDate = DateTime.UtcNow;
                }
            }

            await AddProjectActivityAsync(
                id,
                userId,
                ProjectActivityType.DisputeOpened,
                "اختلاف پروژه ثبت شد",
                $"{{\"contextType\":\"{dispute.ContextType}\",\"contextId\":{dispute.ContextId}}}");

            if (respondentUserId.HasValue)
            {
                await _userNotificationService.AddInAppAsync(
                    respondentUserId.Value,
                    $"برای پروژه «{project.Title}» پرونده اختلاف «{dispute.Title}» ثبت شد.",
                    NotificationCategory.Dispute,
                    userId);
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = dispute.ID });
        }

        [Authorize]
        [HttpPost("disputes/{disputeId:long}/evidence")]
        public async Task<IActionResult> AddDisputeEvidence(long disputeId, [FromBody] AddProjectDisputeEvidenceRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var dispute = await _context.Disputes.SingleOrDefaultAsync(x => x.ID == disputeId);
            if (dispute == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "پرونده اختلاف پیدا نشد" });
            }

            var projectId = await ResolveProjectIdForDisputeAsync(dispute);
            if (projectId == null || !await _projectAccessService.CanAccessAsync(projectId.Value, userId, IsProjectAdministrator()))
            {
                return Forbid();
            }

            var evidence = new DisputeEvidence
            {
                DisputeId = disputeId,
                SubmittedByUserId = userId,
                FileUploadId = request.FileUploadId,
                Title = request.Title.Trim(),
                Note = request.Note,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            await _context.DisputeEvidenceItems.AddAsync(evidence);
            await AddProjectActivityAsync(
                projectId.Value,
                userId,
                ProjectActivityType.DocumentAdded,
                "مستند اختلاف اضافه شد",
                $"{{\"disputeId\":{disputeId},\"fileUploadId\":{request.FileUploadId}}}");

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = evidence.ID });
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin + "," + RoleNames.Arbitrator)]
        [HttpPost("disputes/{disputeId:long}/decision")]
        public async Task<IActionResult> ResolveDispute(long disputeId, [FromBody] ResolveProjectDisputeRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var dispute = await _context.Disputes
                .Include(x => x.Decision)
                .SingleOrDefaultAsync(x => x.ID == disputeId);

            if (dispute == null)
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "پرونده اختلاف پیدا نشد" });
            }

            if (dispute.Status is DisputeStatus.Closed or DisputeStatus.Cancelled)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این پرونده قابل رأی‌دهی نیست" });
            }

            var projectId = await ResolveProjectIdForDisputeAsync(dispute);
            if (projectId == null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "پروژه مرتبط با اختلاف پیدا نشد" });
            }

            if (dispute.Decision != null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "برای این پرونده قبلاً رأی ثبت شده است" });
            }

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var decision = new ArbitrationDecision
                {
                    DisputeId = disputeId,
                    DecidedByUserId = userId,
                    DecisionType = request.DecisionType,
                    DecisionText = request.DecisionText,
                    ReleaseAmount = request.ReleaseAmount,
                    RefundAmount = request.RefundAmount,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    CreatorId = userId,
                    IsActive = true
                };

                await _context.ArbitrationDecisions.AddAsync(decision);

                if (request.ExecuteFinancialDecision)
                {
                    var execution = await ExecuteProjectDisputeDecisionAsync(dispute, decision);
                    if (!execution.Status)
                    {
                        await tx.RollbackAsync();
                        return BadRequest(execution);
                    }
                }

                dispute.Status = DisputeStatus.Decided;
                dispute.DecidedAt = DateTime.UtcNow;
                dispute.ClosedAt = DateTime.UtcNow;
                dispute.UpdateDate = DateTime.UtcNow;

                var project = await _context.Projects.SingleOrDefaultAsync(x => x.ID == projectId.Value);
                if (project != null && project.Status == ProjectStatus.Disputed)
                {
                    project.Status = ProjectStatus.InProgress;
                    project.UpdateDate = DateTime.UtcNow;
                }

                await AddProjectActivityAsync(
                    projectId.Value,
                    userId,
                    ProjectActivityType.DecisionRecorded,
                    "رأی داوری اختلاف ثبت شد",
                    $"{{\"disputeId\":{disputeId},\"decisionType\":\"{request.DecisionType}\"}}");

                await _userNotificationService.AddInAppAsync(
                    dispute.OpenedByUserId,
                    $"رأی داوری برای پرونده «{dispute.Title}» ثبت شد.",
                    NotificationCategory.Dispute,
                    userId);
                if (dispute.RespondentUserId.HasValue && dispute.RespondentUserId.Value != dispute.OpenedByUserId)
                {
                    await _userNotificationService.AddInAppAsync(
                        dispute.RespondentUserId.Value,
                        $"رأی داوری برای پرونده «{dispute.Title}» ثبت شد.",
                        NotificationCategory.Dispute,
                        userId);
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                return Ok(new BitResultObject { ID = dispute.ID });
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}" });
            }
        }

        [Authorize]
        [HttpGet("{id:long}/activity")]
        public async Task<IActionResult> GetActivity(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            bool canView = await _context.Projects.AnyAsync(x => x.ID == id && x.EmployerUserId == userId) ||
                           await _context.Contracts.AnyAsync(x => x.ProjectId == id && (x.EmployerUserId == userId || x.ContractorUserId == userId));

            if (!canView)
            {
                return Forbid();
            }

            var query = _context.ProjectActivityLogs
                .AsNoTracking()
                .Include(x => x.ActorUser)
                .Where(x => x.ProjectId == id);
            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .Select(x => ProjectActivityLogResponse.FromEntity(x))
                .ToListAsync();

            return Ok(new ListResultObject<ProjectActivityLogResponse> { Results = items, TotalCount = totalCount, PageCount = DbTools.GetPageCount(totalCount, pageSize) });
        }

        private async Task<Milestone?> GetMilestoneForEmployerAsync(long milestoneId, long employerUserId)
        {
            return await _context.Milestones
                .Include(x => x.Contract)
                    .ThenInclude(x => x.Project)
                .SingleOrDefaultAsync(x => x.ID == milestoneId && x.Contract.EmployerUserId == employerUserId);
        }

        private async Task<Wallet> GetOrCreateUserWalletAsync(long userId, string currency)
        {
            var wallet = await _context.Wallets.SingleOrDefaultAsync(x =>
                x.OwnerType == WalletOwnerType.User &&
                x.OwnerUserId == userId &&
                x.Currency == currency &&
                x.DeleteDate == null);

            if (wallet != null)
            {
                return wallet;
            }

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

        private async Task PopulateMilestoneEscrowsAsync(ICollection<MilestoneResponse>? milestones)
        {
            if (milestones == null || milestones.Count == 0)
            {
                return;
            }

            var milestoneIds = milestones.Select(x => x.Id).ToList();
            var escrows = await _context.Escrows
                .AsNoTracking()
                .Where(x => x.ContextType == "ProjectMilestone" && milestoneIds.Contains(x.ContextId))
                .ToListAsync();

            foreach (var milestone in milestones)
            {
                milestone.Escrows = escrows
                    .Where(x => x.ContextId == milestone.Id)
                    .OrderByDescending(x => x.CreateDate)
                    .Select(EscrowResponse.FromEntity)
                    .ToList();
            }
        }

        private async Task PopulateProposalResumeFilesAsync(ICollection<ProposalResponse>? proposals)
        {
            if (proposals == null || proposals.Count == 0)
            {
                return;
            }

            var proposalIds = proposals.Select(x => x.Id).ToList();
            var files = await _context.FileUploads
                .AsNoTracking()
                .Where(x => x.EntityType == "ProposalResume" && proposalIds.Contains(x.ForeignKeyId))
                .OrderByDescending(x => x.CreateDate)
                .ToListAsync();

            foreach (var proposal in proposals)
            {
                var file = files.FirstOrDefault(x => x.ForeignKeyId == proposal.Id);
                if (file != null)
                {
                    proposal.AttachResumeFile(file);
                }
            }
        }

        private async Task PopulateAdminProjectDisputeCountsAsync(ICollection<ProjectListItemResponse>? projects)
        {
            if (projects == null || projects.Count == 0)
            {
                return;
            }

            var projectIds = projects.Select(x => x.Id).ToList();
            var milestoneProjectPairs = await _context.Milestones
                .AsNoTracking()
                .Where(x => projectIds.Contains(x.Contract.ProjectId))
                .Select(x => new { x.ID, x.Contract.ProjectId })
                .ToListAsync();

            var milestoneProjectMap = milestoneProjectPairs.ToDictionary(x => x.ID, x => x.ProjectId);
            var milestoneIds = milestoneProjectMap.Keys.ToList();
            var contractIds = await _context.Contracts
                .AsNoTracking()
                .Where(x => projectIds.Contains(x.ProjectId))
                .Select(x => new { x.ID, x.ProjectId })
                .ToListAsync();
            var contractProjectMap = contractIds.ToDictionary(x => x.ID, x => x.ProjectId);
            var contractContextIds = contractProjectMap.Keys.ToList();

            var disputes = await _context.Disputes
                .AsNoTracking()
                .Where(x =>
                    x.Status != DisputeStatus.Closed &&
                    x.Status != DisputeStatus.Cancelled &&
                    ((x.ContextType == DisputeContextType.Project && projectIds.Contains(x.ContextId)) ||
                     (x.ContextType == DisputeContextType.Milestone && milestoneIds.Contains(x.ContextId)) ||
                     (x.ContextType == DisputeContextType.Contract && contractContextIds.Contains(x.ContextId))))
                .Select(x => new { x.ContextType, x.ContextId })
                .ToListAsync();

            foreach (var project in projects)
            {
                project.ActiveDisputesCount = disputes.Count(x =>
                    (x.ContextType == DisputeContextType.Project && x.ContextId == project.Id) ||
                    (x.ContextType == DisputeContextType.Milestone && milestoneProjectMap.TryGetValue(x.ContextId, out var milestoneProjectId) && milestoneProjectId == project.Id) ||
                    (x.ContextType == DisputeContextType.Contract && contractProjectMap.TryGetValue(x.ContextId, out var contractProjectId) && contractProjectId == project.Id));
            }
        }

        private async Task PopulateProjectProposalCountsAsync(ICollection<Project> projects)
        {
            if (projects.Count == 0) return;

            var projectIds = projects.Select(x => x.ID).ToList();
            var counts = await _context.Proposals
                .AsNoTracking()
                .Where(x => projectIds.Contains(x.ProjectId))
                .GroupBy(x => x.ProjectId)
                .Select(group => new { ProjectId = group.Key, Count = group.Count() })
                .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

            foreach (var project in projects)
            {
                project.QueryProposalsCount = counts.GetValueOrDefault(project.ID);
            }
        }

        private async Task AddProjectActivityAsync(long projectId, long actorUserId, ProjectActivityType activityType, string title, string? detailsJson = null)
        {
            await _context.ProjectActivityLogs.AddAsync(new ProjectActivityLog
            {
                ProjectId = projectId,
                ActorUserId = actorUserId,
                ActivityType = activityType,
                Title = title,
                DetailsJson = detailsJson,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            });
        }

        private bool IsProjectAdministrator()
        {
            return User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin);
        }

        private async Task<bool> HasActiveMilestoneDisputeAsync(long milestoneId)
        {
            return await _context.Disputes.AnyAsync(x =>
                x.ContextType == DisputeContextType.Milestone &&
                x.ContextId == milestoneId &&
                x.Status != DisputeStatus.Closed &&
                x.Status != DisputeStatus.Cancelled);
        }

        private async Task<Conversation> GetOrCreateProjectConversationAsync(long projectId)
        {
            var conversation = await _context.Conversations
                .Include(x => x.Members)
                    .ThenInclude(x => x.User)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.SenderUser)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.FileUpload)
                .SingleOrDefaultAsync(x => x.ContextType == ConversationContextType.Project && x.ContextId == projectId);

            if (conversation != null)
            {
                return conversation;
            }

            var project = await _context.Projects
                .AsNoTracking()
                .Include(x => x.Contract)
                .SingleAsync(x => x.ID == projectId);

            conversation = new Conversation
            {
                ContextType = ConversationContextType.Project,
                ContextId = projectId,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            conversation.Members.Add(new ConversationMember
            {
                UserId = project.EmployerUserId,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            });

            if (project.Contract?.ContractorUserId != null && project.Contract.ContractorUserId.Value != project.EmployerUserId)
            {
                conversation.Members.Add(new ConversationMember
                {
                    UserId = project.Contract.ContractorUserId.Value,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });
            }

            await _context.Conversations.AddAsync(conversation);
            await _context.SaveChangesAsync();

            return await _context.Conversations
                .Include(x => x.Members)
                    .ThenInclude(x => x.User)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.SenderUser)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.FileUpload)
                .SingleAsync(x => x.ID == conversation.ID);
        }

        private async Task<long?> ResolveProjectIdForDisputeAsync(Dispute dispute)
        {
            if (dispute.ContextType == DisputeContextType.Project)
            {
                return dispute.ContextId;
            }

            if (dispute.ContextType == DisputeContextType.Milestone)
            {
                return await _context.Milestones
                    .Where(x => x.ID == dispute.ContextId)
                    .Select(x => (long?)x.Contract.ProjectId)
                    .SingleOrDefaultAsync();
            }

            if (dispute.ContextType == DisputeContextType.Contract)
            {
                return await _context.Contracts
                    .Where(x => x.ID == dispute.ContextId)
                    .Select(x => (long?)x.ProjectId)
                    .SingleOrDefaultAsync();
            }

            return null;
        }

        private async Task<BitResultObject> ExecuteProjectDisputeDecisionAsync(Dispute dispute, ArbitrationDecision decision)
        {
            if (dispute.ContextType != DisputeContextType.Milestone)
            {
                decision.IsExecuted = true;
                decision.ExecutedAt = DateTime.UtcNow;
                return new BitResultObject { ID = decision.ID };
            }

            var escrow = await _context.Escrows.SingleOrDefaultAsync(x =>
                x.ContextType == "ProjectMilestone" &&
                x.ContextId == dispute.ContextId &&
                x.Status == EscrowStatus.Disputed);

            if (escrow == null)
            {
                decision.IsExecuted = true;
                decision.ExecutedAt = DateTime.UtcNow;
                return new BitResultObject { ID = decision.ID };
            }

            decimal releaseAmount = 0;
            decimal refundAmount = 0;

            switch (decision.DecisionType)
            {
                case ArbitrationDecisionType.ReleasePayment:
                    releaseAmount = escrow.Amount;
                    break;
                case ArbitrationDecisionType.RefundPayment:
                    refundAmount = escrow.Amount;
                    break;
                case ArbitrationDecisionType.PartialRelease:
                    releaseAmount = decision.ReleaseAmount ?? 0;
                    refundAmount = decision.RefundAmount ?? 0;
                    break;
                case ArbitrationDecisionType.ReviseWork:
                case ArbitrationDecisionType.NoAction:
                    escrow.Status = EscrowStatus.Held;
                    escrow.UpdateDate = DateTime.UtcNow;
                    decision.IsExecuted = true;
                    decision.ExecutedAt = DateTime.UtcNow;
                    return new BitResultObject { ID = decision.ID };
            }

            if (releaseAmount < 0 || refundAmount < 0 || releaseAmount + refundAmount <= 0 || releaseAmount + refundAmount > escrow.Amount)
            {
                return new BitResultObject { Status = false, ErrorMessage = "مبلغ رأی مالی معتبر نیست" };
            }

            if (releaseAmount > 0)
            {
                var payeeWallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == escrow.PayeeWalletId);
                if (payeeWallet == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "کیف پول مجری پیدا نشد" };
                }

                payeeWallet.Balance += releaseAmount;
                payeeWallet.UpdateDate = DateTime.UtcNow;
                await _context.Transactions.AddAsync(new Transaction
                {
                    WalletId = payeeWallet.ID,
                    TxType = TransactionType.Release,
                    Amount = releaseAmount,
                    ReferenceType = "ProjectDispute",
                    ReferenceId = dispute.ID,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            if (refundAmount > 0)
            {
                var payerWallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == escrow.PayerWalletId);
                if (payerWallet == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "کیف پول کارفرما پیدا نشد" };
                }

                payerWallet.Balance += refundAmount;
                payerWallet.UpdateDate = DateTime.UtcNow;
                await _context.Transactions.AddAsync(new Transaction
                {
                    WalletId = payerWallet.ID,
                    TxType = TransactionType.Refund,
                    Amount = refundAmount,
                    ReferenceType = "ProjectDispute",
                    ReferenceId = dispute.ID,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            escrow.Status = releaseAmount >= refundAmount ? EscrowStatus.Released : EscrowStatus.Refunded;
            escrow.UpdateDate = DateTime.UtcNow;
            decision.IsExecuted = true;
            decision.ExecutedAt = DateTime.UtcNow;

            return new BitResultObject { ID = escrow.ID };
        }

        private static string EscapeJson(string? value)
        {
            return string.IsNullOrWhiteSpace(value)
                ? string.Empty
                : value.Replace("\\", "\\\\").Replace("\"", "\\\"");
        }
    }

    public partial class ProjectsController
    {
        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
