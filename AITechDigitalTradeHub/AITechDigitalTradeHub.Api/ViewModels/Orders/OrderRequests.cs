using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Orders
{
    public class CreateOrderRequest
    {
        [Range(1, long.MaxValue)]
        public long ListingId { get; set; }

        public long? ServicePackageId { get; set; }

        [Range(1, int.MaxValue)]
        public int Qty { get; set; } = 1;

        public decimal? PriceAmount { get; set; }
        public string? AddressJson { get; set; }
        public List<CreateOrderMilestoneRequest> Milestones { get; set; } = new();

        public Order ToEntity(long buyerUserId)
        {
            return new Order
            {
                BuyerUserId = buyerUserId,
                ListingId = ListingId,
                ServicePackageId = ServicePackageId,
                Qty = Qty,
                PriceAmount = PriceAmount ?? 0,
                AddressJson = AddressJson
            };
        }
    }

    public class CreateOrderMilestoneRequest
    {
        [Required, MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime? DueAt { get; set; }

        public OrderMilestone ToEntity()
        {
            return new OrderMilestone
            {
                Title = Title.Trim(),
                Description = Description,
                Amount = Amount,
                DueAt = DueAt
            };
        }
    }

    public class DeliverOrderRequest
    {
        public string? Note { get; set; }
    }

    public class UpdateOrderMilestoneStatusRequest
    {
        public OrderMilestoneStatus Status { get; set; }
    }
}
