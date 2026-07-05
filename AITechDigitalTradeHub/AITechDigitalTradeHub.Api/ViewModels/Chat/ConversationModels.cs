using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Chat
{
    public class CreateConversationRequest
    {
        public ConversationContextType ContextType { get; set; }

        [Range(1, long.MaxValue)]
        public long ContextId { get; set; }
    }

    public class SendConversationMessageRequest
    {
        [MaxLength(4000)]
        public string? Text { get; set; }

        public long? FileUploadId { get; set; }
    }

    public class ConversationResponse
    {
        public long Id { get; set; }
        public ConversationContextType ContextType { get; set; }
        public long ContextId { get; set; }
        public int UnreadCount { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public ConversationMessageResponse? LastMessage { get; set; }
        public List<ConversationMemberResponse> Members { get; set; } = new();
        public List<ConversationMessageResponse> Messages { get; set; } = new();

        public static ConversationResponse FromEntity(Conversation conversation, long currentUserId, bool includeMessages = true)
        {
            var messages = conversation.Messages?.OrderBy(x => x.CreateDate).ToList() ?? new List<Message>();
            var currentMember = conversation.Members?.SingleOrDefault(x => x.UserId == currentUserId);
            var lastReadId = currentMember?.LastReadMessageId ?? 0;

            return new ConversationResponse
            {
                Id = conversation.ID,
                ContextType = conversation.ContextType,
                ContextId = conversation.ContextId,
                UnreadCount = messages.Count(x => x.ID > lastReadId && x.SenderUserId != currentUserId),
                LastMessageAt = messages.LastOrDefault()?.CreateDate,
                LastMessage = messages.LastOrDefault() is { } lastMessage ? ConversationMessageResponse.FromEntity(lastMessage) : null,
                Members = conversation.Members?.Select(ConversationMemberResponse.FromEntity).ToList() ?? new List<ConversationMemberResponse>(),
                Messages = includeMessages ? messages.Select(ConversationMessageResponse.FromEntity).ToList() : new List<ConversationMessageResponse>()
            };
        }
    }

    public class ConversationMemberResponse
    {
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public long? LastReadMessageId { get; set; }
        public bool IsMuted { get; set; }

        public static ConversationMemberResponse FromEntity(ConversationMember member)
        {
            return new ConversationMemberResponse
            {
                UserId = member.UserId,
                UserName = member.User == null ? null : FormatUserName(member.User),
                LastReadMessageId = member.LastReadMessageId,
                IsMuted = member.IsMuted
            };
        }

        private static string FormatUserName(User user)
        {
            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrWhiteSpace(fullName) ? user.Username : fullName;
        }
    }

    public class ConversationMessageResponse
    {
        public long Id { get; set; }
        public long ConversationId { get; set; }
        public long SenderUserId { get; set; }
        public string? SenderName { get; set; }
        public MessageType MessageType { get; set; }
        public string? Text { get; set; }
        public long? FileUploadId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ConversationMessageResponse FromEntity(Message message)
        {
            return new ConversationMessageResponse
            {
                Id = message.ID,
                ConversationId = message.ConversationId,
                SenderUserId = message.SenderUserId,
                SenderName = message.SenderUser == null ? null : FormatUserName(message.SenderUser),
                MessageType = message.MessageType,
                Text = message.Text,
                FileUploadId = message.FileUploadId,
                FileName = message.FileUpload?.FileName,
                FileUrl = message.FileUpload?.GetUrl ?? message.FileUpload?.FilePath,
                CreateDate = message.CreateDate
            };
        }

        private static string FormatUserName(User user)
        {
            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrWhiteSpace(fullName) ? user.Username : fullName;
        }
    }
}
