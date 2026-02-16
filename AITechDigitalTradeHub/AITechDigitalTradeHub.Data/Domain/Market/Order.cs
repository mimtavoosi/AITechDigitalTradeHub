using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{


    // -------- Orders (خرید کالا/خدمت) --------

    public enum OrderStatus : byte
    {
        PendingPayment = 1,
        Paid = 2,
        InProgress = 3,
        Delivered = 4,
        Completed = 5,
        Cancelled = 6,
        Refunded = 7
    }

    /// <summary>سفارش خرید کالا/خدمت.</summary>
    public class Order : BaseEntity
    {
        public long BuyerUserId { get; set; }
        public long SellerUserId { get; set; }

        public long ListingId { get; set; }

        /// <summary>اگر خدمت پکیج داشت.</summary>
        public long? ServicePackageId { get; set; }

        /// <summary>تعداد (برای کالا).</summary>
        public int Qty { get; set; } = 1;

        /// <summary>قیمت نهایی (واحد).</summary>
        public decimal PriceAmount { get; set; }

        public OrderStatus Status { get; set; } = OrderStatus.PendingPayment;

        /// <summary>آدرس/اطلاعات ارسال (JSON یا متن آزاد).</summary>
        public string? AddressJson { get; set; }

        /// <summary>زمان تکمیل سفارش.</summary>
        public DateTime? CompletedAt { get; set; }

        public User BuyerUser { get; set; } = default!;
        public User SellerUser { get; set; } = default!;
        public Listing Listing { get; set; } = default!;
        public ServicePackage? ServicePackage { get; set; }

        public ICollection<OrderEvent> Events { get; set; } = new List<OrderEvent>();
    }

}