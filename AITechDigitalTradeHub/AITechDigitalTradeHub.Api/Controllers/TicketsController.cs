using System.Security.Claims;
using AITechDigitalTradeHub.Api.ViewModels.Support;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketRep _ticketRep;
        private readonly ITicketMessageRep _ticketMessageRep;
        private readonly INotificationRep _notificationRep;

        public TicketsController(
            ITicketRep ticketRep,
            ITicketMessageRep ticketMessageRep,
            INotificationRep notificationRep)
        {
            _ticketRep = ticketRep;
            _ticketMessageRep = ticketMessageRep;
            _notificationRep = notificationRep;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var result = await _ticketRep.GetAllTicketsAsync(GetCurrentUserId(), pageIndex, pageSize, searchText);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _ticketRep.GetTicketByIdAsync(id);
            if (!result.Status || result.Result == null)
            {
                return NotFound(result);
            }

            return result.Result.UserId == GetCurrentUserId() ? Ok(result) : Forbid();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTicketRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Description))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "Subject and description are required." });
            }

            var ticket = request.ToEntity(userId);
            var result = await _ticketRep.AddTicketAsync(ticket);
            if (!result.Status)
            {
                return BadRequest(result);
            }

            await _notificationRep.AddNotificationAsync(new Notification
            {
                UserId = userId,
                Message = "Ticket created successfully.",
                IsRead = false,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                CreatorId = userId
            });

            return Ok(result);
        }

        [HttpPost("{id:long}/messages")]
        public async Task<IActionResult> AddMessage(long id, [FromBody] CreateTicketMessageRequest request)
        {
            var userId = GetCurrentUserId();
            var ticket = await _ticketRep.GetTicketByIdAsync(id);
            if (!ticket.Status || ticket.Result == null)
            {
                return NotFound(ticket);
            }

            if (ticket.Result.UserId != userId)
            {
                return Forbid();
            }

            if (ticket.Result.Status == TicketStatus.Closed)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "Closed tickets cannot receive new messages." });
            }

            if (string.IsNullOrWhiteSpace(request.MessageContent))
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "Message content is required." });
            }

            var message = request.ToEntity(id, userId);
            var result = await _ticketMessageRep.AddTicketMessageAsync(message);
            if (!result.Status)
            {
                return BadRequest(result);
            }

            ticket.Result.Status = TicketStatus.Pending;
            ticket.Result.UpdateDate = DateTime.Now;
            await _ticketRep.EditTicketAsync(ticket.Result);

            return Ok(result);
        }

        [HttpPost("{id:long}/resolve")]
        public async Task<IActionResult> Resolve(long id)
        {
            return await UpdateStatus(id, TicketStatus.Resolved);
        }

        [HttpPost("{id:long}/close")]
        public async Task<IActionResult> Close(long id)
        {
            return await UpdateStatus(id, TicketStatus.Closed);
        }

        private async Task<IActionResult> UpdateStatus(long id, TicketStatus status)
        {
            var ticket = await _ticketRep.GetTicketByIdAsync(id);
            if (!ticket.Status || ticket.Result == null)
            {
                return NotFound(ticket);
            }

            if (ticket.Result.UserId != GetCurrentUserId())
            {
                return Forbid();
            }

            ticket.Result.Status = status;
            ticket.Result.UpdateDate = DateTime.Now;
            if (status == TicketStatus.Resolved)
            {
                ticket.Result.ResolvedAt = DateTime.Now;
            }

            if (status == TicketStatus.Closed)
            {
                ticket.Result.ClosedAt = DateTime.Now;
            }

            var result = await _ticketRep.EditTicketAsync(ticket.Result);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
