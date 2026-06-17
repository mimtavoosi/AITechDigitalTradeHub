using System.Security.Cryptography;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace AITechDigitalTradeHub.Api.Services
{
    public interface ISmsSender
    {
        Task<SmsSendResult> SendVerificationCodeAsync(string mobileNumber, CancellationToken cancellationToken = default);
    }

    public class SmsSendResult
    {
        public bool Sent { get; set; }
        public string Code { get; set; } = string.Empty;
        public string? ErrorMessage { get; set; }
    }

    public class FarazSmsSender : ISmsSender
    {
        private readonly HttpClient _httpClient;
        private readonly SmsSenderOptions _options;
        private readonly ILogger<FarazSmsSender> _logger;

        public FarazSmsSender(
            HttpClient httpClient,
            IOptions<SmsSenderOptions> options,
            ILogger<FarazSmsSender> logger)
        {
            _httpClient = httpClient;
            _options = options.Value;
            _logger = logger;
        }

        public async Task<SmsSendResult> SendVerificationCodeAsync(string mobileNumber, CancellationToken cancellationToken = default)
        {
            var code = GenerateVerificationCode();

            if (!_options.Enable)
            {
                _logger.LogInformation("SMS sender is disabled. Verification code generated for {MobileNumber}.", mobileNumber);
                return new SmsSendResult { Sent = true, Code = code };
            }

            if (string.IsNullOrWhiteSpace(_options.PanelApiKey) ||
                string.IsNullOrWhiteSpace(_options.PanelLineNumber) ||
                string.IsNullOrWhiteSpace(_options.PatternCode))
            {
                return new SmsSendResult
                {
                    Sent = false,
                    Code = code,
                    ErrorMessage = "تنظیمات سرویس پیامک کامل نیست"
                };
            }

            var body = new
            {
                sending_type = "pattern",
                from_number = _options.PanelLineNumber,
                code = _options.PatternCode,
                recipients = new[] { mobileNumber },
                @params = new { ver = code }
            };

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.PanelApiUrl.TrimEnd('/')}/api/send");
                request.Headers.TryAddWithoutValidation("Authorization", _options.PanelApiKey);
                request.Content = JsonContent.Create(body);

                using var response = await _httpClient.SendAsync(request, cancellationToken);
                var content = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode || !IsSuccessResponse(content))
                {
                    _logger.LogWarning("SMS send failed. StatusCode: {StatusCode}, Body: {Body}", response.StatusCode, content);
                    return new SmsSendResult
                    {
                        Sent = false,
                        Code = code,
                        ErrorMessage = "ارسال پیامک تایید ناموفق بود"
                    };
                }

                return new SmsSendResult { Sent = true, Code = code };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "SMS send failed.");
                return new SmsSendResult
                {
                    Sent = false,
                    Code = code,
                    ErrorMessage = "ارتباط با سرویس پیامک برقرار نشد"
                };
            }
        }

        private static string GenerateVerificationCode()
        {
            return RandomNumberGenerator.GetInt32(111111, 1000000).ToString();
        }

        private static bool IsSuccessResponse(string content)
        {
            try
            {
                using var document = JsonDocument.Parse(content);
                return document.RootElement.TryGetProperty("status", out var status) &&
                       status.ValueKind == JsonValueKind.True;
            }
            catch
            {
                return content.Contains("\"status\": true", StringComparison.OrdinalIgnoreCase) ||
                       content.Contains("\"status\":true", StringComparison.OrdinalIgnoreCase);
            }
        }
    }
}
