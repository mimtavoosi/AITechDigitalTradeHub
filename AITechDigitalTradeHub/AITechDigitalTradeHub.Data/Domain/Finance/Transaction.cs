using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum TransactionStatus : byte { Pending = 1, Success = 2, Failed = 3 }
    public enum TransactionType : byte { Deposit = 1, Withdraw = 2, Payment = 3, Hold = 4, Release = 5, Refund = 6, Fee = 7 }

    /// <summary>دفتر کل تراکنش‌ها (Ledger).</summary>
    public class Transaction : BaseEntity
    {
        public long WalletId { get; set; }

        public TransactionType TxType { get; set; }

        /// <summary>مبلغ (+ برای ورودی، - برای خروجی).</summary>
        public decimal Amount { get; set; }

        /// <summary>نوع مرجع (Order/Contract/Milestone ...).</summary>
        [MaxLength(64)]
        public string? ReferenceType { get; set; }

        /// <summary>شناسه مرجع.</summary>
        public long? ReferenceId { get; set; }

        /// <summary>شناسه پرداخت در درگاه (اختیاری).</summary>
        [MaxLength(128)]
        public string? GatewayRef { get; set; }

        public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

        public Wallet Wallet { get; set; } = default!;
    }
}