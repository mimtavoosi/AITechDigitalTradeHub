using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum LessonContentType : byte { Video = 1, Text = 2, File = 3, LiveSession = 4, Quiz = 5 }

    /// <summary>جلسه یا محتوای یک دوره.</summary>
    public class CourseLesson : BaseEntity
    {
        public long CourseId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public LessonContentType ContentType { get; set; }
        public int SortOrder { get; set; }
        public int? DurationMinutes { get; set; }
        public long? FileUploadId { get; set; }
        public string? ExternalUrl { get; set; }
        public bool IsPreview { get; set; }

        public Course Course { get; set; } = default!;
        public FileUpload? FileUpload { get; set; }
    }
}
