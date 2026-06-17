namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvestmentCommitmentStatus : byte { Pending = 1, Accepted = 2, Rejected = 3, Cancelled = 4, Funded = 5 }

    /// <summary>تعهد یا درخواست سرمایه‌گذاری سرمایه‌گذار.</summary>
    public class InvestmentCommitment : BaseEntity
    {
        public long InvestmentOpportunityId { get; set; }
        public long InvestorUserId { get; set; }
        public long? InvestorOrganizationId { get; set; }
        public decimal Amount { get; set; }
        public decimal? SharePercent { get; set; }
        public InvestmentCommitmentStatus Status { get; set; } = InvestmentCommitmentStatus.Pending;
        public long? EscrowId { get; set; }

        public InvestmentOpportunity InvestmentOpportunity { get; set; } = default!;
        public User InvestorUser { get; set; } = default!;
        public Organization? InvestorOrganization { get; set; }
        public Escrow? Escrow { get; set; }
    }
}
