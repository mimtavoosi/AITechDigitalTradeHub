using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Support;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.Tools;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageTickets)]
    public class TicketsController : ControllerBase
    {
        private readonly ITicketRep _ticketRep;
        private readonly ITicketMessageRep _ticketMessageRep;
        private readonly INotificationRep _notificationRep;
        private readonly TheAppContext _context;

        public TicketsController(
            ITicketRep ticketRep,
            ITicketMessageRep ticketMessageRep,
            INotificationRep notificationRep,
            TheAppContext context)
        {
            _ticketRep = ticketRep;
            _ticketMessageRep = ticketMessageRep;
            _notificationRep = notificationRep;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine(
            [FromQuery] TicketCategory? category,
            [FromQuery] TicketStatus? status,
            [FromQuery] string referenceType = "",
            [FromQuery] long? referenceId = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var query = BuildTicketQuery()
                .Where(x => x.UserId == userId);

            query = ApplyTicketFilters(query, category, status, referenceType, referenceId, searchText);
            var result = await ToTicketListResultAsync(query, pageIndex, pageSize, includeDetails: false);
            return Ok(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var userId = GetCurrentUserId();
            var ticket = await BuildTicketQuery()
                .SingleOrDefaultAsync(x => x.ID == id && x.UserId == userId);

            if (ticket == null)
            {
                return NotFound();
            }

            return Ok(new RowResultObject<TicketResponse> { Result = TicketResponse.FromEntity(ticket) });
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
            ticket.ReferenceType = NormalizeReferenceType(ticket.ReferenceType);
            ticket.SlaDueAt = CalculateSlaDueAt(ticket.Priority);
            var result = await _ticketRep.AddTicketAsync(ticket);
            if (!result.Status)
            {
                return BadRequest(result);
            }

            if (request.AttachmentFileIds.Count > 0)
            {
                var attached = await AttachFilesAsync(result.ID, userId, request.AttachmentFileIds);
                if (!attached.Status)
                {
                    return BadRequest(attached);
                }
            }

            await _notificationRep.AddNotificationAsync(new Notification
            {
                UserId = userId,
                Message = "تیکت پشتیبانی شما ثبت شد.",
                IsRead = false,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId
            });

            return Ok(result);
        }

        [HttpPost("{id:long}/messages")]
        public async Task<IActionResult> AddMessage(long id, [FromBody] CreateTicketMessageRequest request)
        {
            var userId = GetCurrentUserId();
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id && x.UserId == userId);
            if (ticket == null)
            {
                return NotFound();
            }

            if (ticket.Status == TicketStatus.Closed)
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

            if (request.AttachmentFileIds.Count > 0)
            {
                var attached = await AttachFilesAsync(id, userId, request.AttachmentFileIds);
                if (!attached.Status)
                {
                    return BadRequest(attached);
                }
            }

            ticket.Status = TicketStatus.Pending;
            ticket.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(result);
        }

        [HttpPost("{id:long}/attachments")]
        public async Task<IActionResult> AddAttachment(long id, [FromBody] AddTicketAttachmentRequest request)
        {
            var userId = GetCurrentUserId();
            var ticketExists = await _context.Tickets.AnyAsync(x => x.ID == id && x.UserId == userId && x.Status != TicketStatus.Closed);
            if (!ticketExists)
            {
                return NotFound();
            }

            var result = await AttachFilesAsync(id, userId, new[] { request.FileUploadId });
            return result.Status ? Ok(result) : BadRequest(result);
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

        [HttpPatch("{id:long}/satisfaction")]
        public async Task<IActionResult> UpdateSatisfaction(long id, [FromBody] UpdateTicketSatisfactionRequest request)
        {
            var userId = GetCurrentUserId();
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id && x.UserId == userId);
            if (ticket == null)
            {
                return NotFound();
            }

            if (request.SatisfactionScore is < 1 or > 5)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "امتیاز رضایت باید بین ۱ تا ۵ باشد." });
            }

            if (ticket.Status != TicketStatus.Resolved && ticket.Status != TicketStatus.Closed)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "ثبت رضایت فقط برای تیکت حل‌شده یا بسته‌شده مجاز است." });
            }

            ticket.SatisfactionScore = request.SatisfactionScore;
            ticket.Status = TicketStatus.Closed;
            ticket.ClosedAt ??= DateTime.UtcNow;
            ticket.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new BitResultObject { ID = ticket.ID });
        }

        private async Task<IActionResult> UpdateStatus(long id, TicketStatus status)
        {
            var userId = GetCurrentUserId();
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id && x.UserId == userId);
            if (ticket == null)
            {
                return NotFound();
            }

            ticket.Status = status;
            ticket.UpdateDate = DateTime.UtcNow;
            if (status == TicketStatus.Resolved)
            {
                ticket.ResolvedAt = DateTime.UtcNow;
            }

            if (status == TicketStatus.Closed)
            {
                ticket.ClosedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = ticket.ID });
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminTickets(
            [FromQuery] TicketCategory? category,
            [FromQuery] TicketStatus? status,
            [FromQuery] TicketPriority? priority,
            [FromQuery] bool assignedToMe = false,
            [FromQuery] string referenceType = "",
            [FromQuery] long? referenceId = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var query = ApplyTicketFilters(BuildTicketQuery(), category, status, referenceType, referenceId, searchText);
            if (priority.HasValue)
            {
                query = query.Where(x => x.Priority == priority.Value);
            }

            if (assignedToMe)
            {
                query = query.Where(x => x.AssignedToUserId == GetCurrentUserId());
            }

            var result = await ToTicketListResultAsync(query, pageIndex, pageSize, includeDetails: false);
            return Ok(result);
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin/summary")]
        public async Task<IActionResult> GetAdminSummary()
        {
            var now = DateTime.UtcNow;
            var tickets = await _context.Tickets
                .AsNoTracking()
                .Where(x => x.DeleteDate == null)
                .ToListAsync();

            static decimal AverageMinutes(IEnumerable<double> values)
            {
                var list = values.ToList();
                return list.Count == 0 ? 0 : Math.Round((decimal)list.Average(), 2);
            }

            var response = new TicketAdminSummaryResponse
            {
                TotalTickets = tickets.Count,
                OpenTickets = tickets.Count(x => x.Status == TicketStatus.Open),
                PendingTickets = tickets.Count(x => x.Status == TicketStatus.Pending),
                AnsweredTickets = tickets.Count(x => x.Status == TicketStatus.Answered),
                ResolvedTickets = tickets.Count(x => x.Status == TicketStatus.Resolved),
                ClosedTickets = tickets.Count(x => x.Status == TicketStatus.Closed),
                OverdueTickets = tickets.Count(x =>
                    x.SlaDueAt.HasValue &&
                    x.SlaDueAt.Value < now &&
                    x.Status != TicketStatus.Resolved &&
                    x.Status != TicketStatus.Closed),
                SlaBreachedTickets = tickets.Count(x =>
                    x.SlaDueAt.HasValue &&
                    ((x.FirstRespondedAt.HasValue && x.FirstRespondedAt.Value > x.SlaDueAt.Value) ||
                     (!x.FirstRespondedAt.HasValue && x.SlaDueAt.Value < now))),
                AverageFirstResponseMinutes = AverageMinutes(tickets
                    .Where(x => x.FirstRespondedAt.HasValue && x.CreateDate.HasValue)
                    .Select(x => (x.FirstRespondedAt!.Value - x.CreateDate!.Value).TotalMinutes)),
                AverageResolutionMinutes = AverageMinutes(tickets
                    .Where(x => x.ResolvedAt.HasValue && x.CreateDate.HasValue)
                    .Select(x => (x.ResolvedAt!.Value - x.CreateDate!.Value).TotalMinutes)),
                SatisfactionResponsesCount = tickets.Count(x => x.SatisfactionScore.HasValue),
                AverageSatisfactionScore = tickets.Any(x => x.SatisfactionScore.HasValue)
                    ? Math.Round((decimal)tickets.Where(x => x.SatisfactionScore.HasValue).Average(x => x.SatisfactionScore!.Value), 2)
                    : 0
            };

            return Ok(new RowResultObject<TicketAdminSummaryResponse> { Result = response });
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin/{id:long}")]
        public async Task<IActionResult> GetAdminTicket(long id)
        {
            var ticket = await BuildTicketQuery().SingleOrDefaultAsync(x => x.ID == id);
            return ticket == null
                ? NotFound()
                : Ok(new RowResultObject<TicketResponse> { Result = TicketResponse.FromEntity(ticket) });
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPost("admin/{id:long}/messages")]
        public async Task<IActionResult> AddSupportMessage(long id, [FromBody] CreateTicketMessageRequest request)
        {
            var userId = GetCurrentUserId();
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id);
            if (ticket == null)
            {
                return NotFound();
            }

            if (ticket.Status == TicketStatus.Closed)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "Closed tickets cannot receive new messages." });
            }

            if (string.IsNullOrWhiteSpace(request.MessageContent))
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "Message content is required." });
            }

            var message = request.ToEntity(id, userId, isAdminResponse: true);
            var result = await _ticketMessageRep.AddTicketMessageAsync(message);
            if (!result.Status)
            {
                return BadRequest(result);
            }

            if (request.AttachmentFileIds.Count > 0)
            {
                var attached = await AttachFilesAsync(id, userId, request.AttachmentFileIds);
                if (!attached.Status)
                {
                    return BadRequest(attached);
                }
            }

            ticket.Status = TicketStatus.Answered;
            ticket.AssignedToUserId ??= userId;
            ticket.FirstRespondedAt ??= DateTime.UtcNow;
            ticket.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await _notificationRep.AddNotificationAsync(new Notification
            {
                UserId = ticket.UserId,
                Message = $"پشتیبانی به تیکت «{ticket.Subject}» پاسخ داد.",
                IsRead = false,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId
            });

            return Ok(result);
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/assign")]
        public async Task<IActionResult> AssignTicket(long id, [FromBody] AssignTicketRequest request)
        {
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id);
            if (ticket == null)
            {
                return NotFound();
            }

            ticket.AssignedToUserId = request.AssignedToUserId ?? GetCurrentUserId();
            ticket.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = ticket.ID });
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateAdminStatus(long id, [FromBody] UpdateTicketStatusRequest request)
        {
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id);
            if (ticket == null)
            {
                return NotFound();
            }

            ticket.Status = request.Status;
            ticket.SatisfactionScore = request.SatisfactionScore ?? ticket.SatisfactionScore;
            ticket.UpdateDate = DateTime.UtcNow;
            if (request.Status == TicketStatus.Resolved) ticket.ResolvedAt ??= DateTime.UtcNow;
            if (request.Status == TicketStatus.Closed) ticket.ClosedAt ??= DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = ticket.ID });
        }

        [Authorize(Roles = RoleNames.Support + "," + RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/escalate")]
        public async Task<IActionResult> EscalateTicket(long id, [FromBody] EscalateTicketRequest request)
        {
            var userId = GetCurrentUserId();
            var ticket = await _context.Tickets.SingleOrDefaultAsync(x => x.ID == id);
            if (ticket == null)
            {
                return NotFound();
            }

            var target = request.TargetQueue.Trim().ToLowerInvariant();
            var nextCategory = target switch
            {
                "financial" or "finance" or "مالی" => TicketCategory.Financial,
                "arbitration" or "dispute" or "داوری" => TicketCategory.Dispute,
                _ => (TicketCategory?)null
            };

            if (!nextCategory.HasValue)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "صف ارجاع باید Financial یا Arbitration باشد." });
            }

            ticket.Category = nextCategory.Value;
            ticket.Priority = ticket.Priority < TicketPriority.High ? TicketPriority.High : ticket.Priority;
            ticket.Status = TicketStatus.Pending;
            ticket.AssignedToUserId = null;
            ticket.SlaDueAt = CalculateSlaDueAt(ticket.Priority);
            ticket.UpdateDate = DateTime.UtcNow;

            var note = string.IsNullOrWhiteSpace(request.Note)
                ? $"تیکت به صف {(nextCategory == TicketCategory.Financial ? "مالی" : "داوری")} ارجاع شد."
                : request.Note.Trim();

            await _context.TicketMessages.AddAsync(new TicketMessage
            {
                TicketId = ticket.ID,
                UserId = userId,
                MessageContent = note,
                IsAdminResponse = true,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            });

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = ticket.ID });
        }

        private IQueryable<Ticket> BuildTicketQuery()
        {
            return _context.Tickets
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.AssignedToUser)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.User)
                .Include(x => x.Attachments)
                    .ThenInclude(x => x.FileUpload);
        }

        private static IQueryable<Ticket> ApplyTicketFilters(
            IQueryable<Ticket> query,
            TicketCategory? category,
            TicketStatus? status,
            string referenceType,
            long? referenceId,
            string searchText)
        {
            if (category.HasValue)
            {
                query = query.Where(x => x.Category == category.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(x => x.Status == status.Value);
            }

            if (!string.IsNullOrWhiteSpace(referenceType))
            {
                var normalizedReferenceType = NormalizeReferenceType(referenceType);
                query = query.Where(x => x.ReferenceType == normalizedReferenceType);
            }

            if (referenceId.HasValue && referenceId.Value > 0)
            {
                query = query.Where(x => x.ReferenceId == referenceId.Value);
            }

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var text = searchText.Trim();
                query = query.Where(x =>
                    x.Subject.Contains(text) ||
                    x.Description.Contains(text) ||
                    (x.User.Username != null && x.User.Username.Contains(text)));
            }

            return query;
        }

        private static async Task<ListResultObject<TicketResponse>> ToTicketListResultAsync(
            IQueryable<Ticket> query,
            int pageIndex,
            int pageSize,
            bool includeDetails)
        {
            var total = await query.CountAsync();
            var tickets = await query
                .OrderByDescending(x => x.UpdateDate ?? x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return new ListResultObject<TicketResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = tickets.Select(x => TicketResponse.FromEntity(x, includeDetails)).ToList()
            };
        }

        private async Task<BitResultObject> AttachFilesAsync(long ticketId, long userId, IEnumerable<long> fileUploadIds, bool requireUploaderOwnership = true)
        {
            var ids = fileUploadIds.Where(x => x > 0).Distinct().ToList();
            var result = new BitResultObject { ID = ticketId };
            if (ids.Count == 0)
            {
                return result;
            }

            var filesQuery = _context.FileUploads.Where(x => ids.Contains(x.ID) && x.DeleteDate == null);
            if (requireUploaderOwnership)
            {
                filesQuery = filesQuery.Where(x => x.CreatorId == userId);
            }

            var files = await filesQuery.ToListAsync();
            if (files.Count != ids.Count)
            {
                result.Status = false;
                result.ErrorMessage = "یک یا چند فایل پیوست معتبر نیست.";
                return result;
            }

            var existingFileIds = await _context.TicketAttachments
                .Where(x => x.TicketId == ticketId && ids.Contains(x.FileUploadId))
                .Select(x => x.FileUploadId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            foreach (var file in files.Where(x => !existingFileIds.Contains(x.ID)))
            {
                file.EntityType = "Ticket";
                file.ForeignKeyId = ticketId;
                file.UpdateDate = now;

                await _context.TicketAttachments.AddAsync(new TicketAttachment
                {
                    TicketId = ticketId,
                    FileUploadId = file.ID,
                    UploadedByUserId = userId,
                    CreateDate = now,
                    UpdateDate = now,
                    CreatorId = userId,
                    IsActive = true
                });
            }

            await _context.SaveChangesAsync();
            return result;
        }

        private static DateTime CalculateSlaDueAt(TicketPriority priority)
        {
            var now = DateTime.UtcNow;
            return priority switch
            {
                TicketPriority.Urgent => now.AddHours(4),
                TicketPriority.High => now.AddHours(12),
                TicketPriority.Low => now.AddDays(4),
                _ => now.AddDays(2)
            };
        }

        private static string? NormalizeReferenceType(string? referenceType)
        {
            if (string.IsNullOrWhiteSpace(referenceType)) return null;
            var value = referenceType.Trim();
            return value.ToLowerInvariant() switch
            {
                "project" => "Project",
                "order" => "Order",
                "course" => "Course",
                "education" => "Course",
                "listing" => "Listing",
                _ => value.Length > 50 ? value[..50] : value
            };
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
