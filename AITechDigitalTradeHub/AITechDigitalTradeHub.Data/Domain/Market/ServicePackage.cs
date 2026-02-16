using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{


    /// <summary>پکیج خدمت (Basic/Standard/Premium).</summary>
    public class ServicePackage : BaseEntity
    {
        /// <summary>شناسه جزئیات خدمت.</summary>
        public long ListingServiceDetailsId { get; set; }

        /// <summary>عنوان پکیج.</summary>
        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        /// <summary>توضیح پکیج.</summary>
        [MaxLength(1000)]
        public string? Description { get; set; }

        /// <summary>قیمت پکیج.</summary>
        public decimal PriceAmount { get; set; }

        /// <summary>مدت زمان.</summary>
        public int? DurationMinutes { get; set; }

        /// <summary>فعال/غیرفعال.</summary>
        public bool IsActive { get; set; } = true;

        public ListingServiceDetails ListingServiceDetails { get; set; } = default!;
    }
}
