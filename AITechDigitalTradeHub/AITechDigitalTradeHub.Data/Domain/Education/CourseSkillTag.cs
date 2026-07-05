namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مهارت‌هایی که این دوره آموزش می‌دهد.</summary>
    public class CourseSkillTag
    {
        public long CourseId { get; set; }
        public long TagId { get; set; }
        public byte Weight { get; set; } = 1;

        public Course Course { get; set; } = default!;
        public Tag Tag { get; set; } = default!;
    }
}
