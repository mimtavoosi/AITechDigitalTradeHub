using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>پروفایل مدرس برای سیستم آموزش.</summary>
    public class InstructorProfile : BaseEntity
    {
        public long UserId { get; set; }

        [MaxLength(200)]
        public string Headline { get; set; } = string.Empty;

        public string? Bio { get; set; }
        public string? ExpertiseJson { get; set; }
        public decimal RatingAverage { get; set; }
        public int CourseCount { get; set; }
        public int StudentCount { get; set; }
        public bool IsVerified { get; set; }

        public User User { get; set; } = default!;
    }
}
