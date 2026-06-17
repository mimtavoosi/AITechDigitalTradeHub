namespace AITechDigitalTradeHub.Api.Infrastructure
{
    public class ApiErrorResponse
    {
        public bool Status { get; set; } = false;
        public string ErrorMessage { get; set; } = string.Empty;
        public string? TraceId { get; set; }
        public IDictionary<string, string[]>? Errors { get; set; }
    }
}
