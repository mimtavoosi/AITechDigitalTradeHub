using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Notifications
{
    public class NotificationPreferenceRequest
    {
        public bool InAppEnabled { get; set; } = true;
        public bool EmailEnabled { get; set; }
        public bool SmsEnabled { get; set; }
        public bool FinancialEnabled { get; set; } = true;
        public bool ProjectEnabled { get; set; } = true;
        public bool DisputeEnabled { get; set; } = true;
        public bool EducationEnabled { get; set; } = true;
        public bool SupportEnabled { get; set; } = true;
        public bool MarketingEnabled { get; set; }
        public string? DigestFrequency { get; set; }
        public string? QuietHoursStart { get; set; }
        public string? QuietHoursEnd { get; set; }
    }

    public class NotificationPreferenceResponse : NotificationPreferenceRequest
    {
        public long UserId { get; set; }
        public DateTime? UpdateDate { get; set; }

        public static NotificationPreferenceResponse FromEntity(long userId, UserNotificationPreference? preference)
        {
            return new NotificationPreferenceResponse
            {
                UserId = userId,
                InAppEnabled = preference?.InAppEnabled ?? true,
                EmailEnabled = preference?.EmailEnabled ?? false,
                SmsEnabled = preference?.SmsEnabled ?? false,
                FinancialEnabled = preference?.FinancialEnabled ?? true,
                ProjectEnabled = preference?.ProjectEnabled ?? true,
                DisputeEnabled = preference?.DisputeEnabled ?? true,
                EducationEnabled = preference?.EducationEnabled ?? true,
                SupportEnabled = preference?.SupportEnabled ?? true,
                MarketingEnabled = preference?.MarketingEnabled ?? false,
                DigestFrequency = preference?.DigestFrequency ?? "instant",
                QuietHoursStart = preference?.QuietHoursStart,
                QuietHoursEnd = preference?.QuietHoursEnd,
                UpdateDate = preference?.UpdateDate
            };
        }
    }
}
