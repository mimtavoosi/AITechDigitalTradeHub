using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum TicketCategory : byte { Technical = 1, Financial = 2, Project = 3, Education = 4, Dispute = 5, General = 6 }
    public enum TicketStatus : byte { Open = 1, Pending = 2, Answered = 3, Resolved = 4, Closed = 5 }
    public enum TicketPriority : byte { Low = 1, Normal = 2, High = 3, Urgent = 4 }

    // Ticket: جدول تیکت‌ها
    public class Ticket : BaseEntity
    {
        public string Subject { get; set; } // موضوع تیکت
        public string Description { get; set; } // توضیحات تیکت
        public long UserId { get; set; } // کلید خارجی به User (کاربری که تیکت را ثبت کرده است)
        public long? AssignedToUserId { get; set; }

        public TicketCategory Category { get; set; } = TicketCategory.General;
        public TicketStatus Status { get; set; } = TicketStatus.Open;
        public TicketPriority Priority { get; set; } = TicketPriority.Normal;

        public string? ReferenceType { get; set; }
        public long? ReferenceId { get; set; }
        public DateTime? SlaDueAt { get; set; }
        public DateTime? FirstRespondedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public byte? SatisfactionScore { get; set; }

        public User User { get; set; } // ارتباط با User
        public User? AssignedToUser { get; set; }
        public ICollection<TicketMessage> Messages { get; set; } // پیام‌های مرتبط با تیکت
        public ICollection<TicketAttachment> Attachments { get; set; } = new List<TicketAttachment>();
    }
}
