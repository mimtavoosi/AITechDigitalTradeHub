namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvestorType : byte { Individual = 1, Company = 2, VentureCapital = 3, Angel = 4 }

    /// <summary>پروفایل سرمایه‌گذار.</summary>
    public class InvestorProfile : BaseEntity
    {
        public long UserId { get; set; }
        public long? OrganizationId { get; set; }
        public InvestorType InvestorType { get; set; }
        public decimal? PreferredTicketMin { get; set; }
        public decimal? PreferredTicketMax { get; set; }
        public string? FocusAreasJson { get; set; }
        public bool IsVerified { get; set; }

        public User User { get; set; } = default!;
        public Organization? Organization { get; set; }
    }
}
