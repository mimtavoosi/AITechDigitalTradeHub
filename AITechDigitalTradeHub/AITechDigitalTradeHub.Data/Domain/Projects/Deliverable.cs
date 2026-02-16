using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>تحویل‌های مرحله (فایل/توضیح).</summary>
    public class Deliverable : BaseEntity
    {
        public long MilestoneId { get; set; }

        /// <summary>توضیح تحویل.</summary>
        [MaxLength(1000)]
        public string? Note { get; set; }

        /// <summary>فایل تحویل (اختیاری).</summary>
        public long? FileUploadId { get; set; }

        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }

        public Milestone Milestone { get; set; } = default!;
        public FileUpload? FileUpload { get; set; }
    }
}