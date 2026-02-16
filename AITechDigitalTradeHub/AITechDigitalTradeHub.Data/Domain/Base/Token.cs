using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class Token
    {
        public long ID { get; set; }
        public long UserId { get; set; } // شناسه کاربر
        public string TokenValue { get; set; } // مقدار توکن
        public string Type { get; set; } // رفرش توکن
        public bool Status { get; set; } // رفرش توکن
        public DateTime ExpiryDate { get; set; } // تاریخ انقضا
        public DateTime CreatedDate { get; set; } = DateTime.Now; // تاریخ ایجاد
        public DateTime? RevokedDate { get; set; } // تاریخ لغو
    }
}