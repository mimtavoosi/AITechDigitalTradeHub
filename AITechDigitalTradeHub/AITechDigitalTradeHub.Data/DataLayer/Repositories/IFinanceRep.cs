using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IFinanceRep
    {
        Task<RowResultObject<Wallet>> GetWalletByIdAsync(long walletId);
        Task<RowResultObject<Wallet>> GetWalletByOwnerAsync(WalletOwnerType ownerType, long ownerId, string currency = "IRR");
        Task<RowResultObject<Escrow>> GetEscrowByIdAsync(long escrowId);
        Task<BitResultObject> CreateWalletAsync(Wallet wallet);
        Task<ListResultObject<Transaction>> GetWalletTransactionsAsync(long walletId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> DepositAsync(long walletId, decimal amount, string? gatewayRef = null, string? referenceType = null, long? referenceId = null);
        Task<BitResultObject> HoldEscrowAsync(long payerWalletId, long payeeWalletId, decimal amount, string contextType, long contextId);
        Task<BitResultObject> ReleaseEscrowAsync(long escrowId);
        Task<BitResultObject> RefundEscrowAsync(long escrowId);
        Task<BitResultObject> RequestPayoutAsync(PayoutRequest payoutRequest);
    }
}
