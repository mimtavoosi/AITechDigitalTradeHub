namespace AITechDigitalTradeHub.Data.Domain
{
    public enum LessonProgressStatus : byte
    {
        NotStarted = 1,
        InProgress = 2,
        Completed = 3
    }

    public class CourseLessonProgress : BaseEntity
    {
        public long EnrollmentId { get; set; }
        public long CourseLessonId { get; set; }
        public long StudentUserId { get; set; }
        public LessonProgressStatus Status { get; set; } = LessonProgressStatus.NotStarted;
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }

        public CourseEnrollment Enrollment { get; set; } = default!;
        public CourseLesson CourseLesson { get; set; } = default!;
        public User StudentUser { get; set; } = default!;
    }
}
