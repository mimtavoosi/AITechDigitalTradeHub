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

    public class UpdateProjectProfileRequest
    {
        public List<long> SkillTagIds { get; set; } = new();
        public long? ResumeFileUploadId { get; set; }

        [MaxLength(180)]
        public string? ResumeHeadline { get; set; }

        [MaxLength(2000)]
        public string? ResumeSummary { get; set; }

        [MaxLength(4000)]
        public string? ResumeExperience { get; set; }

        [MaxLength(1000)]
        public string? ResumeEducation { get; set; }
    }

    public class PanelPreferenceRequest
    {
        [MaxLength(40)]
        public string ThemeKey { get; set; } = "default";

        [MaxLength(24)]
        public string DensityKey { get; set; } = "comfortable";

        [MaxLength(24)]
        public string FontScale { get; set; } = "normal";

        [MaxLength(24)]
        public string FontFamily { get; set; } = "vazirmatn";

        [MaxLength(24)]
        public string SidebarMode { get; set; } = "dark";

        public List<string> CardOrder { get; set; } = new();
        public List<string> HiddenItems { get; set; } = new();
    }

    public class PanelPreferenceResponse
    {
        public string PanelKey { get; set; } = string.Empty;
        public string ThemeKey { get; set; } = "default";
        public string DensityKey { get; set; } = "comfortable";
        public string FontScale { get; set; } = "normal";
        public string FontFamily { get; set; } = "vazirmatn";
        public string SidebarMode { get; set; } = "dark";
        public List<string> CardOrder { get; set; } = new();
        public List<string> HiddenItems { get; set; } = new();
        public DateTime? UpdateDate { get; set; }
    }

    public class RoleOptionResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UserProjectSkillResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Slug { get; set; }
    }

    public class UserPortfolioItemResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ExternalUrl { get; set; }
    }

    public class UserProjectProfileResponse
    {
        public long UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? MobileNumber { get; set; }
        public bool IsVerified { get; set; }
        public byte VerificationLevel { get; set; }
        public decimal TrustScore { get; set; }
        public int CompletedProjectsCount { get; set; }
        public List<UserProjectSkillResponse> Skills { get; set; } = new();
        public long? ResumeFileUploadId { get; set; }
        public string? ResumeFileName { get; set; }
        public string? ResumeFileUrl { get; set; }
        public string? ResumeHeadline { get; set; }
        public string? ResumeSummary { get; set; }
        public string? ResumeExperience { get; set; }
        public string? ResumeEducation { get; set; }
        public List<UserPortfolioItemResponse> PortfolioItems { get; set; } = new();
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
