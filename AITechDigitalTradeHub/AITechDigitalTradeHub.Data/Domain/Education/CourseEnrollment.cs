namespace AITechDigitalTradeHub.Data.Domain
{
    public enum EnrollmentStatus : byte { PendingPayment = 1, Active = 2, Completed = 3, Cancelled = 4, Refunded = 5 }

    /// <summary>ثبت‌نام کاربر در دوره.</summary>
    public class CourseEnrollment : BaseEntity
    {
        public long CourseId { get; set; }
        public long StudentUserId { get; set; }
        public long? TransactionId { get; set; }
        public EnrollmentStatus Status { get; set; } = EnrollmentStatus.PendingPayment;
        public decimal PaidAmount { get; set; }
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }

        public Course Course { get; set; } = default!;
        public User StudentUser { get; set; } = default!;
        public Transaction? Transaction { get; set; }
    }
}
