using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.EntityFrameworkCore;
using NobatPlusDATA.Domain;

namespace AITechDigitalTradeHub.Api.Services
{
    public enum NotificationCategory
    {
        Financial,
        Project,
        Dispute,
        Education,
        Support,
        Marketing
    }

    public interface IUserNotificationService
    {
        Task<Notification?> AddInAppAsync(long userId, string message, NotificationCategory category, long? creatorId = null);
    }

    public class UserNotificationService : IUserNotificationService
    {
        private readonly TheAppContext _context;
        private readonly IEmailSender _emailSender;
        private readonly ISmsSender _smsSender;
        private readonly ILogger<UserNotificationService> _logger;

        public UserNotificationService(
            TheAppContext context,
            IEmailSender emailSender,
            ISmsSender smsSender,
            ILogger<UserNotificationService> logger)
        {
            _context = context;
            _emailSender = emailSender;
            _smsSender = smsSender;
            _logger = logger;
        }

        public async Task<Notification?> AddInAppAsync(long userId, string message, NotificationCategory category, long? creatorId = null)
        {
            if (userId <= 0 || string.IsNullOrWhiteSpace(message))
            {
                return null;
            }

            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .SingleOrDefaultAsync(x => x.ID == userId);
            if (user == null)
            {
                return null;
            }

            var preference = await _context.UserNotificationPreferences
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId);
            if (!IsCategoryEnabled(preference, category))
            {
                return null;
            }

            var now = DateTime.UtcNow;
            Notification? notification = null;
            if (preference?.InAppEnabled ?? true)
            {
                notification = new Notification
                {
                    UserId = userId,
                    Message = message.Trim(),
                    IsRead = false,
                    CreateDate = now,
                    UpdateDate = now,
                    CreatorId = creatorId,
                    IsActive = true
                };

                await _context.Notifications.AddAsync(notification);
            }

            if (CanSendImmediateExternal(preference))
            {
                await SendEmailIfEnabledAsync(user, preference, message);
                await SendSmsIfEnabledAsync(user, preference, message, creatorId, now);
            }

            return notification;
        }

        private async Task SendEmailIfEnabledAsync(User user, UserNotificationPreference? preference, string message)
        {
            if (preference?.EmailEnabled != true || string.IsNullOrWhiteSpace(user.Email))
            {
                return;
            }

            await _emailSender.SendAsync(
                user.Email,
                "اعلان جدید",
                $"<div dir=\"rtl\" style=\"font-family:tahoma,sans-serif;line-height:1.9\">{System.Net.WebUtility.HtmlEncode(message)}</div>");
        }

        private async Task SendSmsIfEnabledAsync(User user, UserNotificationPreference? preference, string message, long? creatorId, DateTime now)
        {
            if (preference?.SmsEnabled != true)
            {
                return;
            }

            var mobileNumber = user.LoginMethods?
                .Where(x => x.Method == "SMS" && !string.IsNullOrWhiteSpace(x.MobileNumber))
                .OrderByDescending(x => x.UpdateDate ?? x.CreateDate)
                .Select(x => x.MobileNumber)
                .FirstOrDefault();
            if (string.IsNullOrWhiteSpace(mobileNumber))
            {
                return;
            }

            var smsText = message.Length > 280 ? $"{message[..277]}..." : message;
            var result = await _smsSender.SendMessageAsync(mobileNumber, smsText);
            await _context.SMSMessages.AddAsync(new SMSMessage
            {
                UserID = user.ID,
                PhoneNumber = mobileNumber,
                Message = smsText,
                SentDate = now,
                SentStatus = result.Sent,
                CreateDate = now,
                UpdateDate = now,
                CreatorId = creatorId,
                IsActive = true
            });

            if (!result.Sent)
            {
                _logger.LogWarning("Notification SMS was not sent for user {UserId}. {ErrorMessage}", user.ID, result.ErrorMessage);
            }
        }

        private static bool CanSendImmediateExternal(UserNotificationPreference? preference)
        {
            if (preference == null)
            {
                return false;
            }

            if (!string.Equals(preference.DigestFrequency, "instant", StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            return !IsWithinQuietHours(preference, DateTime.Now.TimeOfDay);
        }

        private static bool IsWithinQuietHours(UserNotificationPreference preference, TimeSpan now)
        {
            if (!TryParseTime(preference.QuietHoursStart, out var start) || !TryParseTime(preference.QuietHoursEnd, out var end) || start == end)
            {
                return false;
            }

            return start < end
                ? now >= start && now < end
                : now >= start || now < end;
        }

        private static bool TryParseTime(string? value, out TimeSpan time)
        {
            return TimeSpan.TryParse(value, out time);
        }

        private static bool IsCategoryEnabled(UserNotificationPreference? preference, NotificationCategory category)
        {
            if (preference == null)
            {
                return true;
            }

            return category switch
            {
                NotificationCategory.Financial => preference.FinancialEnabled,
                NotificationCategory.Project => preference.ProjectEnabled,
                NotificationCategory.Dispute => preference.DisputeEnabled,
                NotificationCategory.Education => preference.EducationEnabled,
                NotificationCategory.Support => preference.SupportEnabled,
                NotificationCategory.Marketing => preference.MarketingEnabled,
                _ => true
            };
        }
    }
}
