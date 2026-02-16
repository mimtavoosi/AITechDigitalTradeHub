using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ModerationActionType : byte { Warn = 1, Suspend = 2, Ban = 3, RemoveContent = 4 }

    /// <summary>اقدام ادمین روی گزارش/هدف.</summary>
    public class ModerationAction : BaseEntity
    {
        public long? ReportId { get; set; }

        public ModerationActionType ActionType { get; set; }

        [MaxLength(32)]
        public string TargetType { get; set; } = "Listing";

        public long TargetId { get; set; }

        public long PerformedByUserId { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }

        public Report? Report { get; set; }
        public User PerformedByUser { get; set; } = default!;
    }
}