using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ConversationContextType : byte { Project = 1, Order = 2, Support = 3 }
    public enum MessageType : byte { Text = 1, File = 2, System = 3 }

    /// <summary>گفتگو (مرتبط با پروژه/سفارش/پشتیبانی).</summary>
    public class Conversation : BaseEntity
    {
        public ConversationContextType ContextType { get; set; }
        public long ContextId { get; set; }

        public ICollection<ConversationMember> Members { get; set; } = new List<ConversationMember>();
        public ICollection<Message> Messages { get; set; } = new List<Message>();
    }
}