namespace AITechDigitalTradeHub.Api.Services
{
    public class SmsSenderOptions
    {
        public bool Enable { get; set; }
        public string PanelProvider { get; set; } = "FarazSMS";
        public string PanelApiKey { get; set; } = string.Empty;
        public string PanelLineNumber { get; set; } = string.Empty;
        public string PanelApiUrl { get; set; } = "https://edge.ippanel.com/v1";
        public string PatternCode { get; set; } = string.Empty;
        public int VerificationCodeMinutes { get; set; } = 5;
    }
}
