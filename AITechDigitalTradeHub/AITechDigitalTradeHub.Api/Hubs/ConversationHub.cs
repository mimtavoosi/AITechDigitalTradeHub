using System.Security.Claims;
using AITechDigitalTradeHub.Data.DataLayer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Hubs
{
    [Authorize]
    public class ConversationHub : Hub
    {
        private readonly TheAppContext _context;

        public ConversationHub(TheAppContext context)
        {
            _context = context;
        }

        public static string ConversationGroup(long conversationId) => $"conversation-{conversationId}";

        public static string UserGroup(long userId) => $"user-{userId}";

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId > 0)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));
            }

            await base.OnConnectedAsync();
        }

        public async Task JoinConversation(long conversationId)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                throw new HubException("Unauthorized");
            }

            var canJoin = await _context.ConversationMembers
                .AsNoTracking()
                .AnyAsync(x => x.ConversationId == conversationId && x.UserId == userId && x.DeleteDate == null);
            if (!canJoin)
            {
                throw new HubException("Conversation access denied.");
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        public async Task LeaveConversation(long conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, ConversationGroup(conversationId));
        }

        private long GetCurrentUserId()
        {
            var value = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
