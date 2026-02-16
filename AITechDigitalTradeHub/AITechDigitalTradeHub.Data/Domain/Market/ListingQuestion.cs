using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{

    // <summary>سوال زیر آگهی.</summary>
    public class ListingQuestion : BaseEntity
    {
        public long ListingId { get; set; }
        public long AskerUserId { get; set; }

        /// <summary>متن سوال.</summary>
        [MaxLength(1000)]
        public string QuestionText { get; set; } = string.Empty;

        public Listing Listing { get; set; } = default!;
        public User AskerUser { get; set; } = default!;

        public ICollection<ListingAnswer> Answers { get; set; } = new List<ListingAnswer>();
    }

}