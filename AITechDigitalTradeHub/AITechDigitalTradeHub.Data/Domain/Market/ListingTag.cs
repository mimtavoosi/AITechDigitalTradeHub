using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>رابط چندبه‌چند Listing و Tag.</summary>
    public class ListingTag
    {
        /// <summary>شناسه آگهی.</summary>
        public long ListingId { get; set; }

        /// <summary>شناسه تگ.</summary>
        public long TagId { get; set; }

        public Listing Listing { get; set; } = default!;
        public Tag Tag { get; set; } = default!;
    }
}