using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.SupplyChain
{
    public class CreateResourceAllocationRequest
    {
        public ResourceType ResourceType { get; set; } = ResourceType.Service;
        public long? ProjectId { get; set; }
        public long? ContractId { get; set; }
        public long? OrderId { get; set; }
        public long? ListingId { get; set; }
        public long? AssignedUserId { get; set; }
        public long? OrganizationId { get; set; }

        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }
    }

    public class CreateResourceReservationRequest
    {
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public decimal? ReservedCost { get; set; }
        public bool Confirm { get; set; } = true;
    }

    public class UpdateResourceAllocationStatusRequest
    {
        public ResourceAllocationStatus Status { get; set; }
        public decimal? ActualCost { get; set; }
        public string? Note { get; set; }
    }

    public class ResourceAllocationResponse
    {
        public long Id { get; set; }
        public ResourceType ResourceType { get; set; }
        public ResourceAllocationStatus Status { get; set; }
        public long? ProjectId { get; set; }
        public long? ContractId { get; set; }
        public long? OrderId { get; set; }
        public long? ListingId { get; set; }
        public long? AssignedUserId { get; set; }
        public long? OrganizationId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? EndsAt { get; set; }
        public List<ValueFlowEventResponse> ValueFlowEvents { get; set; } = new();

        public static ResourceAllocationResponse FromEntity(ResourceAllocation entity) => new()
        {
            Id = entity.ID,
            ResourceType = entity.ResourceType,
            Status = entity.Status,
            ProjectId = entity.ProjectId,
            ContractId = entity.ContractId,
            OrderId = entity.OrderId,
            ListingId = entity.ListingId,
            AssignedUserId = entity.AssignedUserId,
            OrganizationId = entity.OrganizationId,
            Title = entity.Title,
            Description = entity.Description,
            EstimatedCost = entity.EstimatedCost,
            ActualCost = entity.ActualCost,
            StartsAt = entity.StartsAt,
            EndsAt = entity.EndsAt,
            ValueFlowEvents = entity.ValueFlowEvents.OrderByDescending(x => x.CreateDate).Select(ValueFlowEventResponse.FromEntity).ToList()
        };
    }

    public class ValueFlowEventResponse
    {
        public long Id { get; set; }
        public ValueFlowEventType EventType { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? PayloadJson { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ValueFlowEventResponse FromEntity(ValueFlowEvent entity) => new()
        {
            Id = entity.ID,
            EventType = entity.EventType,
            Title = entity.Title,
            PayloadJson = entity.PayloadJson,
            Amount = entity.Amount,
            CreateDate = entity.CreateDate
        };
    }

    public class ResourceReservationResponse
    {
        public long Id { get; set; }
        public long ResourceAllocationId { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public ResourceReservationStatus Status { get; set; }
        public decimal? ReservedCost { get; set; }
    }

    public class SupplyCapacityResponse
    {
        public long? AssignedUserId { get; set; }
        public long? OrganizationId { get; set; }
        public long? ListingId { get; set; }
        public int ActiveAllocations { get; set; }
        public int UpcomingReservations { get; set; }
        public decimal EstimatedCostLoad { get; set; }
        public DateTime? NextStartsAt { get; set; }
        public DateTime? LastEndsAt { get; set; }
    }

    public class ValueFlowDashboardResponse
    {
        public int TotalAllocations { get; set; }
        public int ActiveAllocations { get; set; }
        public int ReservedAllocations { get; set; }
        public int CompletedAllocations { get; set; }
        public decimal EstimatedCost { get; set; }
        public decimal ActualCost { get; set; }
        public decimal RecordedValueFlowAmount { get; set; }
        public List<ValueFlowEventResponse> RecentEvents { get; set; } = new();
    }
}
