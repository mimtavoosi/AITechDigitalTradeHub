using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum CourseLevel : byte { Beginner = 1, Intermediate = 2, Advanced = 3 }
    public enum CourseDeliveryMode : byte { Recorded = 1, LiveOnline = 2, InPerson = 3, Hybrid = 4 }
    public enum CourseStatus : byte { Draft = 1, PendingReview = 2, Published = 3, Archived = 4 }

    /// <summary>دوره آموزشی هوش مصنوعی.</summary>
    public class Course : BaseEntity
    {
        public long InstructorUserId { get; set; }
        public long? OrganizationId { get; set; }
        public long CategoryId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(220)]
        public string Slug { get; set; } = string.Empty;

        public string? Description { get; set; }
        public CourseLevel Level { get; set; }
        public CourseDeliveryMode DeliveryMode { get; set; }
        public CourseStatus Status { get; set; } = CourseStatus.Draft;

        public decimal PriceAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public int? DurationMinutes { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public long? CoverFileId { get; set; }

        public User InstructorUser { get; set; } = default!;
        public Organization? Organization { get; set; }
        public Category Category { get; set; } = default!;
        public FileUpload? CoverFile { get; set; }
        public ICollection<CourseLesson> Lessons { get; set; } = new List<CourseLesson>();
        public ICollection<CourseEnrollment> Enrollments { get; set; } = new List<CourseEnrollment>();
    }
}
