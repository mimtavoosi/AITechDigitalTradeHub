using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum TeacherAvailabilityStatus : byte { Available = 1, Reserved = 2, Blocked = 3 }
    public enum TeacherSessionMode : byte { Online = 1, InPerson = 2, Hybrid = 3 }

    /// <summary>زمان‌های قابل رزرو مدرس برای کلاس خصوصی یا مشاوره آموزشی.</summary>
    public class TeacherAvailabilitySlot : BaseEntity
    {
        public long InstructorUserId { get; set; }
        public long? OrganizationId { get; set; }

        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }

        public TeacherSessionMode Mode { get; set; } = TeacherSessionMode.Online;
        public TeacherAvailabilityStatus Status { get; set; } = TeacherAvailabilityStatus.Available;

        public decimal PriceAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        [MaxLength(160)]
        public string? LocationTitle { get; set; }

        public string? Notes { get; set; }

        public User InstructorUser { get; set; } = default!;
        public Organization? Organization { get; set; }
        public ICollection<TeacherBooking> Bookings { get; set; } = new List<TeacherBooking>();
    }
}
