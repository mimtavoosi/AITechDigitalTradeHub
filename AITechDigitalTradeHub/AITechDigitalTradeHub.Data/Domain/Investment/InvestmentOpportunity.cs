using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum FundraisingStage : byte { Idea = 1, MVP = 2, Growth = 3, Scale = 4 }
    public enum InvestmentOpportunityStatus : byte { Draft = 1, PendingReview = 2, Open = 3, Funded = 4, Closed = 5, Rejected = 6 }
    public enum InvestmentRiskLevel : byte { Low = 1, Medium = 2, High = 3 }

    /// <summary>فرصت سرمایه‌گذاری یا سرمایه‌پذیری.</summary>
    public class InvestmentOpportunity : BaseEntity
    {
        public long OwnerUserId { get; set; }
        public long? OrganizationId { get; set; }
        public long? ProjectId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(220)]
        public string Slug { get; set; } = string.Empty;

        public string? Summary { get; set; }
        public string? BusinessModel { get; set; }
        public string? Roadmap { get; set; }
        public FundraisingStage Stage { get; set; }
        public InvestmentOpportunityStatus Status { get; set; } = InvestmentOpportunityStatus.Draft;
        public InvestmentRiskLevel RiskLevel { get; set; } = InvestmentRiskLevel.Medium;

        public decimal RequiredCapital { get; set; }
        public decimal? RaisedCapital { get; set; }
        public decimal? OfferedSharePercent { get; set; }
        public decimal? ExpectedRoiPercent { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public DateTime? OpenedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public User OwnerUser { get; set; } = default!;
        public Organization? Organization { get; set; }
        public Project? Project { get; set; }
        public ICollection<InvestmentDocument> Documents { get; set; } = new List<InvestmentDocument>();
        public ICollection<InvestmentCommitment> Commitments { get; set; } = new List<InvestmentCommitment>();
        public ICollection<InvestmentTranche> Tranches { get; set; } = new List<InvestmentTranche>();
        public ICollection<InvestmentReport> Reports { get; set; } = new List<InvestmentReport>();
        public ICollection<InvestmentContract> Contracts { get; set; } = new List<InvestmentContract>();
    }
}
