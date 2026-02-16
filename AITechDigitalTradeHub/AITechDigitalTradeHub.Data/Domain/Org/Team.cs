using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>تیم داخل سازمان.</summary>
    public class Team : BaseEntity
    {
        public long OrganizationId { get; set; }

        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        public Organization Organization { get; set; } = default!;
        public ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
    }
}