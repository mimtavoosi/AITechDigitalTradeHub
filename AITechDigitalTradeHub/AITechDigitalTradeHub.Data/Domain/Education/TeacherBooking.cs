using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum TeacherBookingStatus : byte
    {
        PendingPayment = 1,
        PendingOrganizationApproval = 2,
        Confirmed = 3,
        Completed = 4,
        Cancelled = 5,
        Rejected = 6,
        Refunded = 7
    }

    /// <summary>رزرو جلسه با مدرس توسط کاربر یا از طرف یک شرکت.</summary>
    public class TeacherBooking : BaseEntity
    {
        public long InstructorUserId { get; set; }
        public long StudentUserId { get; set; }
        public long? OrganizationId { get; set; }
        public long? AvailabilitySlotId { get; set; }
        public long? TransactionId { get; set; }

        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }

        public TeacherSessionMode Mode { get; set; } = TeacherSessionMode.Online;
        public TeacherBookingStatus Status { get; set; } = TeacherBookingStatus.PendingPayment;

        public decimal PriceAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        [MaxLength(500)]
        public string? Subject { get; set; }

        public string? StudentNotes { get; set; }
        public string? MeetingUrl { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        public User InstructorUser { get; set; } = default!;
        public User StudentUser { get; set; } = default!;
        public Organization? Organization { get; set; }
        public TeacherAvailabilitySlot? AvailabilitySlot { get; set; }
        public Transaction? Transaction { get; set; }
    }
}
