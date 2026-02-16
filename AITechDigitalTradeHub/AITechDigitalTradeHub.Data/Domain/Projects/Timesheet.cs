using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum TimesheetStatus : byte { Submitted = 1, Approved = 2, Rejected = 3 }

    /// <summary>ثبت زمان برای پروژه‌های ساعتی.</summary>
    public class Timesheet : BaseEntity
    {
        public long ContractId { get; set; }
        public long UserId { get; set; }

        /// <summary>تاریخ ثبت.</summary>
        public DateOnly Date { get; set; }

        /// <summary>میزان زمان (دقیقه).</summary>
        public int Minutes { get; set; }

        /// <summary>شرح کار انجام‌شده.</summary>
        [MaxLength(1000)]
        public string? Description { get; set; }

        public TimesheetStatus Status { get; set; } = TimesheetStatus.Submitted;

        public Contract Contract { get; set; } = default!;
        public User User { get; set; } = default!;
    }
}