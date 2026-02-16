using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum OrgRole : byte { OrgAdmin = 1, Manager = 2, Member = 3 }

    /// <summary>عضویت کاربران در سازمان.</summary>
    public class OrganizationMember : BaseEntity
    {
        public long OrganizationId { get; set; }
        public long UserId { get; set; }

        public OrgRole Role { get; set; } = OrgRole.Member;

        public bool IsActive { get; set; } = true;

        public Organization Organization { get; set; } = default!;
        public User User { get; set; } = default!;
    }
}