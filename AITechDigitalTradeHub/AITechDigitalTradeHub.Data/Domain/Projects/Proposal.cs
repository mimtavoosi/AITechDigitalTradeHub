using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مهارت‌های پروژه (Tag محور).</summary>
    public enum ProposalStatus : byte { Sent = 1, Withdrawn = 2, Shortlisted = 3, Rejected = 4, Accepted = 5 }

    /// <summary>پیشنهاد فریلنسر برای یک پروژه.</summary>
    public class Proposal : BaseEntity
    {
        public long ProjectId { get; set; }
        public long FreelancerUserId { get; set; }

        /// <summary>قیمت پیشنهادی.</summary>
        public decimal ProposedPrice { get; set; }

        /// <summary>زمان پیشنهادی تحویل (روز).</summary>
        public int ProposedDays { get; set; }

        /// <summary>متن پیشنهاد.</summary>
        public string? CoverLetter { get; set; }

        public ProposalStatus Status { get; set; } = ProposalStatus.Sent;

        public Project Project { get; set; } = default!;
        public User FreelancerUser { get; set; } = default!;
    }
}