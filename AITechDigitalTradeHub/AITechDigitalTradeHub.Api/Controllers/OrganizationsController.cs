using System.Security.Claims;
using System.Text.RegularExpressions;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Organizations;
using AITechDigitalTradeHub.Data.DataLayer;
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
    public class OrganizationsController : ControllerBase
    {
        private static readonly Regex SlugRegex = new("^[a-z0-9]+(?:-[a-z0-9]+)*$", RegexOptions.Compiled);
        private readonly TheAppContext _context;

        public OrganizationsController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetPublic(
            [FromQuery] OrganizationType? type,
            [FromQuery] string searchText = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            pageIndex = Math.Max(1, pageIndex);
            pageSize = Math.Clamp(pageSize, 1, 100);
            searchText = searchText.Trim();
            var query = _context.Organizations
                .AsNoTracking()
                .Include(x => x.OwnerUser)
                .Include(x => x.Members)
                .Include(x => x.Projects)
                .Where(x => x.Status == OrganizationStatus.Active && x.IsVerified && x.DeleteDate == null)
                .Where(x => !type.HasValue || x.Type == type)
                .Where(x => string.IsNullOrEmpty(searchText) || x.Title.Contains(searchText) || (x.Description != null && x.Description.Contains(searchText)));

            var total = await query.CountAsync();
            var organizations = await query.OrderByDescending(x => x.IsVerified).ThenBy(x => x.Title)
                .Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new ListResultObject<OrganizationResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = organizations.Select(OrganizationResponse.FromEntity).ToList()
            });
        }

        [HttpGet("{slug}")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetPublicBySlug(string slug)
        {
            var organization = await OrganizationQuery().AsNoTracking().SingleOrDefaultAsync(x =>
                x.Slug == slug && x.Status == OrganizationStatus.Active && x.IsVerified && x.DeleteDate == null);
            return organization == null ? NotFound() : Ok(new RowResultObject<OrganizationResponse> { Result = OrganizationResponse.FromEntity(organization) });
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine()
        {
            var userId = CurrentUserId();
            var organizations = await OrganizationQuery().AsNoTracking()
                .Where(x => x.DeleteDate == null && (x.OwnerUserId == userId || x.Members.Any(m => m.UserId == userId && m.IsActive && m.DeleteDate == null)))
                .OrderBy(x => x.Title).ToListAsync();
            return Ok(new ListResultObject<OrganizationResponse>
            {
                TotalCount = organizations.Count,
                PageCount = 1,
                Results = organizations.Select(OrganizationResponse.FromEntity).ToList()
            });
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] OrganizationUpsertRequest request)
        {
            var userId = CurrentUserId();
            if (userId <= 0) return Unauthorized();
            var validationError = await ValidateRequestAsync(request);
            if (validationError != null) return BadRequest(new BitResultObject { Status = false, ErrorMessage = validationError });

            var now = DateTime.UtcNow;
            var organization = new Organization
            {
                OwnerUserId = userId,
                Status = OrganizationStatus.PendingVerification,
                IsVerified = false,
                CreateDate = now,
                UpdateDate = now,
                IsActive = true
            };
            ApplyRequest(organization, request);
            organization.Members.Add(new OrganizationMember
            {
                UserId = userId,
                Role = OrgRole.OrgAdmin,
                IsActive = true,
                CanRequestCompanyPayments = true,
                CanApproveCompanyPayments = true,
                CreateDate = now,
                UpdateDate = now
            });
            await _context.Organizations.AddAsync(organization);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = organization.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.OrganizationManage)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] OrganizationUpsertRequest request)
        {
            var userId = CurrentUserId();
            var organization = await _context.Organizations.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (organization == null) return NotFound();
            if (!await CanManageAsync(id, userId)) return Forbid();
            var validationError = await ValidateRequestAsync(request, id);
            if (validationError != null) return BadRequest(new BitResultObject { Status = false, ErrorMessage = validationError });
            ApplyRequest(organization, request);
            organization.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = organization.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.OrganizationManage)]
        [HttpGet("{id:long}/members")]
        public async Task<IActionResult> GetMembers(long id)
        {
            var userId = CurrentUserId();
            if (!await CanManageAsync(id, userId)) return Forbid();
            var members = await _context.OrganizationMembers.AsNoTracking().Include(x => x.User)
                .Where(x => x.OrganizationId == id && x.DeleteDate == null).OrderBy(x => x.Role).ToListAsync();
            return Ok(new ListResultObject<OrganizationMemberResponse>
            {
                TotalCount = members.Count,
                PageCount = 1,
                Results = members.Select(OrganizationMemberResponse.FromEntity).ToList()
            });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.OrganizationManage)]
        [HttpPost("{id:long}/members")]
        public async Task<IActionResult> AddMember(long id, [FromBody] OrganizationMemberUpsertRequest request)
        {
            var userId = CurrentUserId();
            if (!await CanManageAsync(id, userId)) return Forbid();
            if (!await _context.Users.AnyAsync(x => x.ID == request.UserId && x.DeleteDate == null)) return BadRequest(new BitResultObject { Status = false, ErrorMessage = "کاربر پیدا نشد" });
            if (await _context.OrganizationMembers.AnyAsync(x => x.OrganizationId == id && x.UserId == request.UserId)) return Conflict(new BitResultObject { Status = false, ErrorMessage = "کاربر قبلا عضو این سازمان است" });
            var member = new OrganizationMember { OrganizationId = id, CreateDate = DateTime.UtcNow, UpdateDate = DateTime.UtcNow };
            ApplyMemberRequest(member, request);
            await _context.OrganizationMembers.AddAsync(member);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = member.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.OrganizationAdminManage)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdmin([FromQuery] OrganizationStatus? status, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 50)
        {
            pageIndex = Math.Max(1, pageIndex);
            pageSize = Math.Clamp(pageSize, 1, 100);
            var query = OrganizationQuery().AsNoTracking().Where(x => x.DeleteDate == null && (!status.HasValue || x.Status == status));
            var total = await query.CountAsync();
            var organizations = await query.OrderByDescending(x => x.CreateDate).Skip((pageIndex - 1) * pageSize).Take(pageSize).ToListAsync();
            return Ok(new ListResultObject<OrganizationResponse> { TotalCount = total, PageCount = DbTools.GetPageCount(total, pageSize), Results = organizations.Select(OrganizationResponse.FromEntity).ToList() });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.OrganizationAdminManage)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateStatus(long id, [FromBody] OrganizationStatusRequest request)
        {
            var organization = await _context.Organizations.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (organization == null) return NotFound();
            organization.Status = request.Status;
            organization.IsVerified = request.IsVerified && request.Status == OrganizationStatus.Active;
            organization.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = id });
        }

        private IQueryable<Organization> OrganizationQuery() => _context.Organizations
            .Include(x => x.OwnerUser).Include(x => x.Members).Include(x => x.Projects);

        private async Task<bool> CanManageAsync(long organizationId, long userId)
        {
            if (User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin)) return true;
            return await _context.Organizations.AnyAsync(x => x.ID == organizationId && x.OwnerUserId == userId) ||
                   await _context.OrganizationMembers.AnyAsync(x => x.OrganizationId == organizationId && x.UserId == userId && x.Role == OrgRole.OrgAdmin && x.IsActive && x.DeleteDate == null);
        }

        private async Task<string?> ValidateRequestAsync(OrganizationUpsertRequest request, long currentId = 0)
        {
            request.Slug = request.Slug.Trim().ToLowerInvariant();
            if (!SlugRegex.IsMatch(request.Slug)) return "شناسه URL فقط می‌تواند شامل حروف انگلیسی کوچک، عدد و خط تیره باشد";
            if (!Enum.IsDefined(request.Type)) return "نوع سازمان معتبر نیست";
            if (request.DefaultMemberPaymentLimit < 0) return "سقف پرداخت نمی‌تواند منفی باشد";
            return await _context.Organizations.AnyAsync(x => x.Slug == request.Slug && x.ID != currentId)
                ? "این شناسه URL قبلا استفاده شده است"
                : null;
        }

        private static void ApplyRequest(Organization organization, OrganizationUpsertRequest request)
        {
            organization.Title = request.Title.Trim();
            organization.Slug = request.Slug.Trim().ToLowerInvariant();
            organization.Type = request.Type;
            organization.NationalId = request.NationalId?.Trim();
            organization.Description = request.Description?.Trim();
            organization.WebsiteUrl = request.WebsiteUrl?.Trim();
            organization.PublicEmail = request.PublicEmail?.Trim();
            organization.PublicPhone = request.PublicPhone?.Trim();
            organization.RequireApprovalForMemberPayments = request.RequireApprovalForMemberPayments;
            organization.DefaultMemberPaymentLimit = request.DefaultMemberPaymentLimit;
        }

        private static void ApplyMemberRequest(OrganizationMember member, OrganizationMemberUpsertRequest request)
        {
            member.UserId = request.UserId;
            member.Role = request.Role;
            member.IsActive = true;
            member.CanRequestCompanyPayments = request.CanRequestOrganizationPayments;
            member.CanApproveCompanyPayments = request.CanApproveOrganizationPayments;
            member.PaymentLimit = request.PaymentLimit;
        }

        private long CurrentUserId() => long.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var userId) ? userId : 0;
    }
}
