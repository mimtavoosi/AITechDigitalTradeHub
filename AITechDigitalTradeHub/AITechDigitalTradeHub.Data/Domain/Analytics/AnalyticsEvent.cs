using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>رویدادهای رفتاری سیستم (برای BI و AI).</summary>
    public class AnalyticsEvent : BaseEntity
    {
        public long? UserId { get; set; }

        /// <summary>شناسه سشن/دستگاه (اختیاری).</summary>
        [MaxLength(128)]
        public string? SessionId { get; set; }

        /// <summary>نام رویداد (UserRegistered, ListingPublished ...).</summary>
        [MaxLength(64)]
        public string EventName { get; set; } = string.Empty;

        /// <summary>نوع موجودیت مرتبط (Listing/Project/Order...).</summary>
        [MaxLength(32)]
        public string? EntityType { get; set; }

        /// <summary>شناسه موجودیت مرتبط.</summary>
        public long? EntityId { get; set; }

        /// <summary>خصوصیات تکمیلی (JSON).</summary>
        public string? PropertiesJson { get; set; }

        public User? User { get; set; }
    }
}