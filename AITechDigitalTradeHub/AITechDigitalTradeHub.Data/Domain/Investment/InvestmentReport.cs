using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>گزارش عملکرد، مصرف سرمایه و ROI برای سرمایه‌گذار.</summary>
    public class InvestmentReport : BaseEntity
    {
        public long InvestmentOpportunityId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }
        public decimal? SpentAmount { get; set; }
        public decimal? RoiPercent { get; set; }
        public DateTime ReportedAt { get; set; } = DateTime.UtcNow;

        public InvestmentOpportunity InvestmentOpportunity { get; set; } = default!;
    }
}
