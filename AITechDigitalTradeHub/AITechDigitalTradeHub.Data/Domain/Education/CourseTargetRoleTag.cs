namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>نقش‌های شغلی/مسیرهایی که این دوره به آن‌ها کمک می‌کند.</summary>
    public class CourseTargetRoleTag
    {
        public long CourseId { get; set; }
        public long TagId { get; set; }
        public byte Weight { get; set; } = 1;

        public Course Course { get; set; } = default!;
        public Tag Tag { get; set; } = default!;
    }
}
