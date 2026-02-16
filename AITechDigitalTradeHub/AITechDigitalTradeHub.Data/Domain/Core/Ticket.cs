using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // Ticket: جدول تیکت‌ها
    public class Ticket : BaseEntity
    {
        public string Subject { get; set; } // موضوع تیکت
        public string Description { get; set; } // توضیحات تیکت
        public long UserId { get; set; } // کلید خارجی به User (کاربری که تیکت را ثبت کرده است)
        public User User { get; set; } // ارتباط با User
        public ICollection<TicketMessage> Messages { get; set; } // پیام‌های مرتبط با تیکت
    }
}