using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ContractStatus : byte { Draft = 1, Active = 2, Completed = 3, Terminated = 4 }

    /// <summary>قرارداد پروژه پس از انتخاب انجام‌دهنده.</summary>
    public class Contract : BaseEntity
    {
        public long ProjectId { get; set; }

        public long EmployerUserId { get; set; }

        /// <summary>اگر پیمانکار فرد باشد.</summary>
        public long? ContractorUserId { get; set; }

        /// <summary>اگر پیمانکار سازمان باشد.</summary>
        public long? ContractorOrganizationId { get; set; }

        /// <summary>شرایط قرارداد (JSON یا متن).</summary>
        public string? TermsJson { get; set; }

        public ContractStatus Status { get; set; } = ContractStatus.Draft;

        public Project Project { get; set; } = default!;
        public User EmployerUser { get; set; } = default!;
        public User? ContractorUser { get; set; }
        public Organization? ContractorOrganization { get; set; }

        public ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();
        public ICollection<Timesheet> Timesheets { get; set; } = new List<Timesheet>();
    }
}