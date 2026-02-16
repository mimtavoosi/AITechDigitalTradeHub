using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum PayoutStatus : byte { Requested = 1, Approved = 2, Paid = 3, Rejected = 4 }

    /// <summary>درخواست تسویه/برداشت.</summary>
    public class PayoutRequest : BaseEntity
    {
        public long WalletId { get; set; }
        public decimal Amount { get; set; }

        /// <summary>شماره کارت/شبا ماسک‌شده برای نمایش.</summary>
        [MaxLength(64)]
        public string BankAccountMasked { get; set; } = string.Empty;

        public PayoutStatus Status { get; set; } = PayoutStatus.Requested;

        public DateTime? PaidAt { get; set; }

        public Wallet Wallet { get; set; } = default!;
    }
}