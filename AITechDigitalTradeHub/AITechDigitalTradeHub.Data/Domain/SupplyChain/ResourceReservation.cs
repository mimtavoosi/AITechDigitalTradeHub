namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ResourceReservationStatus : byte { Requested = 1, Confirmed = 2, InUse = 3, Completed = 4, Cancelled = 5 }

    /// <summary>رزرو زمان استفاده از تجهیز یا منبع پردازشی.</summary>
    public class ResourceReservation : BaseEntity
    {
        public long ResourceAllocationId { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public ResourceReservationStatus Status { get; set; } = ResourceReservationStatus.Requested;
        public decimal? ReservedCost { get; set; }

        public ResourceAllocation ResourceAllocation { get; set; } = default!;
    }
}
