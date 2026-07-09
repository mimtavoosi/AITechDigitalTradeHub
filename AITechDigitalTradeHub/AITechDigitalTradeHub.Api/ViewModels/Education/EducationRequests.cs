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
        public EducationLearningGoal? LearningGoal { get; set; }
        public EducationTargetRole? TargetRole { get; set; }
        public int? EstimatedWeeks { get; set; }
        public int? WeeklyHoursMin { get; set; }
        public int? WeeklyHoursMax { get; set; }
        public byte? DifficultyScore { get; set; }
        public bool ProjectBased { get; set; }
        public bool RequiresMentor { get; set; }
        public string? LearningOutcomes { get; set; }
        public string? PrerequisitesSummary { get; set; }

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
                CoverFileId = CoverFileId,
                LearningGoal = LearningGoal,
                TargetRole = TargetRole,
                EstimatedWeeks = EstimatedWeeks,
                WeeklyHoursMin = WeeklyHoursMin,
                WeeklyHoursMax = WeeklyHoursMax,
                DifficultyScore = DifficultyScore,
                ProjectBased = ProjectBased,
                RequiresMentor = RequiresMentor,
                LearningOutcomes = LearningOutcomes,
                PrerequisitesSummary = PrerequisitesSummary
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
        public long? SectionId { get; set; }

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
                IsPreview = IsPreview,
                SectionId = SectionId
            };
        }
    }

    public class SaveCourseSectionRequest
    {
        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(600)]
        public string? LearningObjective { get; set; }

        [Range(0, int.MaxValue)]
        public int SortOrder { get; set; }

        public int? DurationMinutes { get; set; }
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

    public class UpdateCourseProgressRequest
    {
        [Range(0, 100)]
        public byte ProgressPercent { get; set; }
    }

    public class UpdateLessonProgressRequest
    {
        [Range(0, 100)]
        public byte ProgressPercent { get; set; }
    }

    public class EducationQuestionnaireRequest
    {
        public string Goal { get; set; } = string.Empty;
        public EducationLearningGoal? LearningGoal { get; set; }
        public EducationTargetRole? TargetRole { get; set; }
        public CourseLevel Level { get; set; } = CourseLevel.Beginner;
        public int WeeklyHours { get; set; } = 4;
        public string PreferredMode { get; set; } = "Recorded";
        public List<long> SkillTagIds { get; set; } = new();
        public List<long> SelectedOptionIds { get; set; } = new();

        [MaxLength(1500)]
        public string FreeText { get; set; } = string.Empty;
    }

    public class UpdateTeacherBookingStatusRequest
    {
        public TeacherBookingStatus Status { get; set; }
        public string? MeetingUrl { get; set; }
    }

    public class UpdateCourseStatusRequest
    {
        public CourseStatus Status { get; set; }
    }
}
