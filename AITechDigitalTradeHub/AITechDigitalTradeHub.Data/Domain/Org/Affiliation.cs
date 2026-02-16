using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum AffiliationStatus : byte { Active = 1, Paused = 2, Ended = 3 }

    /// <summary>زیرمجموعه‌گیری: سازمان ↔ پیمانکار/فریلنسر.</summary>
    public class Affiliation : BaseEntity
    {
        public long OrganizationId { get; set; }
        public long ContractorUserId { get; set; }

        /// <summary>درصد کمیسیون سازمان از پروژه‌های این پیمانکار (اختیاری).</summary>
        public decimal? CommissionPercent { get; set; }

        public AffiliationStatus Status { get; set; } = AffiliationStatus.Active;

        public Organization Organization { get; set; } = default!;
        public User ContractorUser { get; set; } = default!;
    }
}