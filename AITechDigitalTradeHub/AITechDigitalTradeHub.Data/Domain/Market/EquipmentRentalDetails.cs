using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum RentalBillingUnit : byte { Hour = 1, Day = 2, Month = 3 }

    /// <summary>مشخصات اجاره تجهیزات پردازشی مثل GPU Server.</summary>
    public class EquipmentRentalDetails : BaseEntity
    {
        public long ListingId { get; set; }

        [MaxLength(120)]
        public string? GpuModel { get; set; }

        public int? GpuCount { get; set; }
        public int? CpuCores { get; set; }
        public int? RamGb { get; set; }
        public int? StorageGb { get; set; }

        [MaxLength(120)]
        public string? NetworkSpec { get; set; }

        public RentalBillingUnit BillingUnit { get; set; } = RentalBillingUnit.Hour;
        public decimal PricePerUnit { get; set; }
        public int? MinRentalUnits { get; set; }
        public int? MaxRentalUnits { get; set; }
        public bool RequiresManualApproval { get; set; }

        public Listing Listing { get; set; } = default!;
    }

    public enum OrderMilestoneStatus : byte { Pending = 1, Funded = 2, Delivered = 3, Approved = 4, Released = 5, Disputed = 6, Cancelled = 7 }

    /// <summary>پرداخت مرحله‌ای برای سفارش خدمات یا تجهیزات.</summary>
    public class OrderMilestone : BaseEntity
    {
        public long OrderId { get; set; }

        [MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime? DueAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public DateTime? ReleasedAt { get; set; }
        public OrderMilestoneStatus Status { get; set; } = OrderMilestoneStatus.Pending;

        public Order Order { get; set; } = default!;
    }
}
