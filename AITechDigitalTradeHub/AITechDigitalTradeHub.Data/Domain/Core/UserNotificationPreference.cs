using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class UserNotificationPreference : BaseEntity
    {
        public long UserId { get; set; }
        public User User { get; set; } = default!;

        public bool InAppEnabled { get; set; } = true;
        public bool EmailEnabled { get; set; }
        public bool SmsEnabled { get; set; }

        public bool FinancialEnabled { get; set; } = true;
        public bool ProjectEnabled { get; set; } = true;
        public bool DisputeEnabled { get; set; } = true;
        public bool EducationEnabled { get; set; } = true;
        public bool SupportEnabled { get; set; } = true;
        public bool MarketingEnabled { get; set; }

        [MaxLength(24)]
        public string DigestFrequency { get; set; } = "instant";

        [MaxLength(5)]
        public string? QuietHoursStart { get; set; }

        [MaxLength(5)]
        public string? QuietHoursEnd { get; set; }
    }
}
