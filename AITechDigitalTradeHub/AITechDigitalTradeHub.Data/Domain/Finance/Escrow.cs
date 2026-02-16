using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum EscrowStatus : byte { Held = 1, Released = 2, Refunded = 3, Disputed = 4 }

    /// <summary>نگهداری وجه تا پایان تعهد (Escrow/Hold).</summary>
    public class Escrow : BaseEntity
    {
        public long PayerWalletId { get; set; }
        public long PayeeWalletId { get; set; }

        public decimal Amount { get; set; }

        /// <summary>زمینه: Order یا Milestone.</summary>
        [MaxLength(32)]
        public string ContextType { get; set; } = "Order";

        public long ContextId { get; set; }

        public EscrowStatus Status { get; set; } = EscrowStatus.Held;

        public Wallet PayerWallet { get; set; } = default!;
        public Wallet PayeeWallet { get; set; } = default!;
    }
}