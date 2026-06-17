using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Orders
{
    public class OrderResponse
    {
        public long Id { get; set; }
        public long BuyerUserId { get; set; }
        public string? BuyerName { get; set; }
        public long SellerUserId { get; set; }
        public string? SellerName { get; set; }
        public long ListingId { get; set; }
        public string? ListingTitle { get; set; }
        public int Qty { get; set; }
        public decimal PriceAmount { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        public static OrderResponse FromEntity(Order order)
        {
            return new OrderResponse
            {
                Id = order.ID,
                BuyerUserId = order.BuyerUserId,
                BuyerName = order.BuyerUser == null ? null : $"{order.BuyerUser.FirstName} {order.BuyerUser.LastName}".Trim(),
                SellerUserId = order.SellerUserId,
                SellerName = order.SellerUser == null ? null : $"{order.SellerUser.FirstName} {order.SellerUser.LastName}".Trim(),
                ListingId = order.ListingId,
                ListingTitle = order.Listing?.Title,
                Qty = order.Qty,
                PriceAmount = order.PriceAmount,
                Status = order.Status,
                CreateDate = order.CreateDate,
                CompletedAt = order.CompletedAt
            };
        }
    }
}
