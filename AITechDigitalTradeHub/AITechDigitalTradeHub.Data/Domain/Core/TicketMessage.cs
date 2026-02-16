using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // TicketMessage: جدول پیام‌های مرتبط با تیکت
    public class TicketMessage : BaseEntity
    {
        public long TicketId { get; set; } // کلید خارجی به Ticket
        public Ticket Ticket { get; set; } // ارتباط با Ticket
        public long? UserId { get; set; } // کلید خارجی به User
        public User? User { get; set; } // ارتباط با User
        public string MessageContent { get; set; } // متن پیام
        public bool IsAdminResponse { get; set; } // مشخص می‌کند پیام از سمت ادمین است یا کاربر
        public long? ResponserRoleId { get; set; } 
    }
}