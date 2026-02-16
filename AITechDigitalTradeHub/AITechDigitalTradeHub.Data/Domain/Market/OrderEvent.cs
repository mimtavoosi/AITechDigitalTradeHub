using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{


    // -------- Orders (خرید کالا/خدمت) --------


    /// <summary>رویدادهای سفارش (لاگ وضعیت).</summary>
    public class OrderEvent : BaseEntity
    {
        public long OrderId { get; set; }

        /// <summary>نوع رویداد (Paid, Shipped, Delivered...).</summary>
        [MaxLength(80)]
        public string EventType { get; set; } = string.Empty;

        /// <summary>توضیح تکمیلی.</summary>
        [MaxLength(1000)]
        public string? Note { get; set; }

        public Order Order { get; set; } = default!;
    }
}