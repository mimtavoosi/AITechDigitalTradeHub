namespace AITechDigitalTradeHub.Api.ViewModels.Dashboard
{
    public class DashboardSummaryResponse
    {
        public int ListingsCount { get; set; }
        public int ProjectsCount { get; set; }
        public int SentProposalsCount { get; set; }
        public int PurchasesCount { get; set; }
        public int SalesCount { get; set; }
        public decimal WalletBalance { get; set; }
        public string Currency { get; set; } = "IRR";
    }
}
