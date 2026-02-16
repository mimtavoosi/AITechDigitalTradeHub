using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{

    /// <summary>ذخیره کردن آگهی توسط کاربر (Bookmark).</summary>
    public class ListingSave : BaseEntity
    {
        /// <summary>کاربری که ذخیره کرده.</summary>
        public long UserId { get; set; }

        /// <summary>آگهی ذخیره شده.</summary>
        public long ListingId { get; set; }

        public User User { get; set; } = default!;
        public Listing Listing { get; set; } = default!;
    }
}