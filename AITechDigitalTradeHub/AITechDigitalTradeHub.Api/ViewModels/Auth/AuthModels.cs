using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Auth
{
    public class RegisterRequest
    {
        [Required, MaxLength(80)]
        public string FirstName { get; set; } = string.Empty;

        [Required, MaxLength(80)]
        public string LastName { get; set; } = string.Empty;

        [Required, EmailAddress, MaxLength(160)]
        public string Email { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? NationalCode { get; set; }

        [Required, Phone, MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, MinLength(3), MaxLength(80)]
        public string Username { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required, MaxLength(160)]
        public string UsernameOrEmail { get; set; } = string.Empty;

        [Required, MaxLength(128)]
        public string Password { get; set; } = string.Empty;
    }

    public class VerifyMobileRequest
    {
        [Required, Phone, MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;

        [Required, MinLength(4), MaxLength(8)]
        public string Code { get; set; } = string.Empty;
    }

    public class ResendMobileVerificationRequest
    {
        [Required, Phone, MaxLength(20)]
        public string MobileNumber { get; set; } = string.Empty;
    }

    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class LogoutRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class ChangePasswordRequest
    {
        [Required, MaxLength(128)]
        public string CurrentPassword { get; set; } = string.Empty;

        [Required, MinLength(8), MaxLength(128)]
        public string NewPassword { get; set; } = string.Empty;
    }

    public class AuthResult
    {
        public bool Status { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public string? AccessToken { get; set; }
        public DateTime? AccessTokenExpiresAt { get; set; }
        public string? RefreshToken { get; set; }
        public bool RequiresMobileVerification { get; set; }
        public string? MobileNumber { get; set; }
        public UserProfileResponse? User { get; set; }

        public static AuthResult Fail(string errorMessage)
        {
            return new AuthResult { Status = false, ErrorMessage = errorMessage };
        }
    }

    public class AuthOperationResult
    {
        public bool Status { get; set; } = true;
        public string ErrorMessage { get; set; } = string.Empty;

        public static AuthOperationResult Ok()
        {
            return new AuthOperationResult();
        }

        public static AuthOperationResult Fail(string errorMessage)
        {
            return new AuthOperationResult { Status = false, ErrorMessage = errorMessage };
        }
    }

    public class UserProfileResponse
    {
        public long Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string? MobileNumber { get; set; }
        public long RoleId { get; set; }
        public string? RoleName { get; set; }
        public List<UserRoleResponse> Roles { get; set; } = new();
        public decimal TrustScore { get; set; }
        public bool IsVerified { get; set; }
        public byte VerificationLevel { get; set; }
        public UserStatus Status { get; set; }
    }

    public class UserRoleResponse
    {
        public long RoleId { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public UserRoleAssignmentStatus Status { get; set; }
    }

    public class UserSessionResponse
    {
        public long Id { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime? RevokedDate { get; set; }
    }
}
