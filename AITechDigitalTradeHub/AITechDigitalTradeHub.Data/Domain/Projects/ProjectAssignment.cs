using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum AssigneeType : byte { User = 1, OrgTeam = 2 }

    /// <summary>تخصیص پروژه به انجام‌دهنده.</summary>
    public class ProjectAssignment : BaseEntity
    {
        public long ProjectId { get; set; }

        /// <summary>نوع انجام‌دهنده (کاربر یا تیم سازمانی).</summary>
        public AssigneeType AssigneeType { get; set; }

        /// <summary>اگر انجام‌دهنده یک کاربر باشد.</summary>
        public long? AssigneeUserId { get; set; }

        /// <summary>اگر انجام‌دهنده یک تیم سازمانی باشد.</summary>
        public long? AssigneeTeamId { get; set; }

        public DateTime? AcceptedAt { get; set; }

        public Project Project { get; set; } = default!;
        public User? AssigneeUser { get; set; }
        public Team? AssigneeTeam { get; set; }
    }
}