using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Orders;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRep _orderRep;
        private readonly TheAppContext _context;

        public OrdersController(IOrderRep orderRep, TheAppContext context)
        {
            _orderRep = orderRep;
            _context = context;
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var userId = GetCurrentUserId();
            var result = await _orderRep.GetOrderByIdAsync(id);
            if (!result.Status || result.Result == null)
            {
                return NotFound(result);
            }

            return result.Result.BuyerUserId == userId || result.Result.SellerUserId == userId ? Ok(result.Map(OrderResponse.FromEntity)) : Forbid();
        }

        [HttpGet("purchases")]
        public async Task<IActionResult> GetPurchases([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _orderRep.GetBuyerOrdersAsync(GetCurrentUserId(), pageIndex, pageSize);
            return result.Status ? Ok(result.Map(OrderResponse.FromEntity)) : BadRequest(result);
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSales([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _orderRep.GetSellerOrdersAsync(GetCurrentUserId(), pageIndex, pageSize);
            return result.Status ? Ok(result.Map(OrderResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminList(
            [FromQuery] OrderStatus? status,
            [FromQuery] long listingId = 0,
            [FromQuery] string searchText = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = new ListResultObject<OrderResponse>();
            var query = _context.Orders
                .AsNoTracking()
                .Include(x => x.BuyerUser)
                .Include(x => x.SellerUser)
                .Include(x => x.Listing)
                .Where(x =>
                    (status == null || x.Status == status) &&
                    (listingId <= 0 || x.ListingId == listingId) &&
                    (string.IsNullOrEmpty(searchText) ||
                     x.Listing.Title.Contains(searchText) ||
                     x.BuyerUser.Username.Contains(searchText) ||
                     x.SellerUser.Username.Contains(searchText) ||
                     (x.BuyerUser.Email != null && x.BuyerUser.Email.Contains(searchText)) ||
                     (x.SellerUser.Email != null && x.SellerUser.Email.Contains(searchText))));

            result.TotalCount = await query.CountAsync();
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var orders = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();
            result.Results = orders.Select(OrderResponse.FromEntity).ToList();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var order = request.ToEntity(userId);
            var milestones = request.Milestones.Select(x => x.ToEntity()).ToList();
            var result = await _orderRep.CreateOrderAsync(order, milestones);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/mark-paid")]
        public async Task<IActionResult> MarkPaid(long id)
        {
            var result = await _orderRep.MarkPaidAsync(id, GetCurrentUserId());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/pay")]
        public async Task<IActionResult> Pay(long id, [FromBody] PayOrderRequest request)
        {
            var result = await PayOrderFromWalletAsync(id, GetCurrentUserId(), request.WalletId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/start")]
        public async Task<IActionResult> Start(long id)
        {
            var result = await _orderRep.StartOrderAsync(id, GetCurrentUserId());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/deliver")]
        public async Task<IActionResult> Deliver(long id, [FromBody] DeliverOrderRequest request)
        {
            var result = await _orderRep.DeliverOrderAsync(id, GetCurrentUserId(), request.Note);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/complete")]
        public async Task<IActionResult> Complete(long id)
        {
            var result = await _orderRep.CompleteOrderAsync(id, GetCurrentUserId());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/cancel")]
        public async Task<IActionResult> Cancel(long id)
        {
            var result = await _orderRep.CancelOrderAsync(id, GetCurrentUserId());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateAdminStatus(long id, [FromBody] UpdateOrderStatusRequest request)
        {
            var result = new BitResultObject();
            var order = await _context.Orders.SingleOrDefaultAsync(x => x.ID == id);
            if (order == null)
            {
                result.Status = false;
                result.ErrorMessage = "سفارش پیدا نشد";
                return NotFound(result);
            }

            order.Status = request.Status;
            order.UpdateDate = DateTime.UtcNow;
            if (request.Status == OrderStatus.Completed)
            {
                order.CompletedAt ??= DateTime.UtcNow;
            }

            await _context.OrderEvents.AddAsync(new OrderEvent
            {
                OrderId = order.ID,
                EventType = $"Admin{request.Status}",
                Note = string.IsNullOrWhiteSpace(request.Note) ? "وضعیت سفارش توسط ادمین تغییر کرد" : request.Note,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            });

            await _context.SaveChangesAsync();
            result.ID = order.ID;
            return Ok(result);
        }

        [HttpPatch("milestones/{milestoneId:long}/status")]
        public async Task<IActionResult> UpdateMilestoneStatus(long milestoneId, [FromBody] UpdateOrderMilestoneStatusRequest request)
        {
            var result = await _orderRep.UpdateMilestoneStatusAsync(milestoneId, GetCurrentUserId(), request.Status);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }

        private async Task<AITechDigitalTradeHub.Data.ResultObjects.BitResultObject> PayOrderFromWalletAsync(long orderId, long buyerUserId, long walletId)
        {
            var result = new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = await _context.Orders.SingleOrDefaultAsync(x => x.ID == orderId && x.BuyerUserId == buyerUserId);
                if (order == null || order.Status != OrderStatus.PendingPayment)
                {
                    result.Status = false;
                    result.ErrorMessage = "سفارش پیدا نشد یا قابل پرداخت نیست";
                    return result;
                }

                var payer = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == walletId && x.OwnerUserId == buyerUserId && x.OwnerType == WalletOwnerType.User);
                if (payer == null || payer.Status != WalletStatus.Active)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول پرداخت‌کننده فعال نیست";
                    return result;
                }

                var amount = order.PriceAmount * order.Qty;
                if (payer.Balance < amount)
                {
                    result.Status = false;
                    result.ErrorMessage = "موجودی کیف پول کافی نیست";
                    return result;
                }

                var payee = await _context.Wallets.SingleOrDefaultAsync(x =>
                    x.OwnerType == WalletOwnerType.User &&
                    x.OwnerUserId == order.SellerUserId &&
                    x.Currency == payer.Currency);

                if (payee == null)
                {
                    payee = new Wallet
                    {
                        OwnerType = WalletOwnerType.User,
                        OwnerUserId = order.SellerUserId,
                        Currency = payer.Currency,
                        Status = WalletStatus.Active,
                        CreateDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow,
                        IsActive = true
                    };
                    await _context.Wallets.AddAsync(payee);
                    await _context.SaveChangesAsync();
                }

                payer.Balance -= amount;
                payer.UpdateDate = DateTime.UtcNow;
                payee.Balance += amount;
                payee.UpdateDate = DateTime.UtcNow;
                order.Status = OrderStatus.Paid;
                order.UpdateDate = DateTime.UtcNow;

                await _context.Transactions.AddRangeAsync(
                    new Transaction
                    {
                        WalletId = payer.ID,
                        TxType = TransactionType.Payment,
                        Amount = -amount,
                        ReferenceType = "Order",
                        ReferenceId = order.ID,
                        Status = TransactionStatus.Success,
                        CreateDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow,
                        IsActive = true
                    },
                    new Transaction
                    {
                        WalletId = payee.ID,
                        TxType = TransactionType.Payment,
                        Amount = amount,
                        ReferenceType = "Order",
                        ReferenceId = order.ID,
                        Status = TransactionStatus.Success,
                        CreateDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow,
                        IsActive = true
                    });

                await _context.OrderEvents.AddAsync(new OrderEvent
                {
                    OrderId = order.ID,
                    EventType = "Paid",
                    Note = "پرداخت سفارش از کیف پول ثبت شد",
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });

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
    }

    public class PayOrderRequest
    {
        public long WalletId { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public OrderStatus Status { get; set; }
        public string? Note { get; set; }
    }
}
