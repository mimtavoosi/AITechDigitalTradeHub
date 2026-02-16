using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ReviewTargetType : byte { User = 1, Organization = 2, Listing = 3, Contract = 4 }
    public enum ReviewContextType : byte { Order = 1, Contract = 2 }

    /// <summary>امتیازدهی/نظر (فقط بعد از تراکنش معتبر).</summary>
    public class Review : BaseEntity
    {
        public long ReviewerUserId { get; set; }

        public ReviewTargetType TargetType { get; set; }
        public long TargetId { get; set; }

        public ReviewContextType ContextType { get; set; }
        public long ContextId { get; set; }

        /// <summary>امتیاز 1..5.</summary>
        public byte Rating { get; set; }

        /// <summary>نظر متنی.</summary>
        [MaxLength(2000)]
        public string? Comment { get; set; }

        public User ReviewerUser { get; set; } = default!;
    }
}