using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class OrderRep : IOrderRep
    {
        private readonly TheAppContext _context;

        public OrderRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> CreateOrderAsync(Order order, IEnumerable<OrderMilestone>? milestones = null)
        {
            BitResultObject result = new BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var listing = await _context.Listings
                    .Include(x => x.ServiceDetails)
                        .ThenInclude(x => x!.Packages)
                    .SingleOrDefaultAsync(x => x.ID == order.ListingId && x.Status == ListingStatus.Published && x.IsActive);

                if (listing == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "آگهی منتشرشده پیدا نشد";
                    return result;
                }

                if (listing.OwnerUserId == order.BuyerUserId)
                {
                    result.Status = false;
                    result.ErrorMessage = "خریدار نمی‌تواند از آگهی خودش سفارش ثبت کند";
                    return result;
                }

                order.SellerUserId = listing.OwnerUserId;
                order.Status = OrderStatus.PendingPayment;
                order.CreateDate = DateTime.UtcNow;

                if (order.ServicePackageId.HasValue)
                {
                    var package = listing.ServiceDetails?.Packages.SingleOrDefault(x => x.ID == order.ServicePackageId.Value && x.IsActive);
                    if (package == null)
                    {
                        result.Status = false;
                        result.ErrorMessage = "پکیج خدمت معتبر نیست";
                        return result;
                    }

                    order.PriceAmount = package.PriceAmount;
                }
                else if (order.PriceAmount <= 0)
                {
                    order.PriceAmount = listing.PriceAmount ?? listing.PriceMin ?? 0;
                }

                if (order.PriceAmount <= 0)
                {
                    result.Status = false;
                    result.ErrorMessage = "قیمت سفارش معتبر نیست";
                    return result;
                }

                await _context.Orders.AddAsync(order);
                await _context.SaveChangesAsync();

                if (milestones != null)
                {
                    foreach (var milestone in milestones)
                    {
                        milestone.OrderId = order.ID;
                        milestone.Status = OrderMilestoneStatus.Pending;
                        await _context.OrderMilestones.AddAsync(milestone);
                    }
                }

                await AddEventAsync(order.ID, "Created", "سفارش ایجاد شد");
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                result.ID = order.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Order>> GetOrderByIdAsync(long orderId)
        {
            RowResultObject<Order> result = new RowResultObject<Order>();
            try
            {
                result.Result = await BaseOrderQuery().SingleOrDefaultAsync(x => x.ID == orderId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Order>> GetBuyerOrdersAsync(long buyerUserId, int pageIndex = 1, int pageSize = 20)
        {
            return await GetOrdersAsync(x => x.BuyerUserId == buyerUserId, pageIndex, pageSize);
        }

        public async Task<ListResultObject<Order>> GetSellerOrdersAsync(long sellerUserId, int pageIndex = 1, int pageSize = 20)
        {
            return await GetOrdersAsync(x => x.SellerUserId == sellerUserId, pageIndex, pageSize);
        }

        public async Task<BitResultObject> MarkPaidAsync(long orderId, long buyerUserId)
        {
            return await UpdateOrderAsync(
                orderId,
                x => x.BuyerUserId == buyerUserId && x.Status == OrderStatus.PendingPayment,
                x => x.Status = OrderStatus.Paid,
                "Paid",
                "پرداخت سفارش ثبت شد");
        }

        public async Task<BitResultObject> StartOrderAsync(long orderId, long sellerUserId)
        {
            return await UpdateOrderAsync(
                orderId,
                x => x.SellerUserId == sellerUserId && x.Status == OrderStatus.Paid,
                x => x.Status = OrderStatus.InProgress,
                "Started",
                "اجرای سفارش آغاز شد");
        }

        public async Task<BitResultObject> DeliverOrderAsync(long orderId, long sellerUserId, string? note = null)
        {
            return await UpdateOrderAsync(
                orderId,
                x => x.SellerUserId == sellerUserId && (x.Status == OrderStatus.InProgress || x.Status == OrderStatus.Paid),
                x => x.Status = OrderStatus.Delivered,
                "Delivered",
                note ?? "سفارش تحویل شد");
        }

        public async Task<BitResultObject> CompleteOrderAsync(long orderId, long buyerUserId)
        {
            return await UpdateOrderAsync(
                orderId,
                x => x.BuyerUserId == buyerUserId && x.Status == OrderStatus.Delivered,
                x =>
                {
                    x.Status = OrderStatus.Completed;
                    x.CompletedAt = DateTime.UtcNow;
                },
                "Completed",
                "سفارش توسط خریدار تایید و تکمیل شد");
        }

        public async Task<BitResultObject> CancelOrderAsync(long orderId, long userId)
        {
            return await UpdateOrderAsync(
                orderId,
                x => (x.BuyerUserId == userId || x.SellerUserId == userId) &&
                     (x.Status == OrderStatus.PendingPayment || x.Status == OrderStatus.Paid),
                x => x.Status = OrderStatus.Cancelled,
                "Cancelled",
                "سفارش لغو شد");
        }

        public async Task<BitResultObject> UpdateMilestoneStatusAsync(long milestoneId, long userId, OrderMilestoneStatus status)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var milestone = await _context.OrderMilestones
                    .Include(x => x.Order)
                    .SingleOrDefaultAsync(x => x.ID == milestoneId && (x.Order.BuyerUserId == userId || x.Order.SellerUserId == userId));

                if (milestone == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "مرحله سفارش پیدا نشد یا دسترسی ندارید";
                    return result;
                }

                bool sellerAction = status is OrderMilestoneStatus.Delivered;
                bool buyerAction = status is OrderMilestoneStatus.Approved or OrderMilestoneStatus.Disputed;
                if ((sellerAction && milestone.Order.SellerUserId != userId) || (buyerAction && milestone.Order.BuyerUserId != userId))
                {
                    result.Status = false;
                    result.ErrorMessage = "برای این تغییر وضعیت دسترسی ندارید";
                    return result;
                }

                milestone.Status = status;
                milestone.UpdateDate = DateTime.UtcNow;
                if (status == OrderMilestoneStatus.Delivered) milestone.DeliveredAt = DateTime.UtcNow;
                if (status == OrderMilestoneStatus.Approved) milestone.ApprovedAt = DateTime.UtcNow;
                if (status == OrderMilestoneStatus.Released) milestone.ReleasedAt = DateTime.UtcNow;

                await AddEventAsync(milestone.OrderId, $"Milestone{status}", $"وضعیت مرحله {milestone.Title} تغییر کرد");
                await _context.SaveChangesAsync();
                result.ID = milestone.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        private async Task<ListResultObject<Order>> GetOrdersAsync(System.Linq.Expressions.Expression<Func<Order, bool>> predicate, int pageIndex, int pageSize)
        {
            ListResultObject<Order> results = new ListResultObject<Order>();
            try
            {
                var query = BaseOrderQuery().Where(predicate);
                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        private IQueryable<Order> BaseOrderQuery()
        {
            return _context.Orders
                .AsNoTracking()
                .Include(x => x.BuyerUser)
                .Include(x => x.SellerUser)
                .Include(x => x.Listing)
                .Include(x => x.ServicePackage)
                .Include(x => x.Milestones)
                .Include(x => x.Events);
        }

        private async Task<BitResultObject> UpdateOrderAsync(long orderId, Func<Order, bool> canUpdate, Action<Order> update, string eventType, string note)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var order = await _context.Orders.SingleOrDefaultAsync(x => x.ID == orderId);
                if (order == null || !canUpdate(order))
                {
                    result.Status = false;
                    result.ErrorMessage = "سفارش پیدا نشد یا تغییر وضعیت مجاز نیست";
                    return result;
                }

                update(order);
                order.UpdateDate = DateTime.UtcNow;
                await AddEventAsync(order.ID, eventType, note);
                await _context.SaveChangesAsync();
                result.ID = order.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        private async Task AddEventAsync(long orderId, string eventType, string? note)
        {
            await _context.OrderEvents.AddAsync(new OrderEvent
            {
                OrderId = orderId,
                EventType = eventType,
                Note = note,
                CreateDate = DateTime.UtcNow
            });
        }
    }
}
