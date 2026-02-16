using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum MilestoneStatus : byte { Pending = 1, InProgress = 2, Submitted = 3, Approved = 4, Rejected = 5 }

    /// <summary>مرحله‌های پرداخت/تحویل (برای پروژه‌های مرحله‌ای).</summary>
    public class Milestone : BaseEntity
    {
        public long ContractId { get; set; }

        [MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        /// <summary>مبلغ مرحله.</summary>
        public decimal Amount { get; set; }

        /// <summary>ددلاین مرحله.</summary>
        public DateTime? DueAt { get; set; }

        public MilestoneStatus Status { get; set; } = MilestoneStatus.Pending;

        public Contract Contract { get; set; } = default!;
        public ICollection<Deliverable> Deliverables { get; set; } = new List<Deliverable>();
    }
}