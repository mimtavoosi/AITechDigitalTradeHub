using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;
using MTPermissionCenter.EFCore.Entities;

namespace AITechDigitalTradeHub.Api.ViewModels.Admin
{
    public class RoleUpsertRequest
    {
        [Required, MaxLength(80)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(300)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;
    }

    public class PermissionUpsertRequest
    {
        [Required, MaxLength(120)]
        public string Key { get; set; } = string.Empty;

        [Required, MaxLength(160)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(60)]
        public string PermissionType { get; set; } = "Api";

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(80)]
        public string? Icon { get; set; }

        [MaxLength(200)]
        public string? Routename { get; set; }

        public long? MenuParentId { get; set; }
        public string? MenuIds { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class SetRolePermissionsRequest
    {
        public List<long> PermissionIds { get; set; } = new();
    }

    public class SetUserPermissionsRequest
    {
        public List<long> PermissionIds { get; set; } = new();
    }

    public class RoleManagementResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool IsActive { get; set; }
        public int UsersCount { get; set; }
        public List<PermissionResponse> Permissions { get; set; } = new();

        public static RoleManagementResponse FromEntity(Role role)
        {
            return new RoleManagementResponse
            {
                Id = role.ID,
                Name = role.Name,
                Description = role.Description,
                IsActive = role.IsActive,
                UsersCount = role.UserRoles?.Count(x => x.IsActive && x.Status == UserRoleAssignmentStatus.Approved) ?? 0,
                Permissions = role.PermissionRoles?
                    .Where(x => x.IsActive && x.Permission != null)
                    .Select(x => PermissionResponse.FromEntity(x.Permission))
                    .OrderBy(x => x.Key)
                    .ToList() ?? new List<PermissionResponse>()
            };
        }
    }

    public class PermissionResponse
    {
        public long Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string PermissionType { get; set; } = "Api";
        public string? Description { get; set; }
        public string? Icon { get; set; }
        public string? Routename { get; set; }
        public long? MenuParentId { get; set; }
        public string? MenuIds { get; set; }
        public bool IsActive { get; set; }

        public static PermissionResponse FromEntity(MTPermissionCenter_Permission permission)
        {
            return new PermissionResponse
            {
                Id = permission.ID,
                Key = permission.Key,
                Name = permission.Name,
                PermissionType = permission.PermissionType,
                Description = permission.Description,
                Icon = permission.Icon,
                Routename = permission.Routename,
                MenuParentId = permission.MenuParentId,
                MenuIds = permission.MenuIds,
                IsActive = permission.IsActive
            };
        }
    }

    public class UserPermissionResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public long PermissionId { get; set; }
        public bool IsGranted { get; set; }
        public bool IsActive { get; set; }
        public PermissionResponse? Permission { get; set; }

        public static UserPermissionResponse FromEntity(MTPermissionCenter_UserPermission userPermission)
        {
            return new UserPermissionResponse
            {
                Id = userPermission.ID,
                UserId = userPermission.UserId,
                PermissionId = userPermission.PermissionId,
                IsGranted = userPermission.IsGranted,
                IsActive = userPermission.IsActive,
                Permission = userPermission.Permission == null ? null : PermissionResponse.FromEntity(userPermission.Permission)
            };
        }
    }

    public class AdminActivityLogResponse
    {
        public string Source { get; set; } = string.Empty;
        public long Id { get; set; }
        public long? UserId { get; set; }
        public string Action { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public long? EntityId { get; set; }
        public string? DetailsJson { get; set; }
        public DateTime? CreateDate { get; set; }
    }
}
