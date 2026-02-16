using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum OrganizationStatus : byte { Active = 1, Suspended = 2 }

    /// <summary>سازمان (برای پروژه‌های سازمانی و زیرمجموعه‌گیری).</summary>
    public class Organization : BaseEntity
    {
        public long OwnerUserId { get; set; }

        [MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(160)]
        public string Slug { get; set; } = string.Empty;

        /// <summary>شناسه ملی/ثبت (اختیاری).</summary>
        [MaxLength(32)]
        public string? NationalId { get; set; }

        public bool IsVerified { get; set; }
        public OrganizationStatus Status { get; set; } = OrganizationStatus.Active;

        public User OwnerUser { get; set; } = default!;
        public ICollection<OrganizationMember> Members { get; set; } = new List<OrganizationMember>();
        public ICollection<Team> Teams { get; set; } = new List<Team>();
        public ICollection<Affiliation> Affiliations { get; set; } = new List<Affiliation>();
    }
}