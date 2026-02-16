using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>تگ‌ها (برای جستجو/پیشنهاد).</summary>
    public class Tag : BaseEntity
    {
        /// <summary>نام تگ.</summary>
        [MaxLength(60)]
        public string Name { get; set; } = string.Empty;

        /// <summary>اسلاگ.</summary>
        [MaxLength(80)]
        public string Slug { get; set; } = string.Empty;

        public ICollection<ListingTag> ListingTags { get; set; } = new List<ListingTag>();
    }
}