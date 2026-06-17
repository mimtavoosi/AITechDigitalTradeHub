using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IOrderRep
    {
        Task<RowResultObject<Order>> GetOrderByIdAsync(long orderId);
        Task<ListResultObject<Order>> GetBuyerOrdersAsync(long buyerUserId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<Order>> GetSellerOrdersAsync(long sellerUserId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> CreateOrderAsync(Order order, IEnumerable<OrderMilestone>? milestones = null);
        Task<BitResultObject> MarkPaidAsync(long orderId, long buyerUserId);
        Task<BitResultObject> StartOrderAsync(long orderId, long sellerUserId);
        Task<BitResultObject> DeliverOrderAsync(long orderId, long sellerUserId, string? note = null);
        Task<BitResultObject> CompleteOrderAsync(long orderId, long buyerUserId);
        Task<BitResultObject> CancelOrderAsync(long orderId, long userId);
        Task<BitResultObject> UpdateMilestoneStatusAsync(long milestoneId, long userId, OrderMilestoneStatus status);
    }
}
