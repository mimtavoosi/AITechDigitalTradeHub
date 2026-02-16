using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>عضو تیم.</summary>
    public class TeamMember : BaseEntity
    {
        public long TeamId { get; set; }
        public long UserId { get; set; }

        public Team Team { get; set; } = default!;
        public User User { get; set; } = default!;
    }
}