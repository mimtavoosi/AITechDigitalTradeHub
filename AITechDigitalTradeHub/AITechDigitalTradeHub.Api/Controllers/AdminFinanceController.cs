using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Admin;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
    [Route("api/admin/finance")]
    public class AdminFinanceController : ControllerBase
    {
        private readonly TheAppContext _context;

        public AdminFinanceController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboard([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var range = NormalizeRange(from, to);
            var transactions = _context.Transactions
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var successfulTransactions = transactions.Where(x => x.Status == TransactionStatus.Success);
            var requestedPayouts = _context.PayoutRequests
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.Status == PayoutStatus.Requested);
            var heldEscrows = _context.Escrows
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.Status == EscrowStatus.Held);

            var response = new AdminFinanceDashboardResponse
            {
                Range = range,
                WalletsCount = await _context.Wallets.CountAsync(x => x.DeleteDate == null),
                WalletsBalance = await _context.Wallets.Where(x => x.DeleteDate == null).SumAsync(x => x.Balance),
                FrozenWalletsCount = await _context.Wallets.CountAsync(x => x.DeleteDate == null && x.Status == WalletStatus.Frozen),
                TransactionCount = await successfulTransactions.CountAsync(),
                TransactionVolume = await successfulTransactions.SumAsync(x => Math.Abs(x.Amount)),
                DepositVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Deposit),
                PaymentVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Payment),
                WithdrawVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Withdraw),
                HoldVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Hold),
                ReleaseVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Release),
                RefundVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Refund),
                FeeVolume = await SumSuccessfulTransactionsAsync(successfulTransactions, TransactionType.Fee),
                HeldEscrowsCount = await heldEscrows.CountAsync(),
                HeldEscrowsAmount = await heldEscrows.SumAsync(x => x.Amount),
                RequestedPayoutsCount = await requestedPayouts.CountAsync(),
                RequestedPayoutsAmount = await requestedPayouts.SumAsync(x => x.Amount)
            };

            return Ok(new RowResultObject<AdminFinanceDashboardResponse> { Result = response });
        }

        [HttpGet("wallets")]
        public async Task<IActionResult> GetWallets(
            [FromQuery] WalletOwnerType? ownerType = null,
            [FromQuery] WalletStatus? status = null,
            [FromQuery] string currency = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50,
            [FromQuery] string searchText = "")
        {
            var query = BuildWalletQuery();
            if (ownerType.HasValue) query = query.Where(x => x.OwnerType == ownerType.Value);
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (!string.IsNullOrWhiteSpace(currency))
            {
                var normalizedCurrency = currency.Trim().ToUpperInvariant();
                query = query.Where(x => x.Currency == normalizedCurrency);
            }

            if (!string.IsNullOrWhiteSpace(searchText))
            {
                var term = searchText.Trim();
                query = query.Where(x =>
                    (x.OwnerUser != null && (
                        x.OwnerUser.FirstName.Contains(term) ||
                        x.OwnerUser.LastName.Contains(term) ||
                        x.OwnerUser.Username.Contains(term) ||
                        x.OwnerUser.Email.Contains(term))) ||
                    (x.OwnerOrganization != null && x.OwnerOrganization.Title.Contains(term)));
            }

            var total = await query.CountAsync();
            var wallets = await query
                .OrderByDescending(x => x.Balance)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<AdminWalletResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = wallets.Select(AdminWalletResponse.FromEntity).ToList()
            });
        }

        [HttpGet("transactions")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] long? walletId = null,
            [FromQuery] TransactionType? txType = null,
            [FromQuery] TransactionStatus? status = null,
            [FromQuery] string referenceType = "",
            [FromQuery] DateTime? from = null,
            [FromQuery] DateTime? to = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var range = NormalizeRange(from, to);
            var query = BuildTransactionQuery()
                .Where(x => x.CreateDate >= range.From && x.CreateDate < range.To);
            if (walletId.HasValue) query = query.Where(x => x.WalletId == walletId.Value);
            if (txType.HasValue) query = query.Where(x => x.TxType == txType.Value);
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (!string.IsNullOrWhiteSpace(referenceType))
            {
                var term = referenceType.Trim();
                query = query.Where(x => x.ReferenceType == term);
            }

            var total = await query.CountAsync();
            var transactions = await query
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<AdminTransactionResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = transactions.Select(AdminTransactionResponse.FromEntity).ToList()
            });
        }

        [HttpGet("escrows")]
        public async Task<IActionResult> GetEscrows(
            [FromQuery] EscrowStatus? status = null,
            [FromQuery] string contextType = "",
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = BuildEscrowQuery();
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);
            if (!string.IsNullOrWhiteSpace(contextType))
            {
                var term = contextType.Trim();
                query = query.Where(x => x.ContextType == term);
            }

            var total = await query.CountAsync();
            var escrows = await query
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<AdminEscrowResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = escrows.Select(AdminEscrowResponse.FromEntity).ToList()
            });
        }

        [HttpGet("payout-requests")]
        public async Task<IActionResult> GetPayoutRequests(
            [FromQuery] PayoutStatus? status = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 50)
        {
            var query = _context.PayoutRequests
                .AsNoTracking()
                .Include(x => x.Wallet)
                    .ThenInclude(x => x.OwnerUser)
                .Include(x => x.Wallet)
                    .ThenInclude(x => x.OwnerOrganization)
                .Where(x => x.DeleteDate == null);
            if (status.HasValue) query = query.Where(x => x.Status == status.Value);

            var total = await query.CountAsync();
            var payouts = await query
                .OrderByDescending(x => x.CreateDate)
                .ThenByDescending(x => x.ID)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new ListResultObject<AdminPayoutRequestResponse>
            {
                TotalCount = total,
                PageCount = DbTools.GetPageCount(total, pageSize),
                Results = payouts.Select(AdminPayoutRequestResponse.FromEntity).ToList()
            });
        }

        private IQueryable<Wallet> BuildWalletQuery() => _context.Wallets
            .AsNoTracking()
            .Include(x => x.OwnerUser)
            .Include(x => x.OwnerOrganization)
            .Where(x => x.DeleteDate == null);

        private IQueryable<Transaction> BuildTransactionQuery() => _context.Transactions
            .AsNoTracking()
            .Include(x => x.Wallet)
                .ThenInclude(x => x.OwnerUser)
            .Include(x => x.Wallet)
                .ThenInclude(x => x.OwnerOrganization)
            .Where(x => x.DeleteDate == null);

        private IQueryable<Escrow> BuildEscrowQuery() => _context.Escrows
            .AsNoTracking()
            .Include(x => x.PayerWallet)
                .ThenInclude(x => x.OwnerUser)
            .Include(x => x.PayerWallet)
                .ThenInclude(x => x.OwnerOrganization)
            .Include(x => x.PayeeWallet)
                .ThenInclude(x => x.OwnerUser)
            .Include(x => x.PayeeWallet)
                .ThenInclude(x => x.OwnerOrganization)
            .Where(x => x.DeleteDate == null);

        private static async Task<decimal> SumSuccessfulTransactionsAsync(IQueryable<Transaction> transactions, TransactionType txType)
        {
            return await transactions.Where(x => x.TxType == txType).SumAsync(x => Math.Abs(x.Amount));
        }

        private static AdminReportRange NormalizeRange(DateTime? from, DateTime? to)
        {
            var normalizedTo = (to ?? DateTime.UtcNow).Date.AddDays(1);
            var normalizedFrom = (from ?? normalizedTo.AddDays(-30)).Date;
            if (normalizedFrom >= normalizedTo)
            {
                normalizedFrom = normalizedTo.AddDays(-30);
            }

            return new AdminReportRange { From = normalizedFrom, To = normalizedTo };
        }
    }
}
