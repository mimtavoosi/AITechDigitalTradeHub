using System.Security.Cryptography;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;

namespace AITechDigitalTradeHub.Api.Services
{
    public interface ISmsSender
    {
        Task<SmsSendResult> SendVerificationCodeAsync(string mobileNumber, CancellationToken cancellationToken = default);
        Task<SmsSendResult> SendMessageAsync(string mobileNumber, string message, CancellationToken cancellationToken = default);
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

                if (!response.IsSuccessStatusCode || IsExplicitFailureResponse(content))
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

        public async Task<SmsSendResult> SendMessageAsync(string mobileNumber, string message, CancellationToken cancellationToken = default)
        {
            if (!_options.Enable)
            {
                _logger.LogInformation("SMS sender is disabled. Notification SMS skipped for {MobileNumber}.", mobileNumber);
                return new SmsSendResult { Sent = false };
            }

            if (string.IsNullOrWhiteSpace(_options.PanelApiKey) ||
                string.IsNullOrWhiteSpace(_options.PanelLineNumber) ||
                string.IsNullOrWhiteSpace(message))
            {
                return new SmsSendResult
                {
                    Sent = false,
                    ErrorMessage = "تنظیمات سرویس پیامک کامل نیست"
                };
            }

            var body = new
            {
                sending_type = "normal",
                from_number = _options.PanelLineNumber,
                message,
                recipients = new[] { mobileNumber }
            };

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.PanelApiUrl.TrimEnd('/')}/api/send");
                request.Headers.TryAddWithoutValidation("Authorization", _options.PanelApiKey);
                request.Content = JsonContent.Create(body);

                using var response = await _httpClient.SendAsync(request, cancellationToken);
                var content = await response.Content.ReadAsStringAsync(cancellationToken);

                if (!response.IsSuccessStatusCode || IsExplicitFailureResponse(content))
                {
                    _logger.LogWarning("Notification SMS send failed. StatusCode: {StatusCode}, Body: {Body}", response.StatusCode, content);
                    return new SmsSendResult
                    {
                        Sent = false,
                        ErrorMessage = "ارسال پیامک اعلان ناموفق بود"
                    };
                }

                return new SmsSendResult { Sent = true };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Notification SMS send failed.");
                return new SmsSendResult
                {
                    Sent = false,
                    ErrorMessage = "ارتباط با سرویس پیامک برقرار نشد"
                };
            }
        }

        private static string GenerateVerificationCode()
        {
            return RandomNumberGenerator.GetInt32(111111, 1000000).ToString();
        }

        private static bool IsExplicitFailureResponse(string content)
        {
            if (string.IsNullOrWhiteSpace(content))
            {
                return false;
            }

            try
            {
                using var document = JsonDocument.Parse(content);

                if (document.RootElement.TryGetProperty("status", out var status))
                {
                    return status.ValueKind switch
                    {
                        JsonValueKind.False => true,
                        JsonValueKind.String => IsFailureStatus(status.GetString()),
                        JsonValueKind.Number => status.TryGetInt32(out var value) && value <= 0,
                        _ => false
                    };
                }

                if (document.RootElement.TryGetProperty("error", out var error) &&
                    error.ValueKind != JsonValueKind.Null &&
                    error.ValueKind != JsonValueKind.Undefined)
                {
                    return true;
                }

                if (document.RootElement.TryGetProperty("errors", out var errors) &&
                    errors.ValueKind == JsonValueKind.Array &&
                    errors.GetArrayLength() > 0)
                {
                    return true;
                }

                return false;
            }
            catch
            {
                return content.Contains("\"status\": false", StringComparison.OrdinalIgnoreCase) ||
                       content.Contains("\"status\":false", StringComparison.OrdinalIgnoreCase) ||
                       content.Contains("\"status\":\"false\"", StringComparison.OrdinalIgnoreCase) ||
                       content.Contains("\"error\"", StringComparison.OrdinalIgnoreCase);
            }
        }

        private static bool IsFailureStatus(string? status)
        {
            return string.Equals(status, "false", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "failed", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "failure", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "error", StringComparison.OrdinalIgnoreCase) ||
                   string.Equals(status, "0", StringComparison.OrdinalIgnoreCase);
        }
    }
}
