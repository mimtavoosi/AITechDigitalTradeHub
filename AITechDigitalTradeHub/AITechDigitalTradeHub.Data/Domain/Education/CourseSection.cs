using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>سرفصل (فصل) یک دوره؛ درس‌های دوره زیر سرفصل‌ها گروه‌بندی می‌شوند.</summary>
    public class CourseSection : BaseEntity
    {
        public long CourseId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        /// <summary>هدف یادگیری این سرفصل؛ برای نمایش و تحلیل هوش مصنوعی مسیر یادگیری.</summary>
        [MaxLength(600)]
        public string? LearningObjective { get; set; }

        public int SortOrder { get; set; }
        public int? DurationMinutes { get; set; }

        public Course Course { get; set; } = default!;
        public ICollection<CourseLesson> Lessons { get; set; } = new List<CourseLesson>();
    }
}
