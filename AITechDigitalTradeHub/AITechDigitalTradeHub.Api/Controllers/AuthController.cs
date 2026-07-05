using System.Security.Claims;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private const string RefreshTokenCookieName = "__Host-aitech-refresh";
        private readonly IAuthService _authService;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _authService = authService;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authService.LoginAsync(request);
            return result.Status ? Ok(AttachRefreshCookie(result)) : Unauthorized(result);
        }

        [HttpPost("verify-mobile")]
        public async Task<IActionResult> VerifyMobile([FromBody] VerifyMobileRequest request)
        {
            var result = await _authService.VerifyMobileAsync(request);
            return result.Status ? Ok(AttachRefreshCookie(result)) : BadRequest(result);
        }

        [HttpPost("resend-mobile-code")]
        public async Task<IActionResult> ResendMobileCode([FromBody] ResendMobileVerificationRequest request)
        {
            var result = await _authService.ResendMobileVerificationAsync(request);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest? request)
        {
            var refreshToken = GetRefreshToken(request?.RefreshToken);
            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                return Unauthorized(AuthResult.Fail("نشست معتبر نیست یا منقضی شده است"));
            }

            var result = await _authService.RefreshAsync(new RefreshTokenRequest { RefreshToken = refreshToken });
            return result.Status ? Ok(AttachRefreshCookie(result)) : Unauthorized(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest? request)
        {
            var refreshToken = GetRefreshToken(request?.RefreshToken);
            var result = string.IsNullOrWhiteSpace(refreshToken)
                ? AuthOperationResult.Ok()
                : await _authService.LogoutAsync(refreshToken);
            Response.Cookies.Delete(RefreshTokenCookieName, BuildRefreshCookieOptions(DateTimeOffset.UtcNow.AddDays(-1)));
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _authService.GetCurrentUserAsync(userId);
            return result == null ? NotFound() : Ok(result);
        }

        [Authorize]
        [HttpGet("sessions")]
        public async Task<IActionResult> Sessions()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _authService.GetSessionsAsync(userId);
            return Ok(result);
        }

        [Authorize]
        [HttpDelete("sessions/{tokenId:long}")]
        public async Task<IActionResult> RevokeSession(long tokenId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _authService.RevokeSessionAsync(tokenId, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _authService.ChangePasswordAsync(userId, request);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }

        private AuthResult AttachRefreshCookie(AuthResult result)
        {
            if (!string.IsNullOrWhiteSpace(result.RefreshToken))
            {
                Response.Cookies.Append(
                    RefreshTokenCookieName,
                    result.RefreshToken,
                    BuildRefreshCookieOptions(DateTimeOffset.UtcNow.AddDays(GetRefreshTokenDays())));
                result.RefreshToken = null;
            }

            return result;
        }

        private string? GetRefreshToken(string? bodyRefreshToken)
        {
            return !string.IsNullOrWhiteSpace(bodyRefreshToken)
                ? bodyRefreshToken
                : Request.Cookies.TryGetValue(RefreshTokenCookieName, out var cookieValue)
                    ? cookieValue
                    : null;
        }

        private CookieOptions BuildRefreshCookieOptions(DateTimeOffset expires)
        {
            return new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Expires = expires,
                Path = "/"
            };
        }

        private int GetRefreshTokenDays()
        {
            return _configuration.GetValue<int?>("Jwt:RefreshTokenDays") ?? 30;
        }
    }
}
