using AITechDigitalTradeHub.Data.Domain;

namespace AiTech.Domains
{
    // PaymentHistory: جدول تاریخچه پرداخت‌ها
    public class PaymentHistory : BaseEntity
    {
        public decimal Amount { get; set; }
        public DateTime PaymentDate { get; set; }
        public long UserId { get; set; } // کلید خارجی به User
        public User User { get; set; } // ارتباط با User
        public long ForeignKeyId { get; set; } // کلید خارجی به رکورد اصلی
        public string EntityType { get; set; } // نوع جدول مرتبط (مثلاً "User", "Course", "Event")
        public bool PaymentStatus { get; set; } // وضعیت پرداخت
    }
}