using System.Security.Claims;
using System.Text.RegularExpressions;
using AITechDigitalTradeHub.Api.ViewModels.Notifications;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRep _notificationRep;
        private readonly TheAppContext _context;

        public NotificationsController(INotificationRep notificationRep, TheAppContext context)
        {
            _notificationRep = notificationRep;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var result = await _notificationRep.GetAllNotificationsAsync(GetCurrentUserId(), pageIndex, pageSize, searchText);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var count = await _notificationRep.CountUnreadAsync(GetCurrentUserId());
            return Ok(new { unreadCount = count });
        }

        [HttpGet("preferences")]
        public async Task<IActionResult> GetPreferences()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var preference = await _context.UserNotificationPreferences
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId);

            return Ok(NotificationPreferenceResponse.FromEntity(userId, preference));
        }

        [HttpPut("preferences")]
        public async Task<IActionResult> UpdatePreferences([FromBody] NotificationPreferenceRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var preference = await _context.UserNotificationPreferences
                .SingleOrDefaultAsync(x => x.UserId == userId);

            if (preference == null)
            {
                preference = new UserNotificationPreference
                {
                    UserId = userId,
                    CreatorId = userId,
                    CreateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.UserNotificationPreferences.AddAsync(preference);
            }

            ApplyPreferenceRequest(preference, request);
            preference.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(NotificationPreferenceResponse.FromEntity(userId, preference));
        }

        [HttpPatch("{id:long}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            var notification = await _notificationRep.GetNotificationByIdAsync(id);
            if (!notification.Status || notification.Result == null)
            {
                return NotFound(notification);
            }

            if (notification.Result.UserId != GetCurrentUserId())
            {
                return Forbid();
            }

            notification.Result.IsRead = true;
            notification.Result.UpdateDate = DateTime.Now;
            var result = await _notificationRep.EditNotificationAsync(notification.Result);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var result = await _notificationRep.MarkAllAsReadAsync(GetCurrentUserId());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var notification = await _notificationRep.GetNotificationByIdAsync(id);
            if (!notification.Status || notification.Result == null)
            {
                return NotFound(notification);
            }

            if (notification.Result.UserId != GetCurrentUserId())
            {
                return Forbid();
            }

            var result = await _notificationRep.RemoveNotificationAsync(notification.Result);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }

        private static void ApplyPreferenceRequest(UserNotificationPreference preference, NotificationPreferenceRequest request)
        {
            preference.InAppEnabled = request.InAppEnabled;
            preference.EmailEnabled = request.EmailEnabled;
            preference.SmsEnabled = request.SmsEnabled;
            preference.FinancialEnabled = request.FinancialEnabled;
            preference.ProjectEnabled = request.ProjectEnabled;
            preference.DisputeEnabled = request.DisputeEnabled;
            preference.EducationEnabled = request.EducationEnabled;
            preference.SupportEnabled = request.SupportEnabled;
            preference.MarketingEnabled = request.MarketingEnabled;
            preference.DigestFrequency = NormalizeDigestFrequency(request.DigestFrequency);
            preference.QuietHoursStart = NormalizeTime(request.QuietHoursStart);
            preference.QuietHoursEnd = NormalizeTime(request.QuietHoursEnd);
        }

        private static string NormalizeDigestFrequency(string? value)
        {
            var normalized = string.IsNullOrWhiteSpace(value) ? "instant" : value.Trim().ToLowerInvariant();
            return normalized is "instant" or "daily" or "weekly" ? normalized : "instant";
        }

        private static string? NormalizeTime(string? value)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            var normalized = value.Trim();
            return Regex.IsMatch(normalized, "^([01][0-9]|2[0-3]):[0-5][0-9]$") ? normalized : null;
        }
    }
}
