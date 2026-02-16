using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // LoginMethod: جدول روش‌های ورود
    public class LoginMethod : BaseEntity
    {
        public long? UserId { get; set; } // کلید خارجی به User
        public User? User { get; set; } // ارتباط با User
        public string? MobileNumber { get; set; } // شماره موبایل کاربر
        public string Method { get; set; } // نوع روش (SMS, Token)
        public string Token { get; set; } // کد پیامک یا توکن
        public DateTime? ExpirationDate { get; set; } // تاریخ انقضا
    }
}