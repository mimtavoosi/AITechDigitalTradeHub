using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ResourceAllocationStatus : byte { Planned = 1, Reserved = 2, Active = 3, Completed = 4, Cancelled = 5 }
    public enum ResourceType : byte { Service = 1, Equipment = 2, GpuServer = 3, HumanResource = 4, Data = 5 }

    /// <summary>تخصیص منابع زنجیره تأمین به پروژه/قرارداد/سفارش.</summary>
    public class ResourceAllocation : BaseEntity
    {
        public ResourceType ResourceType { get; set; }
        public ResourceAllocationStatus Status { get; set; } = ResourceAllocationStatus.Planned;
        public long? ProjectId { get; set; }
        public long? ContractId { get; set; }
        public long? OrderId { get; set; }
        public long? ListingId { get; set; }
        public long? AssignedUserId { get; set; }
        public long? OrganizationId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }

        public Project? Project { get; set; }
        public Contract? Contract { get; set; }
        public Order? Order { get; set; }
        public Listing? Listing { get; set; }
        public User? AssignedUser { get; set; }
        public Organization? Organization { get; set; }
        public ICollection<ValueFlowEvent> ValueFlowEvents { get; set; } = new List<ValueFlowEvent>();
    }
}
