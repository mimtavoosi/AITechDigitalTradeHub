using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ValueFlowEventType : byte { Planned = 1, Reserved = 2, Started = 3, CostRecorded = 4, Delivered = 5, Approved = 6, Cancelled = 7 }

    /// <summary>رویدادهای جریان ارزش در زنجیره تأمین.</summary>
    public class ValueFlowEvent : BaseEntity
    {
        public long ResourceAllocationId { get; set; }
        public ValueFlowEventType EventType { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? PayloadJson { get; set; }
        public decimal? Amount { get; set; }
        public long? CreatedByUserId { get; set; }

        public ResourceAllocation ResourceAllocation { get; set; } = default!;
        public User? CreatedByUser { get; set; }
    }
}
