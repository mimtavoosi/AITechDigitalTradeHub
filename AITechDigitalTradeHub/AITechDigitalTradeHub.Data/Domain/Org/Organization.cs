using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum OrganizationStatus : byte { Active = 1, Suspended = 2, PendingVerification = 3, Rejected = 4 }
    public enum OrganizationType : byte
    {
        Company = 1,
        University = 2,
        ResearchInstitute = 3,
        Startup = 4,
        Government = 5,
        NonProfit = 6,
        Accelerator = 7,
        Other = 8
    }

    /// <summary>سازمان (برای پروژه‌های سازمانی و زیرمجموعه‌گیری).</summary>
    public class Organization : BaseEntity
    {
        public long OwnerUserId { get; set; }

        [MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(160)]
        public string Slug { get; set; } = string.Empty;

        public OrganizationType Type { get; set; } = OrganizationType.Company;

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(300)]
        public string? WebsiteUrl { get; set; }

        [MaxLength(180)]
        public string? PublicEmail { get; set; }

        [MaxLength(32)]
        public string? PublicPhone { get; set; }

        /// <summary>شناسه ملی/ثبت (اختیاری).</summary>
        [MaxLength(32)]
        public string? NationalId { get; set; }

        public bool IsVerified { get; set; }
        public OrganizationStatus Status { get; set; } = OrganizationStatus.PendingVerification;

        /// <summary>آیا خریدهای اعضا باید قبل از پرداخت از کیف پول شرکت تایید شوند؟</summary>
        public bool RequireApprovalForMemberPayments { get; set; } = true;

        /// <summary>سقف پیش‌فرض خرید اعضا از اعتبار شرکت؛ null یعنی بدون سقف سیستمی.</summary>
        public decimal? DefaultMemberPaymentLimit { get; set; }

        public User OwnerUser { get; set; } = default!;
        public ICollection<OrganizationMember> Members { get; set; } = new List<OrganizationMember>();
        public ICollection<OrganizationInvitation> Invitations { get; set; } = new List<OrganizationInvitation>();
        public ICollection<Team> Teams { get; set; } = new List<Team>();
        public ICollection<Affiliation> Affiliations { get; set; } = new List<Affiliation>();
        public ICollection<OrganizationPaymentRequest> PaymentRequests { get; set; } = new List<OrganizationPaymentRequest>();
        public ICollection<Project> Projects { get; set; } = new List<Project>();
    }
}
