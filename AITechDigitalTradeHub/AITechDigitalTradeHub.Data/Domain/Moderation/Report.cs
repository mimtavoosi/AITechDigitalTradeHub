using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ReportStatus : byte { Open = 1, Reviewing = 2, Closed = 3 }

    /// <summary>گزارش تخلف (آگهی/کاربر/پروژه/پیام).</summary>
    public class Report : BaseEntity
    {
        public long ReporterUserId { get; set; }

        [MaxLength(32)]
        public string TargetType { get; set; } = "Listing";

        public long TargetId { get; set; }

        [MaxLength(64)]
        public string ReasonType { get; set; } = "Other";

        [MaxLength(2000)]
        public string? Description { get; set; }

        public ReportStatus Status { get; set; } = ReportStatus.Open;

        public User ReporterUser { get; set; } = default!;
    }
}