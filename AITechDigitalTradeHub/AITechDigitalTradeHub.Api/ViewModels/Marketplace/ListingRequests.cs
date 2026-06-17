using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Marketplace
{
    public class ListingUpsertRequest
    {
        [Required]
        public ListingType ListingType { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(1, long.MaxValue)]
        public long CategoryId { get; set; }

        public long? AddressId { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }

        [Required]
        public PriceType PriceType { get; set; }

        public decimal? PriceAmount { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public long? CoverFileId { get; set; }

        public ProductDetailsRequest? ProductDetails { get; set; }
        public ServiceDetailsRequest? ServiceDetails { get; set; }
        public RentalDetailsRequest? RentalDetails { get; set; }

        public Listing ToEntity(long ownerUserId)
        {
            var listing = new Listing
            {
                OwnerUserId = ownerUserId,
                ListingType = ListingType,
                Title = Title.Trim(),
                Description = Description,
                CategoryId = CategoryId,
                AddressId = AddressId,
                Latitude = Latitude,
                Longitude = Longitude,
                PriceType = PriceType,
                PriceAmount = PriceAmount,
                PriceMin = PriceMin,
                PriceMax = PriceMax,
                Currency = Currency,
                CoverFileId = CoverFileId
            };

            if (ProductDetails != null)
            {
                listing.ProductDetails = ProductDetails.ToEntity();
            }

            if (ServiceDetails != null)
            {
                listing.ServiceDetails = ServiceDetails.ToEntity();
            }

            if (RentalDetails != null)
            {
                listing.EquipmentRentalDetails = RentalDetails.ToEntity();
            }

            return listing;
        }
    }

    public class ProductDetailsRequest
    {
        public ProductCondition Condition { get; set; } = ProductCondition.New;
        public int StockQty { get; set; } = 1;
        public int? WarrantyMonths { get; set; }
        public ShippingType ShippingType { get; set; } = ShippingType.Pickup;
        [MaxLength(80)] public string? Brand { get; set; }
        [MaxLength(80)] public string? Model { get; set; }

        public ListingProductDetails ToEntity() => new()
        {
            Condition = Condition,
            StockQty = StockQty,
            WarrantyMonths = WarrantyMonths,
            ShippingType = ShippingType,
            Brand = Brand,
            Model = Model
        };
    }

    public class ServiceDetailsRequest
    {
        public ServiceMode ServiceMode { get; set; } = ServiceMode.Online;
        public int? DurationMinutes { get; set; }
        public int? ServiceRadiusKm { get; set; }
        public bool HasPackages { get; set; }

        public ListingServiceDetails ToEntity() => new()
        {
            ServiceMode = ServiceMode,
            DurationMinutes = DurationMinutes,
            ServiceRadiusKm = ServiceRadiusKm,
            HasPackages = HasPackages
        };
    }

    public class RentalDetailsRequest
    {
        [MaxLength(120)] public string? GpuModel { get; set; }
        public int? GpuCount { get; set; }
        public int? CpuCores { get; set; }
        public int? RamGb { get; set; }
        public int? StorageGb { get; set; }
        [MaxLength(120)] public string? NetworkSpec { get; set; }
        public RentalBillingUnit BillingUnit { get; set; } = RentalBillingUnit.Hour;
        public decimal PricePerUnit { get; set; }
        public int? MinRentalUnits { get; set; }
        public int? MaxRentalUnits { get; set; }
        public bool RequiresManualApproval { get; set; }

        public EquipmentRentalDetails ToEntity() => new()
        {
            GpuModel = GpuModel,
            GpuCount = GpuCount,
            CpuCores = CpuCores,
            RamGb = RamGb,
            StorageGb = StorageGb,
            NetworkSpec = NetworkSpec,
            BillingUnit = BillingUnit,
            PricePerUnit = PricePerUnit,
            MinRentalUnits = MinRentalUnits,
            MaxRentalUnits = MaxRentalUnits,
            RequiresManualApproval = RequiresManualApproval
        };
    }
}
