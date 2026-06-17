using System.Security.Claims;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationRep _notificationRep;

        public NotificationsController(INotificationRep notificationRep)
        {
            _notificationRep = notificationRep;
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
    }
}
