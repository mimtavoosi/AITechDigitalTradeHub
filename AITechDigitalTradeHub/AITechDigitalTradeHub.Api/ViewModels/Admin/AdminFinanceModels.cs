using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Admin
{
    public class AdminFinanceDashboardResponse
    {
        public AdminReportRange Range { get; set; } = new();
        public int WalletsCount { get; set; }
        public decimal WalletsBalance { get; set; }
        public int FrozenWalletsCount { get; set; }
        public int TransactionCount { get; set; }
        public decimal TransactionVolume { get; set; }
        public decimal DepositVolume { get; set; }
        public decimal PaymentVolume { get; set; }
        public decimal WithdrawVolume { get; set; }
        public decimal HoldVolume { get; set; }
        public decimal ReleaseVolume { get; set; }
        public decimal RefundVolume { get; set; }
        public decimal FeeVolume { get; set; }
        public int HeldEscrowsCount { get; set; }
        public decimal HeldEscrowsAmount { get; set; }
        public int RequestedPayoutsCount { get; set; }
        public decimal RequestedPayoutsAmount { get; set; }
    }

    public class AdminWalletResponse
    {
        public long Id { get; set; }
        public WalletOwnerType OwnerType { get; set; }
        public long? OwnerUserId { get; set; }
        public long? OwnerOrganizationId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public decimal Balance { get; set; }
        public string Currency { get; set; } = "IRR";
        public WalletStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }

        public static AdminWalletResponse FromEntity(Wallet wallet) => new()
        {
            Id = wallet.ID,
            OwnerType = wallet.OwnerType,
            OwnerUserId = wallet.OwnerUserId,
            OwnerOrganizationId = wallet.OwnerOrganizationId,
            OwnerName = BuildOwnerName(wallet),
            Balance = wallet.Balance,
            Currency = wallet.Currency,
            Status = wallet.Status,
            CreateDate = wallet.CreateDate
        };

        private static string BuildOwnerName(Wallet wallet)
        {
            if (wallet.OwnerUser != null)
            {
                var fullName = $"{wallet.OwnerUser.FirstName} {wallet.OwnerUser.LastName}".Trim();
                return string.IsNullOrWhiteSpace(fullName) ? wallet.OwnerUser.Username : fullName;
            }

            if (wallet.OwnerOrganization != null)
            {
                return wallet.OwnerOrganization.Title;
            }

            return wallet.OwnerType.ToString();
        }
    }

    public class AdminTransactionResponse
    {
        public long Id { get; set; }
        public long WalletId { get; set; }
        public string WalletOwnerName { get; set; } = string.Empty;
        public WalletOwnerType WalletOwnerType { get; set; }
        public TransactionType TxType { get; set; }
        public decimal Amount { get; set; }
        public string? ReferenceType { get; set; }
        public long? ReferenceId { get; set; }
        public string? GatewayRef { get; set; }
        public TransactionStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }

        public static AdminTransactionResponse FromEntity(Transaction transaction) => new()
        {
            Id = transaction.ID,
            WalletId = transaction.WalletId,
            WalletOwnerName = AdminWalletResponse.FromEntity(transaction.Wallet).OwnerName,
            WalletOwnerType = transaction.Wallet.OwnerType,
            TxType = transaction.TxType,
            Amount = transaction.Amount,
            ReferenceType = transaction.ReferenceType,
            ReferenceId = transaction.ReferenceId,
            GatewayRef = transaction.GatewayRef,
            Status = transaction.Status,
            CreateDate = transaction.CreateDate
        };
    }

    public class AdminEscrowResponse
    {
        public long Id { get; set; }
        public long PayerWalletId { get; set; }
        public string PayerOwnerName { get; set; } = string.Empty;
        public long PayeeWalletId { get; set; }
        public string PayeeOwnerName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string ContextType { get; set; } = string.Empty;
        public long ContextId { get; set; }
        public EscrowStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? UpdateDate { get; set; }

        public static AdminEscrowResponse FromEntity(Escrow escrow) => new()
        {
            Id = escrow.ID,
            PayerWalletId = escrow.PayerWalletId,
            PayerOwnerName = AdminWalletResponse.FromEntity(escrow.PayerWallet).OwnerName,
            PayeeWalletId = escrow.PayeeWalletId,
            PayeeOwnerName = AdminWalletResponse.FromEntity(escrow.PayeeWallet).OwnerName,
            Amount = escrow.Amount,
            ContextType = escrow.ContextType,
            ContextId = escrow.ContextId,
            Status = escrow.Status,
            CreateDate = escrow.CreateDate,
            UpdateDate = escrow.UpdateDate
        };
    }

    public class AdminPayoutRequestResponse
    {
        public long Id { get; set; }
        public long WalletId { get; set; }
        public string WalletOwnerName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string BankAccountMasked { get; set; } = string.Empty;
        public PayoutStatus Status { get; set; }
        public DateTime? PaidAt { get; set; }
        public DateTime? CreateDate { get; set; }

        public static AdminPayoutRequestResponse FromEntity(PayoutRequest payout) => new()
        {
            Id = payout.ID,
            WalletId = payout.WalletId,
            WalletOwnerName = AdminWalletResponse.FromEntity(payout.Wallet).OwnerName,
            Amount = payout.Amount,
            BankAccountMasked = payout.BankAccountMasked,
            Status = payout.Status,
            PaidAt = payout.PaidAt,
            CreateDate = payout.CreateDate
        };
    }
}
