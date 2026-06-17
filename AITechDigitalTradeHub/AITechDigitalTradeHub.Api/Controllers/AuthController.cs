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
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
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
            return result.Status ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("verify-mobile")]
        public async Task<IActionResult> VerifyMobile([FromBody] VerifyMobileRequest request)
        {
            var result = await _authService.VerifyMobileAsync(request);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("resend-mobile-code")]
        public async Task<IActionResult> ResendMobileCode([FromBody] ResendMobileVerificationRequest request)
        {
            var result = await _authService.ResendMobileVerificationAsync(request);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            var result = await _authService.RefreshAsync(request);
            return result.Status ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            var result = await _authService.LogoutAsync(request.RefreshToken);
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
    }
}
