using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvestmentTrancheStatus : byte { Planned = 1, ReadyToRelease = 2, Released = 3, Blocked = 4, Cancelled = 5 }

    /// <summary>مرحله آزادسازی سرمایه.</summary>
    public class InvestmentTranche : BaseEntity
    {
        public long InvestmentOpportunityId { get; set; }

        [MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        public decimal Amount { get; set; }
        public string? ReleaseCondition { get; set; }
        public DateTime? DueAt { get; set; }
        public DateTime? ReleasedAt { get; set; }
        public InvestmentTrancheStatus Status { get; set; } = InvestmentTrancheStatus.Planned;

        public InvestmentOpportunity InvestmentOpportunity { get; set; } = default!;
    }
}
