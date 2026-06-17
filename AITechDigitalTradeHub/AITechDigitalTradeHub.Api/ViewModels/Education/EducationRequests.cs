using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Education
{
    public class CourseUpsertRequest
    {
        public long? OrganizationId { get; set; }

        [Range(1, long.MaxValue)]
        public long CategoryId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(220)]
        public string? Slug { get; set; }

        public string? Description { get; set; }
        public CourseLevel Level { get; set; } = CourseLevel.Beginner;
        public CourseDeliveryMode DeliveryMode { get; set; } = CourseDeliveryMode.Recorded;

        [Range(0, double.MaxValue)]
        public decimal PriceAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public int? DurationMinutes { get; set; }
        public DateTime? StartsAt { get; set; }
        public long? CoverFileId { get; set; }

        public Course ToEntity(long instructorUserId)
        {
            return new Course
            {
                InstructorUserId = instructorUserId,
                OrganizationId = OrganizationId,
                CategoryId = CategoryId,
                Title = Title.Trim(),
                Slug = string.IsNullOrWhiteSpace(Slug) ? Title.Trim().Replace(' ', '-') : Slug.Trim(),
                Description = Description,
                Level = Level,
                DeliveryMode = DeliveryMode,
                PriceAmount = PriceAmount,
                Currency = Currency,
                DurationMinutes = DurationMinutes,
                StartsAt = StartsAt,
                CoverFileId = CoverFileId
            };
        }
    }

    public class CreateCourseLessonRequest
    {
        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public LessonContentType ContentType { get; set; } = LessonContentType.Video;

        [Range(0, int.MaxValue)]
        public int SortOrder { get; set; }

        public int? DurationMinutes { get; set; }
        public long? FileUploadId { get; set; }
        public string? ExternalUrl { get; set; }
        public bool IsPreview { get; set; }

        public CourseLesson ToEntity()
        {
            return new CourseLesson
            {
                Title = Title.Trim(),
                Description = Description,
                ContentType = ContentType,
                SortOrder = SortOrder,
                DurationMinutes = DurationMinutes,
                FileUploadId = FileUploadId,
                ExternalUrl = ExternalUrl,
                IsPreview = IsPreview
            };
        }
    }

    public class CreateTeacherSlotRequest
    {
        public long? OrganizationId { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public TeacherSessionMode Mode { get; set; } = TeacherSessionMode.Online;

        [Range(0, double.MaxValue)]
        public decimal PriceAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        [MaxLength(160)]
        public string? LocationTitle { get; set; }

        public string? Notes { get; set; }

        public TeacherAvailabilitySlot ToEntity(long instructorUserId)
        {
            return new TeacherAvailabilitySlot
            {
                InstructorUserId = instructorUserId,
                OrganizationId = OrganizationId,
                StartsAt = StartsAt,
                EndsAt = EndsAt,
                Mode = Mode,
                PriceAmount = PriceAmount,
                Currency = Currency,
                LocationTitle = LocationTitle,
                Notes = Notes
            };
        }
    }

    public class BookTeacherSlotRequest
    {
        [MaxLength(500)]
        public string? Subject { get; set; }

        public string? StudentNotes { get; set; }
    }
}
