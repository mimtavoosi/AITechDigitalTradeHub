using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>اعضای گفتگو.</summary>
    public class ConversationMember : BaseEntity
    {
        public long ConversationId { get; set; }
        public long UserId { get; set; }

        /// <summary>آخرین پیام خوانده‌شده (برای Seen/Unread).</summary>
        public long? LastReadMessageId { get; set; }

        /// <summary>بی‌صدا کردن گفتگو.</summary>
        public bool IsMuted { get; set; }

        public Conversation Conversation { get; set; } = default!;
        public User User { get; set; } = default!;
    }
}