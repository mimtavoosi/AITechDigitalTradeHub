using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Education
{
    public class CourseListItemResponse
    {
        public long Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public CourseLevel Level { get; set; }
        public CourseDeliveryMode DeliveryMode { get; set; }
        public CourseStatus Status { get; set; }
        public decimal PriceAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public int? DurationMinutes { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? CategoryName { get; set; }
        public long InstructorUserId { get; set; }
        public string? InstructorName { get; set; }
        public int LessonsCount { get; set; }
        public int EnrollmentsCount { get; set; }

        public static CourseListItemResponse FromEntity(Course course)
        {
            return new CourseListItemResponse
            {
                Id = course.ID,
                Slug = string.IsNullOrWhiteSpace(course.Slug) ? course.ID.ToString() : course.Slug,
                Title = course.Title,
                Description = course.Description,
                Level = course.Level,
                DeliveryMode = course.DeliveryMode,
                Status = course.Status,
                PriceAmount = course.PriceAmount,
                Currency = course.Currency,
                DurationMinutes = course.DurationMinutes,
                StartsAt = course.StartsAt,
                PublishedAt = course.PublishedAt,
                CategoryName = course.Category?.CategoryName,
                InstructorUserId = course.InstructorUserId,
                InstructorName = course.InstructorUser == null ? null : $"{course.InstructorUser.FirstName} {course.InstructorUser.LastName}".Trim(),
                LessonsCount = course.Lessons?.Count ?? 0,
                EnrollmentsCount = course.Enrollments?.Count ?? 0
            };
        }
    }

    public class CourseDetailResponse : CourseListItemResponse
    {
        public long? OrganizationId { get; set; }
        public List<CourseLessonResponse> Lessons { get; set; } = new();

        public static new CourseDetailResponse FromEntity(Course course)
        {
            return new CourseDetailResponse
            {
                Id = course.ID,
                Slug = string.IsNullOrWhiteSpace(course.Slug) ? course.ID.ToString() : course.Slug,
                Title = course.Title,
                Description = course.Description,
                Level = course.Level,
                DeliveryMode = course.DeliveryMode,
                Status = course.Status,
                PriceAmount = course.PriceAmount,
                Currency = course.Currency,
                DurationMinutes = course.DurationMinutes,
                StartsAt = course.StartsAt,
                PublishedAt = course.PublishedAt,
                CategoryName = course.Category?.CategoryName,
                InstructorUserId = course.InstructorUserId,
                InstructorName = course.InstructorUser == null ? null : $"{course.InstructorUser.FirstName} {course.InstructorUser.LastName}".Trim(),
                LessonsCount = course.Lessons?.Count ?? 0,
                EnrollmentsCount = course.Enrollments?.Count ?? 0,
                OrganizationId = course.OrganizationId,
                Lessons = course.Lessons?.OrderBy(x => x.SortOrder).Select(CourseLessonResponse.FromEntity).ToList() ?? new List<CourseLessonResponse>()
            };
        }
    }

    public class CourseLessonResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public LessonContentType ContentType { get; set; }
        public int SortOrder { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ExternalUrl { get; set; }
        public bool IsPreview { get; set; }

        public static CourseLessonResponse FromEntity(CourseLesson lesson)
        {
            return new CourseLessonResponse
            {
                Id = lesson.ID,
                CourseId = lesson.CourseId,
                Title = lesson.Title,
                Description = lesson.Description,
                ContentType = lesson.ContentType,
                SortOrder = lesson.SortOrder,
                DurationMinutes = lesson.DurationMinutes,
                ExternalUrl = lesson.ExternalUrl,
                IsPreview = lesson.IsPreview
            };
        }
    }

    public class CourseEnrollmentResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public string? InstructorName { get; set; }
        public EnrollmentStatus Status { get; set; }
        public decimal PaidAmount { get; set; }
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }

        public static CourseEnrollmentResponse FromEntity(CourseEnrollment enrollment)
        {
            return new CourseEnrollmentResponse
            {
                Id = enrollment.ID,
                CourseId = enrollment.CourseId,
                CourseTitle = enrollment.Course?.Title,
                InstructorName = enrollment.Course?.InstructorUser == null ? null : $"{enrollment.Course.InstructorUser.FirstName} {enrollment.Course.InstructorUser.LastName}".Trim(),
                Status = enrollment.Status,
                PaidAmount = enrollment.PaidAmount,
                ProgressPercent = enrollment.ProgressPercent,
                CompletedAt = enrollment.CompletedAt
            };
        }
    }

    public class TeacherSlotResponse
    {
        public long Id { get; set; }
        public long InstructorUserId { get; set; }
        public string? InstructorName { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public TeacherSessionMode Mode { get; set; }
        public TeacherAvailabilityStatus Status { get; set; }
        public decimal PriceAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public string? LocationTitle { get; set; }
        public string? Notes { get; set; }

        public static TeacherSlotResponse FromEntity(TeacherAvailabilitySlot slot)
        {
            return new TeacherSlotResponse
            {
                Id = slot.ID,
                InstructorUserId = slot.InstructorUserId,
                InstructorName = slot.InstructorUser == null ? null : $"{slot.InstructorUser.FirstName} {slot.InstructorUser.LastName}".Trim(),
                StartsAt = slot.StartsAt,
                EndsAt = slot.EndsAt,
                Mode = slot.Mode,
                Status = slot.Status,
                PriceAmount = slot.PriceAmount,
                Currency = slot.Currency,
                LocationTitle = slot.LocationTitle,
                Notes = slot.Notes
            };
        }
    }
}
