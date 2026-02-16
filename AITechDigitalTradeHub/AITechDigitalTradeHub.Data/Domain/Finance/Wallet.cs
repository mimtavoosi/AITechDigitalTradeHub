using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum WalletOwnerType : byte { User = 1, Organization = 2 }
    public enum WalletStatus : byte { Active = 1, Frozen = 2 }

    /// <summary>کیف پول (برای نگهداری موجودی و تراکنش‌ها).</summary>
    public class Wallet : BaseEntity
    {
        public WalletOwnerType OwnerType { get; set; }

        public long? OwnerUserId { get; set; }
        public long? OwnerOrganizationId { get; set; }

        /// <summary>موجودی جاری.</summary>
        public decimal Balance { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public WalletStatus Status { get; set; } = WalletStatus.Active;

        public User? OwnerUser { get; set; }
        public Organization? OwnerOrganization { get; set; }
    }
}