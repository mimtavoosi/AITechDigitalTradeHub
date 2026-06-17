using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum OrganizationPaymentRequestType : byte
    {
        ListingOrder = 1,
        Project = 2,
        CourseEnrollment = 3,
        TeacherBooking = 4,
        ResourceReservation = 5
    }

    public enum OrganizationPaymentRequestStatus : byte
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Cancelled = 4,
        Expired = 5
    }

    /// <summary>درخواست کارمند برای خرید خدمت/دوره/رزرو با پرداخت از کیف پول شرکت.</summary>
    public class OrganizationPaymentRequest : BaseEntity
    {
        public long OrganizationId { get; set; }
        public long RequesterUserId { get; set; }
        public long? ApproverUserId { get; set; }
        public long? WalletId { get; set; }
        public long? TransactionId { get; set; }

        public OrganizationPaymentRequestType RequestType { get; set; }

        [MaxLength(64)]
        public string? ReferenceType { get; set; }

        public long? ReferenceId { get; set; }

        public decimal Amount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public OrganizationPaymentRequestStatus Status { get; set; } = OrganizationPaymentRequestStatus.Pending;

        [MaxLength(500)]
        public string? Reason { get; set; }

        [MaxLength(500)]
        public string? DecisionNote { get; set; }

        public DateTime? DecidedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }

        public Organization Organization { get; set; } = default!;
        public User RequesterUser { get; set; } = default!;
        public User? ApproverUser { get; set; }
        public Wallet? Wallet { get; set; }
        public Transaction? Transaction { get; set; }
    }
}
