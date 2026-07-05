using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Finance
{
    public class FeeRuleRequest
    {
        public PlatformFeeContextType ContextType { get; set; }
        public decimal Percent { get; set; }
        public decimal? FixedAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public byte? MinTrustLevel { get; set; }
        public bool IsActiveRule { get; set; } = true;

        public PlatformFeeRule ToEntity()
        {
            return new PlatformFeeRule
            {
                ContextType = ContextType,
                Percent = Percent,
                FixedAmount = FixedAmount,
                Currency = Currency,
                MinAmount = MinAmount,
                MaxAmount = MaxAmount,
                MinTrustLevel = MinTrustLevel,
                IsActiveRule = IsActiveRule
            };
        }
    }
}
