using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class FinanceRep : IFinanceRep
    {
        private readonly TheAppContext _context;

        public FinanceRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> CreateWalletAsync(Wallet wallet)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                bool exists = await _context.Wallets.AnyAsync(x =>
                    x.OwnerType == wallet.OwnerType &&
                    x.OwnerUserId == wallet.OwnerUserId &&
                    x.OwnerOrganizationId == wallet.OwnerOrganizationId &&
                    x.Currency == wallet.Currency);

                if (exists)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول برای این مالک و ارز از قبل وجود دارد";
                    return result;
                }

                await _context.Wallets.AddAsync(wallet);
                await _context.SaveChangesAsync();
                result.ID = wallet.ID;
                _context.Entry(wallet).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> DepositAsync(long walletId, decimal amount, string? gatewayRef = null, string? referenceType = null, long? referenceId = null)
        {
            BitResultObject result = new BitResultObject();
            if (amount <= 0)
            {
                result.Status = false;
                result.ErrorMessage = "مبلغ باید بزرگتر از صفر باشد";
                return result;
            }

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var wallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == walletId);
                if (wallet == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول پیدا نشد";
                    return result;
                }

                wallet.Balance += amount;
                wallet.UpdateDate = DateTime.Now;

                var transaction = new Transaction
                {
                    WalletId = walletId,
                    TxType = TransactionType.Deposit,
                    Amount = amount,
                    GatewayRef = gatewayRef,
                    ReferenceType = referenceType,
                    ReferenceId = referenceId,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.Now
                };

                await _context.Transactions.AddAsync(transaction);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                result.ID = transaction.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Wallet>> GetWalletByIdAsync(long walletId)
        {
            RowResultObject<Wallet> result = new RowResultObject<Wallet>();
            try
            {
                result.Result = await _context.Wallets.AsNoTracking().SingleOrDefaultAsync(x => x.ID == walletId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Escrow>> GetEscrowByIdAsync(long escrowId)
        {
            RowResultObject<Escrow> result = new RowResultObject<Escrow>();
            try
            {
                result.Result = await _context.Escrows
                    .AsNoTracking()
                    .Include(x => x.PayerWallet)
                    .Include(x => x.PayeeWallet)
                    .SingleOrDefaultAsync(x => x.ID == escrowId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<Wallet>> GetWalletByOwnerAsync(WalletOwnerType ownerType, long ownerId, string currency = "IRR")
        {
            RowResultObject<Wallet> result = new RowResultObject<Wallet>();
            try
            {
                result.Result = await _context.Wallets
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x =>
                        x.OwnerType == ownerType &&
                        x.Currency == currency &&
                        (ownerType == WalletOwnerType.User ? x.OwnerUserId == ownerId : x.OwnerOrganizationId == ownerId));
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Transaction>> GetWalletTransactionsAsync(long walletId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Transaction> results = new ListResultObject<Transaction>();
            try
            {
                var query = _context.Transactions.AsNoTracking().Where(x => x.WalletId == walletId);
                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> HoldEscrowAsync(long payerWalletId, long payeeWalletId, decimal amount, string contextType, long contextId)
        {
            BitResultObject result = new BitResultObject();
            if (amount <= 0)
            {
                result.Status = false;
                result.ErrorMessage = "مبلغ باید بزرگتر از صفر باشد";
                return result;
            }

            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var payer = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == payerWalletId);
                var payeeExists = await _context.Wallets.AnyAsync(x => x.ID == payeeWalletId);

                if (payer == null || !payeeExists)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول پرداخت‌کننده یا دریافت‌کننده پیدا نشد";
                    return result;
                }

                if (payer.Balance < amount)
                {
                    result.Status = false;
                    result.ErrorMessage = "موجودی کیف پول کافی نیست";
                    return result;
                }

                payer.Balance -= amount;
                payer.UpdateDate = DateTime.Now;

                var escrow = new Escrow
                {
                    PayerWalletId = payerWalletId,
                    PayeeWalletId = payeeWalletId,
                    Amount = amount,
                    ContextType = contextType,
                    ContextId = contextId,
                    Status = EscrowStatus.Held,
                    CreateDate = DateTime.Now
                };

                await _context.Escrows.AddAsync(escrow);
                await _context.SaveChangesAsync();

                await _context.Transactions.AddAsync(new Transaction
                {
                    WalletId = payerWalletId,
                    TxType = TransactionType.Hold,
                    Amount = -amount,
                    ReferenceType = contextType,
                    ReferenceId = contextId,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.Now
                });

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                result.ID = escrow.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RefundEscrowAsync(long escrowId)
        {
            return await CompleteEscrowAsync(escrowId, EscrowStatus.Refunded);
        }

        public async Task<BitResultObject> ReleaseEscrowAsync(long escrowId)
        {
            return await CompleteEscrowAsync(escrowId, EscrowStatus.Released);
        }

        public async Task<BitResultObject> RequestPayoutAsync(PayoutRequest payoutRequest)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                bool walletExists = await _context.Wallets.AnyAsync(x => x.ID == payoutRequest.WalletId);
                if (!walletExists)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول پیدا نشد";
                    return result;
                }

                payoutRequest.Status = PayoutStatus.Requested;
                await _context.PayoutRequests.AddAsync(payoutRequest);
                await _context.SaveChangesAsync();
                result.ID = payoutRequest.ID;
                _context.Entry(payoutRequest).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        private async Task<BitResultObject> CompleteEscrowAsync(long escrowId, EscrowStatus targetStatus)
        {
            BitResultObject result = new BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var escrow = await _context.Escrows.SingleOrDefaultAsync(x => x.ID == escrowId);
                if (escrow == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "Escrow پیدا نشد";
                    return result;
                }

                if (escrow.Status != EscrowStatus.Held && escrow.Status != EscrowStatus.Disputed)
                {
                    result.Status = false;
                    result.ErrorMessage = "وضعیت Escrow قابل تغییر نیست";
                    return result;
                }

                long destinationWalletId = targetStatus == EscrowStatus.Released ? escrow.PayeeWalletId : escrow.PayerWalletId;
                var destinationWallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == destinationWalletId);
                if (destinationWallet == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "کیف پول مقصد پیدا نشد";
                    return result;
                }

                decimal fee = 0;
                if (targetStatus == EscrowStatus.Released && TryMapFeeContextType(escrow.ContextType, out var feeContextType))
                {
                    fee = await CalculateFeeAsync(feeContextType, escrow.Amount);
                }

                destinationWallet.Balance += escrow.Amount - fee;
                destinationWallet.UpdateDate = DateTime.Now;
                escrow.Status = targetStatus;
                escrow.UpdateDate = DateTime.Now;

                await _context.Transactions.AddAsync(new Transaction
                {
                    WalletId = destinationWallet.ID,
                    TxType = targetStatus == EscrowStatus.Released ? TransactionType.Release : TransactionType.Refund,
                    Amount = escrow.Amount,
                    ReferenceType = escrow.ContextType,
                    ReferenceId = escrow.ContextId,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.Now
                });

                if (fee > 0)
                {
                    await _context.Transactions.AddAsync(new Transaction
                    {
                        WalletId = destinationWallet.ID,
                        TxType = TransactionType.Fee,
                        Amount = -fee,
                        ReferenceType = escrow.ContextType,
                        ReferenceId = escrow.ContextId,
                        Status = TransactionStatus.Success,
                        CreateDate = DateTime.Now
                    });
                }

                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                result.ID = escrow.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        private static bool TryMapFeeContextType(string contextType, out PlatformFeeContextType feeContextType)
        {
            switch (contextType)
            {
                case "Order":
                    feeContextType = PlatformFeeContextType.Order;
                    return true;
                case "Contract":
                case "ProjectMilestone":
                    feeContextType = PlatformFeeContextType.Contract;
                    return true;
                case "Course":
                case "CourseEnrollment":
                    feeContextType = PlatformFeeContextType.Course;
                    return true;
                case "TeacherBooking":
                    feeContextType = PlatformFeeContextType.TeacherBooking;
                    return true;
                case "Investment":
                    feeContextType = PlatformFeeContextType.Investment;
                    return true;
                case "Payout":
                    feeContextType = PlatformFeeContextType.Payout;
                    return true;
                default:
                    feeContextType = default;
                    return false;
            }
        }

        public async Task<ListResultObject<PlatformFeeRule>> GetFeeRulesAsync()
        {
            var result = new ListResultObject<PlatformFeeRule>();
            try
            {
                var query = _context.PlatformFeeRules.AsNoTracking().Where(x => x.DeleteDate == null);
                result.TotalCount = await query.CountAsync();
                result.Results = await query.OrderBy(x => x.ContextType).ThenBy(x => x.MinAmount).ToListAsync();
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> CreateFeeRuleAsync(PlatformFeeRule rule)
        {
            var result = new BitResultObject();
            try
            {
                if (rule.Percent < 0 || rule.Percent > 100)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "درصد کارمزد باید بین ۰ تا ۱۰۰ باشد." };
                }

                rule.CreateDate = DateTime.Now;
                rule.UpdateDate = DateTime.Now;
                await _context.PlatformFeeRules.AddAsync(rule);
                await _context.SaveChangesAsync();
                result.ID = rule.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> UpdateFeeRuleAsync(PlatformFeeRule rule)
        {
            var result = new BitResultObject();
            try
            {
                if (rule.Percent < 0 || rule.Percent > 100)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "درصد کارمزد باید بین ۰ تا ۱۰۰ باشد." };
                }

                var existing = await _context.PlatformFeeRules.SingleOrDefaultAsync(x => x.ID == rule.ID && x.DeleteDate == null);
                if (existing == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "قانون کارمزد پیدا نشد." };
                }

                existing.ContextType = rule.ContextType;
                existing.Percent = rule.Percent;
                existing.FixedAmount = rule.FixedAmount;
                existing.Currency = rule.Currency;
                existing.MinAmount = rule.MinAmount;
                existing.MaxAmount = rule.MaxAmount;
                existing.MinTrustLevel = rule.MinTrustLevel;
                existing.IsActiveRule = rule.IsActiveRule;
                existing.UpdateDate = DateTime.Now;

                await _context.SaveChangesAsync();
                result.ID = existing.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> SetFeeRuleActiveAsync(long id, bool isActive)
        {
            var result = new BitResultObject();
            try
            {
                var existing = await _context.PlatformFeeRules.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
                if (existing == null)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "قانون کارمزد پیدا نشد." };
                }

                existing.IsActiveRule = isActive;
                existing.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = existing.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<decimal> CalculateFeeAsync(PlatformFeeContextType contextType, decimal amount)
        {
            if (amount <= 0)
            {
                return 0;
            }

            var rule = await _context.PlatformFeeRules
                .AsNoTracking()
                .Where(x =>
                    x.ContextType == contextType &&
                    x.IsActiveRule &&
                    x.DeleteDate == null &&
                    (x.MinAmount == null || amount >= x.MinAmount) &&
                    (x.MaxAmount == null || amount <= x.MaxAmount))
                .OrderBy(x => x.ID)
                .FirstOrDefaultAsync();

            if (rule == null)
            {
                return 0;
            }

            var fee = amount * (rule.Percent / 100m) + (rule.FixedAmount ?? 0);
            return Math.Clamp(fee, 0, amount);
        }

        public async Task<decimal> CalculateFeeForReferenceTypeAsync(string referenceType, decimal amount)
        {
            return TryMapFeeContextType(referenceType, out var feeContextType)
                ? await CalculateFeeAsync(feeContextType, amount)
                : 0;
        }
    }
}
