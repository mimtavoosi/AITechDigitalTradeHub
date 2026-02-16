using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{

    public enum ProductCondition : byte { New = 1, Used = 2 }
    public enum ShippingType : byte { Pickup = 1, Post = 2, Courier = 3 }

    /// <summary>جزئیات مخصوص کالا (1 به 1 با Listing).</summary>
    public class ListingProductDetails : BaseEntity
    {
        /// <summary>شناسه آگهی (یک به یک).</summary>
        public long ListingId { get; set; }

        /// <summary>وضعیت کالا: نو/کارکرده.</summary>
        public ProductCondition Condition { get; set; }

        /// <summary>تعداد موجودی (برای فروشگاهی شدن؛ در آگهی ساده هم می‌تواند 1 باشد).</summary>
        public int StockQty { get; set; } = 1;

        /// <summary>مدت گارانتی (ماه).</summary>
        public int? WarrantyMonths { get; set; }

        /// <summary>روش ارسال.</summary>
        public ShippingType ShippingType { get; set; } = ShippingType.Pickup;

        /// <summary>برند (اختیاری).</summary>
        [MaxLength(80)]
        public string? Brand { get; set; }

        /// <summary>مدل (اختیاری).</summary>
        [MaxLength(80)]
        public string? Model { get; set; }

        public Listing Listing { get; set; } = default!;
    }
}