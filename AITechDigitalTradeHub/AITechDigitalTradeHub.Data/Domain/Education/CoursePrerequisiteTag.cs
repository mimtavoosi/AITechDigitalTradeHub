namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مهارت‌های پیش‌نیاز دوره.</summary>
    public class CoursePrerequisiteTag
    {
        public long CourseId { get; set; }
        public long TagId { get; set; }
        public byte MinimumLevel { get; set; } = 1;

        public Course Course { get; set; } = default!;
        public Tag Tag { get; set; } = default!;
    }
}
