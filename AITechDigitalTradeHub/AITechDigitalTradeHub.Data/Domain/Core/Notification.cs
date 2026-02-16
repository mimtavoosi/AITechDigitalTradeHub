using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // Notification: جدول اعلان‌ها
    public class Notification : BaseEntity
    {
        public string Message { get; set; }
        public long UserId { get; set; } // کلید خارجی به User
        public User User { get; set; } // ارتباط با User
        public bool IsRead { get; set; }
    }
}