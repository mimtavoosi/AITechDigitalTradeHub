using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Users;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserManagementController : ControllerBase
    {
        private static readonly HashSet<string> RequestableRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            RoleNames.Instructor,
            RoleNames.ServiceProvider,
            RoleNames.Fundraiser,
            RoleNames.Arbitrator,
            RoleNames.OrganizationAdmin
        };

        private readonly TheAppContext _context;

        public UserManagementController(TheAppContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.ID)
                .Select(x => new RoleOptionResponse { Id = x.ID, Name = x.Name, Description = x.Description })
                .ToListAsync();

            return Ok(roles);
        }

        [Authorize]
        [HttpGet("me/capabilities")]
        public async Task<IActionResult> GetMyCapabilities()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var roles = await _context.UserRoles
                .AsNoTracking()
                .Include(x => x.Role)
                .Where(x => x.UserId == userId && x.IsActive)
                .OrderBy(x => x.Role.Name)
                .ToListAsync();

            return Ok(roles.Select(UserRoleAssignmentResponse.FromEntity));
        }

        [Authorize]
        [HttpPost("me/capabilities")]
        public async Task<IActionResult> RequestCapability([FromBody] RequestUserRoleRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var roleName = request.RoleName.Trim();
            if (!RequestableRoles.Contains(roleName))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این قابلیت از پنل کاربر قابل درخواست نیست" });
            }

            var role = await _context.Roles.SingleOrDefaultAsync(x => x.Name == roleName && x.IsActive);
            if (role == null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نقش انتخاب‌شده پیدا نشد" });
            }

            var current = await _context.UserRoles.SingleOrDefaultAsync(x => x.UserId == userId && x.RoleId == role.ID);
            if (current == null)
            {
                current = new UserRole
                {
                    UserId = userId,
                    RoleId = role.ID,
                    Status = UserRoleAssignmentStatus.Pending,
                    RequestedAt = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.UserRoles.AddAsync(current);
            }
            else if (current.Status == UserRoleAssignmentStatus.Rejected || current.Status == UserRoleAssignmentStatus.Suspended || !current.IsActive)
            {
                current.Status = UserRoleAssignmentStatus.Pending;
                current.RequestedAt = DateTime.UtcNow;
                current.RejectedAt = null;
                current.AdminNote = null;
                current.IsActive = true;
                current.UpdateDate = DateTime.UtcNow;
            }
            else
            {
                return Ok(new BitResultObject { ID = current.ID });
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = current.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] long roleId = 0,
            [FromQuery] UserStatus? status = null,
            [FromQuery] bool? isVerified = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var query = _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .Where(x =>
                    (status == null || x.Status == status) &&
                    (isVerified == null || x.IsVerified == isVerified) &&
                    (roleId <= 0 || x.UserRoles.Any(ur => ur.RoleId == roleId && ur.IsActive)) &&
                    (string.IsNullOrEmpty(searchText) ||
                     x.FirstName.Contains(searchText) ||
                     x.LastName.Contains(searchText) ||
                     x.Email.Contains(searchText) ||
                     x.Username.Contains(searchText)));

            var result = new ListResultObject<AdminUserListItemResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var users = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();
            result.Results = users.Select(AdminUserListItemResponse.FromEntity).ToList();

            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin/{id:long}")]
        public async Task<IActionResult> GetUser(long id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .SingleOrDefaultAsync(x => x.ID == id);

            return user == null ? NotFound() : Ok(AdminUserListItemResponse.FromEntity(user));
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin/capability-requests")]
        public async Task<IActionResult> GetCapabilityRequests([FromQuery] UserRoleAssignmentStatus? status = null)
        {
            var query = _context.UserRoles
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Role)
                .Where(x => x.IsActive && (status == null || x.Status == status));

            var items = await query.OrderByDescending(x => x.RequestedAt).ToListAsync();
            return Ok(items.Select(UserRoleAssignmentResponse.FromEntity));
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/capability-requests/{id:long}")]
        public async Task<IActionResult> UpdateCapabilityRequest(long id, [FromBody] UpdateUserRoleStatusRequest request)
        {
            var adminUserId = GetCurrentUserId();
            var assignment = await _context.UserRoles.SingleOrDefaultAsync(x => x.ID == id);
            if (assignment == null)
            {
                return NotFound();
            }

            assignment.Status = request.Status;
            assignment.AdminNote = request.AdminNote;
            assignment.UpdateDate = DateTime.UtcNow;
            assignment.IsActive = request.Status != UserRoleAssignmentStatus.Suspended;

            if (request.Status == UserRoleAssignmentStatus.Approved)
            {
                assignment.ApprovedAt = DateTime.UtcNow;
                assignment.ApprovedByUserId = adminUserId > 0 ? adminUserId : null;
                assignment.RejectedAt = null;
            }
            else if (request.Status == UserRoleAssignmentStatus.Rejected)
            {
                assignment.RejectedAt = DateTime.UtcNow;
            }

            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == assignment.UserId);
            if (user != null)
            {
                user.PermissionsVersion++;
                user.UpdateDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = assignment.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateUserStatusRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == id);
            if (user == null)
            {
                return NotFound();
            }

            user.Status = request.Status;
            user.IsActive = request.IsActive;
            user.PermissionsVersion++;
            user.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = user.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/{id:long}/verification")]
        public async Task<IActionResult> UpdateUserVerification(long id, [FromBody] UpdateUserVerificationRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == id);
            if (user == null)
            {
                return NotFound();
            }

            user.IsVerified = request.IsVerified;
            user.VerificationLevel = request.VerificationLevel;
            user.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = user.ID });
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
