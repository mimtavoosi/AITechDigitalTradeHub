using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvestmentContractStatus : byte { Draft = 1, Active = 2, Completed = 3, Terminated = 4, Disputed = 5 }

    /// <summary>قرارداد دیجیتال سرمایه‌گذاری و شرایط آزادسازی سرمایه.</summary>
    public class InvestmentContract : BaseEntity
    {
        public long InvestmentOpportunityId { get; set; }
        public long InvestorUserId { get; set; }
        public long? InvestorOrganizationId { get; set; }
        public long? EscrowId { get; set; }
        public long? ContractFileId { get; set; }

        public decimal Amount { get; set; }
        public decimal? SharePercent { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public InvestmentContractStatus Status { get; set; } = InvestmentContractStatus.Draft;
        public string? TermsJson { get; set; }
        public string? ReleaseConditionsJson { get; set; }
        public DateTime? SignedAt { get; set; }
        public DateTime? TerminatedAt { get; set; }

        public InvestmentOpportunity InvestmentOpportunity { get; set; } = default!;
        public User InvestorUser { get; set; } = default!;
        public Organization? InvestorOrganization { get; set; }
        public Escrow? Escrow { get; set; }
        public FileUpload? ContractFile { get; set; }
    }
}
