using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ListingType : byte { Product = 1, Service = 2 }
    public enum PriceType : byte { Fixed = 1, Negotiable = 2, Range = 3 }
    public enum ListingStatus : byte { Draft = 1, Published = 2, Paused = 3, Expired = 4, Sold = 5 }

    /// <summary>آگهی واحد برای کالا/خدمت.</summary>
    public class Listing : BaseEntity
    {
        /// <summary>مالک آگهی.</summary>
        public long OwnerUserId { get; set; }

        /// <summary>نوع آگهی: کالا یا خدمت.</summary>
        public ListingType ListingType { get; set; }

        /// <summary>عنوان آگهی.</summary>
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        /// <summary>توضیحات (RichText/HTML هم می‌تواند باشد).</summary>
        public string? Description { get; set; }

        /// <summary>دسته‌بندی.</summary>
        public long CategoryId { get; set; }

        /// <summary>شهر.</summary>
       // public long? CityId { get; set; }

        /// <summary>آدرس.</summary>
        public long? AddressId { get; set; }

        /// <summary>عرض جغرافیایی (اختیاری).</summary>
        public decimal? Latitude { get; set; }

        /// <summary>طول جغرافیایی (اختیاری).</summary>
        public decimal? Longitude { get; set; }

        /// <summary>نوع قیمت.</summary>
        public PriceType PriceType { get; set; }

        /// <summary>قیمت ثابت (اگر Fixed).</summary>
        public decimal? PriceAmount { get; set; }

        /// <summary>حداقل قیمت (اگر Range).</summary>
        public decimal? PriceMin { get; set; }

        /// <summary>حداکثر قیمت (اگر Range).</summary>
        public decimal? PriceMax { get; set; }

        /// <summary>کد ارز (IRR, USD ...).</summary>
        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        /// <summary>وضعیت آگهی.</summary>
        public ListingStatus Status { get; set; } = ListingStatus.Draft;

        /// <summary>زمان انتشار.</summary>
        public DateTime? PublishedAt { get; set; }

        /// <summary>زمان انقضا (اختیاری).</summary>
        public DateTime? ExpiresAt { get; set; }

        /// <summary>شمارنده بازدید (Cache).</summary>
        public int ViewCount { get; set; }

        /// <summary>شمارنده ذخیره شدن (Cache).</summary>
        public int SaveCount { get; set; }

        /// <summary>فایل کاور.</summary>
        public long? CoverFileId { get; set; }

        // Navigation
        public User OwnerUser { get; set; } = default!;
        public Category Category { get; set; } = default!;
        //public City? City { get; set; }
        public Address? Address { get; set; }
        public Image? CoverFile { get; set; }
        public ListingProductDetails? ProductDetails { get; set; }
        public ListingServiceDetails? ServiceDetails { get; set; }

        public ICollection<Image> Media { get; set; } = new List<Image>();
        public ICollection<ListingTag> ListingTags { get; set; } = new List<ListingTag>();
        public ICollection<ListingSave> Saves { get; set; } = new List<ListingSave>();
        public ICollection<ListingQuestion> Questions { get; set; } = new List<ListingQuestion>();
    }
}