using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{

    public enum ServiceMode : byte { Online = 1, OnSite = 2, Both = 3 }

    /// <summary>جزئیات مخصوص خدمت (1 به 1 با Listing).</summary>
    public class ListingServiceDetails : BaseEntity
    {
        /// <summary>شناسه آگهی.</summary>
        public long ListingId { get; set; }

        /// <summary>نوع ارائه خدمت.</summary>
        public ServiceMode ServiceMode { get; set; }

        /// <summary>مدت تقریبی خدمت (دقیقه).</summary>
        public int? DurationMinutes { get; set; }

        /// <summary>شعاع پوشش برای خدمات حضوری (کیلومتر).</summary>
        public int? ServiceRadiusKm { get; set; }

        /// <summary>آیا پکیج‌های متعدد دارد؟</summary>
        public bool HasPackages { get; set; }

        public Listing Listing { get; set; } = default!;
        public ICollection<ServicePackage> Packages { get; set; } = new List<ServicePackage>();
    }
}
