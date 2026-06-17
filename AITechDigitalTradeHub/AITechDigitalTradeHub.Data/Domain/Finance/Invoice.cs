using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvoiceStatus : byte { Draft = 1, Issued = 2, Paid = 3, Cancelled = 4, Refunded = 5 }
    public enum PlatformFeeContextType : byte { Order = 1, Contract = 2, Course = 3, TeacherBooking = 4, Investment = 5, Payout = 6 }

    /// <summary>فاکتور دیجیتال برای سفارش، پروژه، آموزش یا سرمایه‌گذاری.</summary>
    public class Invoice : BaseEntity
    {
        public long BuyerUserId { get; set; }
        public long? BuyerOrganizationId { get; set; }
        public long? SellerUserId { get; set; }
        public long? SellerOrganizationId { get; set; }
        public long? TransactionId { get; set; }

        [MaxLength(64)]
        public string InvoiceNumber { get; set; } = string.Empty;

        [MaxLength(64)]
        public string ContextType { get; set; } = string.Empty;

        public long? ContextId { get; set; }

        public decimal SubtotalAmount { get; set; }
        public decimal FeeAmount { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;
        public DateTime IssuedAt { get; set; }
        public DateTime? PaidAt { get; set; }

        public User BuyerUser { get; set; } = default!;
        public Organization? BuyerOrganization { get; set; }
        public User? SellerUser { get; set; }
        public Organization? SellerOrganization { get; set; }
        public Transaction? Transaction { get; set; }
        public ICollection<InvoiceLine> Lines { get; set; } = new List<InvoiceLine>();
    }

    public class InvoiceLine : BaseEntity
    {
        public long InvoiceId { get; set; }

        [MaxLength(220)]
        public string Title { get; set; } = string.Empty;

        public int Quantity { get; set; } = 1;
        public decimal UnitAmount { get; set; }
        public decimal TotalAmount { get; set; }

        [MaxLength(64)]
        public string? ReferenceType { get; set; }

        public long? ReferenceId { get; set; }

        public Invoice Invoice { get; set; } = default!;
    }

    /// <summary>قانون کارمزد پلتفرم برای محاسبه درآمد، کمیسیون و سیاست‌های مالی.</summary>
    public class PlatformFeeRule : BaseEntity
    {
        public PlatformFeeContextType ContextType { get; set; }
        public decimal Percent { get; set; }
        public decimal? FixedAmount { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public decimal? MinAmount { get; set; }
        public decimal? MaxAmount { get; set; }
        public byte? MinTrustLevel { get; set; }
        public bool IsActiveRule { get; set; } = true;
    }
}
