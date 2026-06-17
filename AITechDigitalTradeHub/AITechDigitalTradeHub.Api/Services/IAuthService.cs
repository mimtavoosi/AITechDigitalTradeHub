using AITechDigitalTradeHub.Api.ViewModels.Auth;

namespace AITechDigitalTradeHub.Api.Services
{
    public interface IAuthService
    {
        Task<AuthResult> RegisterAsync(RegisterRequest request);
        Task<AuthResult> LoginAsync(LoginRequest request);
        Task<AuthResult> VerifyMobileAsync(VerifyMobileRequest request);
        Task<AuthOperationResult> ResendMobileVerificationAsync(ResendMobileVerificationRequest request);
        Task<AuthResult> RefreshAsync(RefreshTokenRequest request);
        Task<AuthOperationResult> LogoutAsync(string refreshToken);
        Task<AuthOperationResult> RevokeSessionAsync(long tokenId, long currentUserId);
        Task<UserProfileResponse?> GetCurrentUserAsync(long userId);
        Task<IReadOnlyList<UserSessionResponse>> GetSessionsAsync(long userId);
        Task<AuthOperationResult> ChangePasswordAsync(long userId, ChangePasswordRequest request);
    }
}
