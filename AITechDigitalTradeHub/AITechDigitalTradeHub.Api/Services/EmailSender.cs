using System.Net;
using System.Net.Mail;

namespace AITechDigitalTradeHub.Api.Services
{
    public interface IEmailSender
    {
        Task<bool> SendAsync(string emailAddress, string subject, string body, CancellationToken cancellationToken = default);
    }

    public class SmtpEmailSender : IEmailSender
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<SmtpEmailSender> _logger;

        public SmtpEmailSender(IConfiguration configuration, ILogger<SmtpEmailSender> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendAsync(string emailAddress, string subject, string body, CancellationToken cancellationToken = default)
        {
            var enabled = bool.TryParse(_configuration["EmailSender:Enable"], out var value) && value;
            if (!enabled)
            {
                _logger.LogInformation("Email sender is disabled. Notification email skipped for {Email}.", emailAddress);
                return false;
            }

            var host = _configuration["EmailSender:SmtpClient"];
            var from = _configuration["EmailSender:HostEmail"];
            var password = _configuration["EmailSender:EmailPass"];
            var issuer = _configuration["Jwt:Issuer"] ?? "AITechDigitalTradeHub";
            var port = int.TryParse(_configuration["EmailSender:Port"], out var configuredPort) ? configuredPort : 25;
            var enableSsl = !bool.TryParse(_configuration["EmailSender:EnableSsl"], out var configuredSsl) || configuredSsl;

            if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(emailAddress))
            {
                _logger.LogWarning("Email sender settings are incomplete. Notification email skipped.");
                return false;
            }

            try
            {
                using var message = new MailMessage(new MailAddress(from, issuer), new MailAddress(emailAddress))
                {
                    Subject = $"{subject} {issuer}",
                    Body = body,
                    IsBodyHtml = true
                };

                using var smtp = new SmtpClient(host)
                {
                    UseDefaultCredentials = false,
                    Credentials = new NetworkCredential(from, password),
                    Port = port,
                    EnableSsl = enableSsl
                };

                using var registration = cancellationToken.Register(smtp.SendAsyncCancel);
                await smtp.SendMailAsync(message, cancellationToken);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Notification email send failed for {Email}.", emailAddress);
                return false;
            }
        }
    }
}
