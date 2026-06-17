using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Users
{
    public class RequestUserRoleRequest
    {
        [Required, MaxLength(100)]
        public string RoleName { get; set; } = string.Empty;
    }

    public class UpdateUserRoleStatusRequest
    {
        public UserRoleAssignmentStatus Status { get; set; }

        [MaxLength(500)]
        public string? AdminNote { get; set; }
    }

    public class UpdateUserStatusRequest
    {
        public UserStatus Status { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class UpdateUserVerificationRequest
    {
        public bool IsVerified { get; set; }
        public byte VerificationLevel { get; set; }
    }

    public class RoleOptionResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UserRoleAssignmentResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string? UserDisplayName { get; set; }
        public string? UserEmail { get; set; }
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? RoleDescription { get; set; }
        public UserRoleAssignmentStatus Status { get; set; }
        public DateTime RequestedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? RejectedAt { get; set; }
        public string? AdminNote { get; set; }

        public static UserRoleAssignmentResponse FromEntity(UserRole userRole)
        {
            return new UserRoleAssignmentResponse
            {
                Id = userRole.ID,
                UserId = userRole.UserId,
                UserDisplayName = userRole.User == null ? null : $"{userRole.User.FirstName} {userRole.User.LastName}".Trim(),
                UserEmail = userRole.User?.Email,
                RoleId = userRole.RoleId,
                RoleName = userRole.Role?.Name ?? string.Empty,
                RoleDescription = userRole.Role?.Description,
                Status = userRole.Status,
                RequestedAt = userRole.RequestedAt,
                ApprovedAt = userRole.ApprovedAt,
                RejectedAt = userRole.RejectedAt,
                AdminNote = userRole.AdminNote
            };
        }
    }

    public class AdminUserListItemResponse
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? MobileNumber { get; set; }
        public UserStatus Status { get; set; }
        public bool IsActive { get; set; }
        public bool IsVerified { get; set; }
        public byte VerificationLevel { get; set; }
        public DateTime? CreateDate { get; set; }
        public List<UserRoleAssignmentResponse> Roles { get; set; } = new();

        public static AdminUserListItemResponse FromEntity(User user)
        {
            return new AdminUserListItemResponse
            {
                Id = user.ID,
                FirstName = user.FirstName,
                LastName = user.LastName,
                DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = user.Email,
                Username = user.Username,
                MobileNumber = user.LoginMethods?
                    .Where(x => x.Method == "SMS" && x.MobileNumber != null)
                    .OrderByDescending(x => x.CreateDate)
                    .Select(x => x.MobileNumber)
                    .FirstOrDefault(),
                Status = user.Status,
                IsActive = user.IsActive,
                IsVerified = user.IsVerified,
                VerificationLevel = user.VerificationLevel,
                CreateDate = user.CreateDate,
                Roles = user.UserRoles?.Select(UserRoleAssignmentResponse.FromEntity).ToList() ?? new List<UserRoleAssignmentResponse>()
            };
        }
    }
}
