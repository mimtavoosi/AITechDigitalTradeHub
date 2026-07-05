using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Admin;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTPermissionCenter.EFCore.Entities;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
    [Route("api/admin/access")]
    public class AdminAccessController : ControllerBase
    {
        private readonly TheAppContext _context;

        public AdminAccessController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles(
            [FromQuery] bool includeInactive = false,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string searchText = "")
        {
            var query = _context.Roles
                .AsNoTracking()
                .Include(x => x.UserRoles)
                .Include(x => x.PermissionRoles)
                    .ThenInclude(x => x.Permission)
                .Where(x => includeInactive || x.IsActive);

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var term = searchText.Trim();
                query = query.Where(x => x.Name.Contains(term) || (x.Description != null && x.Description.Contains(term)));
            }

            var total = await query.CountAsync();
            var roles = await query
                .OrderBy(x => x.Name)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<RoleManagementResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = roles.Select(RoleManagementResponse.FromEntity).ToList()
            });
        }

        [HttpGet("roles/{id:long}")]
        public async Task<IActionResult> GetRole(long id)
        {
            var role = await _context.Roles
                .AsNoTracking()
                .Include(x => x.UserRoles)
                .Include(x => x.PermissionRoles)
                    .ThenInclude(x => x.Permission)
                .SingleOrDefaultAsync(x => x.ID == id);

            return role == null
                ? NotFound()
                : Ok(new RowResultObject<RoleManagementResponse> { Result = RoleManagementResponse.FromEntity(role) });
        }

        [HttpPost("roles")]
        public async Task<IActionResult> CreateRole([FromBody] RoleUpsertRequest request)
        {
            var name = NormalizeKey(request.Name);
            if (await _context.Roles.AnyAsync(x => x.Name == name))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نقشی با این نام قبلا ثبت شده است" });
            }

            var role = new Role
            {
                Name = name,
                Description = request.Description?.Trim(),
                IsActive = request.IsActive,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                UserRoles = new List<UserRole>(),
                PermissionRoles = new List<MTPermissionCenter_PermissionRole>()
            };

            await _context.Roles.AddAsync(role);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = role.ID });
        }

        [HttpPut("roles/{id:long}")]
        public async Task<IActionResult> UpdateRole(long id, [FromBody] RoleUpsertRequest request)
        {
            var role = await _context.Roles.SingleOrDefaultAsync(x => x.ID == id);
            if (role == null) return NotFound();

            var name = NormalizeKey(request.Name);
            var isProtectedSystemRole = role.Name == RoleNames.Admin || role.Name == RoleNames.SuperAdmin;
            if (isProtectedSystemRole && (!request.IsActive || !string.Equals(role.Name, name, StringComparison.Ordinal)))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نام یا وضعیت فعال نقش‌های سیستمی اصلی قابل تغییر نیست" });
            }

            if (await _context.Roles.AnyAsync(x => x.ID != id && x.Name == name))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نقشی با این نام قبلا ثبت شده است" });
            }

            role.Name = name;
            role.Description = request.Description?.Trim();
            role.IsActive = request.IsActive;
            role.UpdateDate = DateTime.UtcNow;
            await IncrementPermissionsVersionForRoleAsync(role.ID);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = role.ID });
        }

        [HttpDelete("roles/{id:long}")]
        public async Task<IActionResult> DeactivateRole(long id)
        {
            var role = await _context.Roles.SingleOrDefaultAsync(x => x.ID == id);
            if (role == null) return NotFound();
            if (role.Name == RoleNames.SuperAdmin || role.Name == RoleNames.Admin)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نقش‌های سیستمی اصلی غیرفعال نمی‌شوند" });
            }

            role.IsActive = false;
            role.UpdateDate = DateTime.UtcNow;
            await IncrementPermissionsVersionForRoleAsync(role.ID);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = role.ID });
        }

        [HttpGet("permissions")]
        public async Task<IActionResult> GetPermissions(
            [FromQuery] bool includeInactive = false,
            [FromQuery] string permissionType = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 100,
            [FromQuery] string searchText = "")
        {
            var query = _context.Permissions.AsNoTracking().Where(x => includeInactive || x.IsActive);

            if (!string.IsNullOrWhiteSpace(permissionType))
            {
                var type = permissionType.Trim();
                query = query.Where(x => x.PermissionType == type);
            }

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var term = searchText.Trim();
                query = query.Where(x =>
                    x.Key.Contains(term) ||
                    x.Name.Contains(term) ||
                    (x.Description != null && x.Description.Contains(term)) ||
                    (x.Routename != null && x.Routename.Contains(term)));
            }

            var total = await query.CountAsync();
            var permissions = await query
                .OrderBy(x => x.PermissionType)
                .ThenBy(x => x.Key)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<PermissionResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = permissions.Select(PermissionResponse.FromEntity).ToList()
            });
        }

        [HttpPost("permissions")]
        public async Task<IActionResult> CreatePermission([FromBody] PermissionUpsertRequest request)
        {
            var key = NormalizeKey(request.Key);
            if (await _context.Permissions.AnyAsync(x => x.Key == key))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "دسترسی با این کلید قبلا ثبت شده است" });
            }

            var permission = new MTPermissionCenter_Permission
            {
                Key = key,
                Name = request.Name.Trim(),
                PermissionType = NormalizePermissionType(request.PermissionType),
                Description = request.Description?.Trim(),
                Icon = request.Icon?.Trim(),
                Routename = request.Routename?.Trim(),
                MenuParentId = request.MenuParentId,
                MenuIds = request.MenuIds?.Trim(),
                IsActive = request.IsActive,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow
            };

            await _context.Permissions.AddAsync(permission);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = permission.ID });
        }

        [HttpPut("permissions/{id:long}")]
        public async Task<IActionResult> UpdatePermission(long id, [FromBody] PermissionUpsertRequest request)
        {
            var permission = await _context.Permissions.SingleOrDefaultAsync(x => x.ID == id);
            if (permission == null) return NotFound();

            var key = NormalizeKey(request.Key);
            if (await _context.Permissions.AnyAsync(x => x.ID != id && x.Key == key))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "دسترسی با این کلید قبلا ثبت شده است" });
            }

            permission.Key = key;
            permission.Name = request.Name.Trim();
            permission.PermissionType = NormalizePermissionType(request.PermissionType);
            permission.Description = request.Description?.Trim();
            permission.Icon = request.Icon?.Trim();
            permission.Routename = request.Routename?.Trim();
            permission.MenuParentId = request.MenuParentId;
            permission.MenuIds = request.MenuIds?.Trim();
            permission.IsActive = request.IsActive;
            permission.UpdateDate = DateTime.UtcNow;

            await IncrementPermissionsVersionForPermissionAsync(permission.ID);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = permission.ID });
        }

        [HttpDelete("permissions/{id:long}")]
        public async Task<IActionResult> DeactivatePermission(long id)
        {
            var permission = await _context.Permissions.SingleOrDefaultAsync(x => x.ID == id);
            if (permission == null) return NotFound();

            permission.IsActive = false;
            permission.UpdateDate = DateTime.UtcNow;
            await IncrementPermissionsVersionForPermissionAsync(permission.ID);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = permission.ID });
        }

        [HttpPut("roles/{id:long}/permissions")]
        public async Task<IActionResult> SetRolePermissions(long id, [FromBody] SetRolePermissionsRequest request)
        {
            if (!await _context.Roles.AnyAsync(x => x.ID == id))
            {
                return NotFound(new BitResultObject { Status = false, ErrorMessage = "نقش پیدا نشد" });
            }

            var permissionIds = await GetValidPermissionIdsAsync(request.PermissionIds);
            var current = await _context.PermissionRoles.Where(x => x.RoleId == id).ToListAsync();
            foreach (var relation in current)
            {
                relation.IsActive = permissionIds.Contains(relation.PermissionId);
                relation.UpdateDate = DateTime.UtcNow;
            }

            var existingPermissionIds = current.Select(x => x.PermissionId).ToHashSet();
            foreach (var permissionId in permissionIds.Where(x => !existingPermissionIds.Contains(x)))
            {
                await _context.PermissionRoles.AddAsync(new MTPermissionCenter_PermissionRole
                {
                    RoleId = id,
                    PermissionId = permissionId,
                    IsActive = true,
                    OwnerOnly = false,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            await IncrementPermissionsVersionForRoleAsync(id);
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = id });
        }

        [HttpGet("users/{userId:long}/permissions")]
        public async Task<IActionResult> GetUserPermissions(long userId)
        {
            var userExists = await _context.Users.AnyAsync(x => x.ID == userId && x.DeleteDate == null);
            if (!userExists) return NotFound();

            var permissions = await _context.UserPermissions
                .AsNoTracking()
                .Include(x => x.Permission)
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.Permission.Key)
                .ToListAsync();

            return Ok(new ListResultObject<UserPermissionResponse>
            {
                TotalCount = permissions.Count,
                PageCount = 1,
                Results = permissions.Select(UserPermissionResponse.FromEntity).ToList()
            });
        }

        [HttpPut("users/{userId:long}/permissions")]
        public async Task<IActionResult> SetUserPermissions(long userId, [FromBody] SetUserPermissionsRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == userId && x.DeleteDate == null);
            if (user == null) return NotFound();

            var permissionIds = await GetValidPermissionIdsAsync(request.PermissionIds);
            var current = await _context.UserPermissions.Where(x => x.UserId == userId).ToListAsync();
            foreach (var userPermission in current)
            {
                var shouldGrant = permissionIds.Contains(userPermission.PermissionId);
                userPermission.IsGranted = shouldGrant;
                userPermission.IsActive = shouldGrant;
                userPermission.UpdateDate = DateTime.UtcNow;
            }

            var existingPermissionIds = current.Select(x => x.PermissionId).ToHashSet();
            foreach (var permissionId in permissionIds.Where(x => !existingPermissionIds.Contains(x)))
            {
                await _context.UserPermissions.AddAsync(new MTPermissionCenter_UserPermission
                {
                    UserId = userId,
                    PermissionId = permissionId,
                    IsGranted = true,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            user.PermissionsVersion++;
            user.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = userId });
        }

        [HttpGet("activity-logs")]
        public async Task<IActionResult> GetActivityLogs(
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] long? userId = null,
            [FromQuery] string source = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var normalizedTo = (to ?? DateTime.UtcNow).Date.AddDays(1);
            var normalizedFrom = (from ?? normalizedTo.AddDays(-30)).Date;
            source = source.Trim().ToLowerInvariant();

            var items = new List<AdminActivityLogResponse>();
            if (string.IsNullOrWhiteSpace(source) || source == "system")
            {
                items.AddRange(await _context.Logs
                    .AsNoTracking()
                    .Where(x => x.DeleteDate == null && x.CreateDate >= normalizedFrom && x.CreateDate < normalizedTo)
                    .Select(x => new AdminActivityLogResponse
                    {
                        Source = "system",
                        Id = x.ID,
                        UserId = x.CreatorId,
                        Action = x.ActionName,
                        CreateDate = x.CreateDate ?? x.LogTime
                    })
                    .ToListAsync());
            }

            if (string.IsNullOrWhiteSpace(source) || source == "analytics")
            {
                items.AddRange(await _context.AnalyticsEvents
                    .AsNoTracking()
                    .Where(x =>
                        x.DeleteDate == null &&
                        x.CreateDate >= normalizedFrom &&
                        x.CreateDate < normalizedTo &&
                        (!userId.HasValue || x.UserId == userId.Value))
                    .Select(x => new AdminActivityLogResponse
                    {
                        Source = "analytics",
                        Id = x.ID,
                        UserId = x.UserId,
                        Action = x.EventName,
                        EntityType = x.EntityType,
                        EntityId = x.EntityId,
                        DetailsJson = x.PropertiesJson,
                        CreateDate = x.CreateDate
                    })
                    .ToListAsync());
            }

            if (string.IsNullOrWhiteSpace(source) || source == "project")
            {
                items.AddRange(await _context.ProjectActivityLogs
                    .AsNoTracking()
                    .Where(x =>
                        x.DeleteDate == null &&
                        x.CreateDate >= normalizedFrom &&
                        x.CreateDate < normalizedTo &&
                        (!userId.HasValue || x.ActorUserId == userId.Value))
                    .Select(x => new AdminActivityLogResponse
                    {
                        Source = "project",
                        Id = x.ID,
                        UserId = x.ActorUserId,
                        Action = x.ActivityType.ToString(),
                        EntityType = "Project",
                        EntityId = x.ProjectId,
                        DetailsJson = x.DetailsJson,
                        CreateDate = x.CreateDate
                    })
                    .ToListAsync());
            }

            if (userId.HasValue)
            {
                items = items.Where(x => x.UserId == userId.Value).ToList();
            }

            var total = items.Count;
            var results = items
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.Id)
                .Skip((Math.Max(1, pageIndex) - 1) * Math.Clamp(pageSize, 1, 200))
                .Take(Math.Clamp(pageSize, 1, 200))
                .ToList();

            return Ok(new ListResultObject<AdminActivityLogResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = results
            });
        }

        private async Task<List<long>> GetValidPermissionIdsAsync(IEnumerable<long> requestedIds)
        {
            var ids = requestedIds.Where(x => x > 0).Distinct().ToList();
            if (ids.Count == 0) return new List<long>();

            return await _context.Permissions
                .Where(x => ids.Contains(x.ID) && x.IsActive)
                .Select(x => x.ID)
                .ToListAsync();
        }

        private async Task IncrementPermissionsVersionForRoleAsync(long roleId)
        {
            var users = await _context.Users
                .Where(user => user.UserRoles.Any(role =>
                    role.RoleId == roleId &&
                    role.IsActive &&
                    role.Status == UserRoleAssignmentStatus.Approved))
                .ToListAsync();

            foreach (var user in users)
            {
                user.PermissionsVersion++;
                user.UpdateDate = DateTime.UtcNow;
            }
        }

        private async Task IncrementPermissionsVersionForPermissionAsync(long permissionId)
        {
            var roleIds = await _context.PermissionRoles
                .Where(x => x.PermissionId == permissionId && x.IsActive)
                .Select(x => x.RoleId)
                .Distinct()
                .ToListAsync();
            var directUserIds = await _context.UserPermissions
                .Where(x => x.PermissionId == permissionId && x.IsActive && x.IsGranted)
                .Select(x => x.UserId)
                .Distinct()
                .ToListAsync();

            var users = await _context.Users
                .Where(user =>
                    directUserIds.Contains(user.ID) ||
                    user.UserRoles.Any(role =>
                        roleIds.Contains(role.RoleId) &&
                        role.IsActive &&
                        role.Status == UserRoleAssignmentStatus.Approved))
                .ToListAsync();

            foreach (var user in users)
            {
                user.PermissionsVersion++;
                user.UpdateDate = DateTime.UtcNow;
            }
        }

        private static string NormalizeKey(string value)
        {
            return value.Trim();
        }

        private static string NormalizePermissionType(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? "Api" : value.Trim();
        }
    }
}
