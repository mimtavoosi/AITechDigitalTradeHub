using System.Security.Claims;
using AITechDigitalTradeHub.Api.Hubs;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels.Chat;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class ConversationsController : ControllerBase
    {
        private readonly TheAppContext _context;
        private readonly IProjectAccessService _projectAccessService;
        private readonly IHubContext<ConversationHub> _hubContext;

        public ConversationsController(TheAppContext context, IProjectAccessService projectAccessService, IHubContext<ConversationHub> hubContext)
        {
            _context = context;
            _projectAccessService = projectAccessService;
            _hubContext = hubContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetMine(
            [FromQuery] ConversationContextType? contextType,
            [FromQuery] long? contextId,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var query = BuildConversationQuery()
                .Where(x => x.Members.Any(member => member.UserId == userId));

            if (contextType.HasValue)
            {
                query = query.Where(x => x.ContextType == contextType.Value);
            }

            if (contextId.HasValue && contextId.Value > 0)
            {
                query = query.Where(x => x.ContextId == contextId.Value);
            }

            var total = await query.CountAsync();
            var conversations = await query
                .OrderByDescending(x => x.Messages.Max(message => (DateTime?)message.CreateDate) ?? x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<ConversationResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = conversations.Select(x => ConversationResponse.FromEntity(x, userId, includeMessages: false)).ToList()
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrGet([FromBody] CreateConversationRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var access = await ResolveContextAccessAsync(request.ContextType, request.ContextId, userId);
            if (!access.CanAccess)
            {
                return Forbid();
            }

            var conversation = await GetOrCreateConversationAsync(request.ContextType, request.ContextId, access.MemberUserIds, userId);
            return Ok(new RowResultObject<ConversationResponse>
            {
                Result = ConversationResponse.FromEntity(conversation, userId)
            });
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var userId = GetCurrentUserId();
            var conversation = await BuildConversationQuery()
                .SingleOrDefaultAsync(x => x.ID == id && x.Members.Any(member => member.UserId == userId));

            if (conversation == null)
            {
                return NotFound();
            }

            return Ok(new RowResultObject<ConversationResponse>
            {
                Result = ConversationResponse.FromEntity(conversation, userId)
            });
        }

        [HttpPost("{id:long}/messages")]
        public async Task<IActionResult> SendMessage(long id, [FromBody] SendConversationMessageRequest request)
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrWhiteSpace(request.Text) && !request.FileUploadId.HasValue)
            {
                return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "متن یا فایل پیام الزامی است." });
            }

            var conversation = await _context.Conversations
                .Include(x => x.Members)
                .SingleOrDefaultAsync(x => x.ID == id && x.Members.Any(member => member.UserId == userId));
            if (conversation == null)
            {
                return NotFound();
            }

            var access = await ResolveContextAccessAsync(conversation.ContextType, conversation.ContextId, userId);
            if (!access.CanAccess)
            {
                return Forbid();
            }

            if (request.FileUploadId.HasValue)
            {
                var ownsFile = await _context.FileUploads.AnyAsync(x =>
                    x.ID == request.FileUploadId.Value &&
                    x.CreatorId == userId &&
                    x.DeleteDate == null);
                if (!ownsFile)
                {
                    return BadRequest(new BitResultObject { Status = false, ID = id, ErrorMessage = "فایل پیام پیدا نشد یا متعلق به شما نیست." });
                }
            }

            var message = new Message
            {
                ConversationId = id,
                SenderUserId = userId,
                MessageType = request.FileUploadId.HasValue ? MessageType.File : MessageType.Text,
                Text = request.Text?.Trim(),
                FileUploadId = request.FileUploadId,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                CreatorId = userId,
                IsActive = true
            };

            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();

            var senderMember = await _context.ConversationMembers.SingleOrDefaultAsync(x => x.ConversationId == id && x.UserId == userId);
            if (senderMember != null)
            {
                senderMember.LastReadMessageId = message.ID;
                senderMember.UpdateDate = DateTime.UtcNow;
            }

            var notifications = await AddMessageNotificationsAsync(conversation, message, userId);
            await _context.SaveChangesAsync();

            var loadedMessage = await _context.Messages
                .AsNoTracking()
                .Include(x => x.SenderUser)
                .Include(x => x.FileUpload)
                .SingleAsync(x => x.ID == message.ID);

            await _hubContext.Clients
                .Group(ConversationHub.ConversationGroup(id))
                .SendAsync("ConversationMessageCreated", ConversationMessageResponse.FromEntity(loadedMessage), HttpContext.RequestAborted);

            foreach (var notification in notifications)
            {
                await _hubContext.Clients
                    .Group(ConversationHub.UserGroup(notification.UserId))
                    .SendAsync("NotificationCreated", new
                    {
                        id = notification.ID,
                        message = notification.Message,
                        userId = notification.UserId,
                        isRead = notification.IsRead,
                        createDate = notification.CreateDate,
                        updateDate = notification.UpdateDate
                    }, HttpContext.RequestAborted);
            }

            return Ok(new BitResultObject { ID = message.ID });
        }

        [HttpPatch("{id:long}/read")]
        public async Task<IActionResult> MarkAsRead(long id)
        {
            var userId = GetCurrentUserId();
            var member = await _context.ConversationMembers
                .SingleOrDefaultAsync(x => x.ConversationId == id && x.UserId == userId);
            if (member == null)
            {
                return NotFound();
            }

            var lastMessageId = await _context.Messages
                .Where(x => x.ConversationId == id)
                .OrderByDescending(x => x.ID)
                .Select(x => (long?)x.ID)
                .FirstOrDefaultAsync();

            member.LastReadMessageId = lastMessageId ?? member.LastReadMessageId;
            member.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new BitResultObject { ID = id });
        }

        private IQueryable<Conversation> BuildConversationQuery()
        {
            return _context.Conversations
                .AsNoTracking()
                .Include(x => x.Members)
                    .ThenInclude(x => x.User)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.SenderUser)
                .Include(x => x.Messages)
                    .ThenInclude(x => x.FileUpload);
        }

        private async Task<Conversation> GetOrCreateConversationAsync(ConversationContextType contextType, long contextId, IReadOnlyCollection<long> memberUserIds, long currentUserId)
        {
            var conversation = await BuildConversationQuery()
                .SingleOrDefaultAsync(x => x.ContextType == contextType && x.ContextId == contextId);

            if (conversation == null)
            {
                var now = DateTime.UtcNow;
                conversation = new Conversation
                {
                    ContextType = contextType,
                    ContextId = contextId,
                    CreateDate = now,
                    UpdateDate = now,
                    CreatorId = currentUserId,
                    IsActive = true
                };

                foreach (var memberId in memberUserIds.Append(currentUserId).Where(x => x > 0).Distinct())
                {
                    conversation.Members.Add(new ConversationMember
                    {
                        UserId = memberId,
                        CreateDate = now,
                        UpdateDate = now,
                        CreatorId = currentUserId,
                        IsActive = true
                    });
                }

                await _context.Conversations.AddAsync(conversation);
                await _context.SaveChangesAsync();
            }
            else
            {
                var existingMemberIds = conversation.Members.Select(x => x.UserId).ToHashSet();
                var missingMemberIds = memberUserIds.Append(currentUserId)
                    .Where(x => x > 0 && !existingMemberIds.Contains(x))
                    .Distinct()
                    .ToList();

                if (missingMemberIds.Count > 0)
                {
                    var now = DateTime.UtcNow;
                    foreach (var memberId in missingMemberIds)
                    {
                        await _context.ConversationMembers.AddAsync(new ConversationMember
                        {
                            ConversationId = conversation.ID,
                            UserId = memberId,
                            CreateDate = now,
                            UpdateDate = now,
                            CreatorId = currentUserId,
                            IsActive = true
                        });
                    }

                    await _context.SaveChangesAsync();
                }
            }

            return await BuildConversationQuery()
                .SingleAsync(x => x.ContextType == contextType && x.ContextId == contextId);
        }

        private async Task<(bool CanAccess, IReadOnlyCollection<long> MemberUserIds)> ResolveContextAccessAsync(ConversationContextType contextType, long contextId, long userId)
        {
            return contextType switch
            {
                ConversationContextType.Project => await ResolveProjectAccessAsync(contextId, userId),
                ConversationContextType.Order => await ResolveOrderAccessAsync(contextId, userId),
                ConversationContextType.Support => await ResolveSupportAccessAsync(contextId, userId),
                _ => (false, Array.Empty<long>())
            };
        }

        private async Task<(bool CanAccess, IReadOnlyCollection<long> MemberUserIds)> ResolveProjectAccessAsync(long projectId, long userId)
        {
            var isAdministrator = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin);
            var canAccess = await _projectAccessService.CanAccessAsync(projectId, userId, isAdministrator);
            if (!canAccess)
            {
                return (false, Array.Empty<long>());
            }

            var project = await _context.Projects
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == projectId && x.DeleteDate == null);
            if (project == null)
            {
                return (false, Array.Empty<long>());
            }

            var memberIds = new HashSet<long> { project.EmployerUserId };
            var contractUserIds = await _context.Contracts
                .AsNoTracking()
                .Where(x => x.ProjectId == projectId && x.DeleteDate == null)
                .Select(x => new { x.EmployerUserId, x.ContractorUserId })
                .ToListAsync();
            foreach (var contract in contractUserIds)
            {
                memberIds.Add(contract.EmployerUserId);
                if (contract.ContractorUserId.HasValue)
                {
                    memberIds.Add(contract.ContractorUserId.Value);
                }
            }

            return (true, memberIds);
        }

        private async Task<(bool CanAccess, IReadOnlyCollection<long> MemberUserIds)> ResolveOrderAccessAsync(long orderId, long userId)
        {
            var order = await _context.Orders
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == orderId && x.DeleteDate == null);
            if (order == null)
            {
                return (false, Array.Empty<long>());
            }

            var isAdministrator = User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin) || User.IsInRole(RoleNames.Support);
            var canAccess = isAdministrator || order.BuyerUserId == userId || order.SellerUserId == userId;
            return canAccess
                ? (true, new[] { order.BuyerUserId, order.SellerUserId })
                : (false, Array.Empty<long>());
        }

        private async Task<(bool CanAccess, IReadOnlyCollection<long> MemberUserIds)> ResolveSupportAccessAsync(long ticketId, long userId)
        {
            var ticket = await _context.Tickets
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == ticketId && x.DeleteDate == null);
            if (ticket == null)
            {
                return (false, Array.Empty<long>());
            }

            var isSupport = User.IsInRole(RoleNames.Support) || User.IsInRole(RoleNames.Admin) || User.IsInRole(RoleNames.SuperAdmin);
            var canAccess = ticket.UserId == userId || ticket.AssignedToUserId == userId || isSupport;
            if (!canAccess)
            {
                return (false, Array.Empty<long>());
            }

            var memberIds = new HashSet<long> { ticket.UserId };
            if (ticket.AssignedToUserId.HasValue)
            {
                memberIds.Add(ticket.AssignedToUserId.Value);
            }
            if (isSupport)
            {
                memberIds.Add(userId);
            }

            return (true, memberIds);
        }

        private async Task<List<Notification>> AddMessageNotificationsAsync(Conversation conversation, Message message, long senderUserId)
        {
            var recipientIds = conversation.Members
                .Where(x => x.UserId != senderUserId && !x.IsMuted)
                .Select(x => x.UserId)
                .Distinct()
                .ToList();
            if (recipientIds.Count == 0)
            {
                return new List<Notification>();
            }

            var preferences = await _context.UserNotificationPreferences
                .AsNoTracking()
                .Where(x => recipientIds.Contains(x.UserId))
                .ToDictionaryAsync(x => x.UserId);
            recipientIds = recipientIds
                .Where(recipientId => ShouldSendConversationNotification(preferences.GetValueOrDefault(recipientId), conversation.ContextType))
                .ToList();
            if (recipientIds.Count == 0)
            {
                return new List<Notification>();
            }

            var senderName = await _context.Users
                .AsNoTracking()
                .Where(x => x.ID == senderUserId)
                .Select(x => ((x.FirstName + " " + x.LastName).Trim() == "" ? x.Username : (x.FirstName + " " + x.LastName).Trim()))
                .SingleOrDefaultAsync();

            var contextLabel = conversation.ContextType switch
            {
                ConversationContextType.Project => "پروژه",
                ConversationContextType.Order => "سفارش",
                ConversationContextType.Support => "پشتیبانی",
                _ => "گفتگو"
            };

            var now = DateTime.UtcNow;
            var notifications = new List<Notification>();
            foreach (var recipientId in recipientIds)
            {
                var notification = new Notification
                {
                    UserId = recipientId,
                    Message = $"پیام جدید از {senderName ?? "کاربر"} در گفتگوی {contextLabel} #{conversation.ContextId}",
                    IsRead = false,
                    CreateDate = now,
                    UpdateDate = now,
                    CreatorId = senderUserId,
                    IsActive = true
                };

                notifications.Add(notification);
                await _context.Notifications.AddAsync(notification);
            }

            return notifications;
        }

        private static bool ShouldSendConversationNotification(UserNotificationPreference? preference, ConversationContextType contextType)
        {
            if (preference == null)
            {
                return true;
            }

            if (!preference.InAppEnabled)
            {
                return false;
            }

            return contextType switch
            {
                ConversationContextType.Project => preference.ProjectEnabled,
                ConversationContextType.Order => preference.FinancialEnabled,
                ConversationContextType.Support => preference.SupportEnabled,
                _ => true
            };
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
