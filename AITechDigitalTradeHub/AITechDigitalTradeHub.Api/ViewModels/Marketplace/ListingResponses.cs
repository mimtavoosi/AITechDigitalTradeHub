using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Marketplace
{
    public class ListingListItemResponse
    {
        public long Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ListingType ListingType { get; set; }
        public ListingStatus Status { get; set; }
        public PriceType PriceType { get; set; }
        public decimal? PriceAmount { get; set; }
        public decimal? PriceMin { get; set; }
        public decimal? PriceMax { get; set; }
        public string Currency { get; set; } = "IRR";
        public string? CategoryName { get; set; }
        public long OwnerUserId { get; set; }
        public string? OwnerName { get; set; }
        public DateTime? PublishedAt { get; set; }

        public static ListingListItemResponse FromEntity(Listing listing)
        {
            return new ListingListItemResponse
            {
                Id = listing.ID,
                Slug = listing.ID.ToString(),
                Title = listing.Title,
                Description = listing.Description,
                ListingType = listing.ListingType,
                Status = listing.Status,
                PriceType = listing.PriceType,
                PriceAmount = listing.PriceAmount,
                PriceMin = listing.PriceMin,
                PriceMax = listing.PriceMax,
                Currency = listing.Currency,
                CategoryName = listing.Category?.CategoryName,
                OwnerUserId = listing.OwnerUserId,
                OwnerName = listing.OwnerUser == null ? null : $"{listing.OwnerUser.FirstName} {listing.OwnerUser.LastName}".Trim(),
                PublishedAt = listing.PublishedAt
            };
        }
    }

    public class ListingDetailResponse : ListingListItemResponse
    {
        public ListingProductDetailsResponse? ProductDetails { get; set; }
        public ListingServiceDetailsResponse? ServiceDetails { get; set; }
        public EquipmentRentalDetailsResponse? EquipmentRentalDetails { get; set; }

        public static new ListingDetailResponse FromEntity(Listing listing)
        {
            return new ListingDetailResponse
            {
                Id = listing.ID,
                Slug = listing.ID.ToString(),
                Title = listing.Title,
                Description = listing.Description,
                ListingType = listing.ListingType,
                Status = listing.Status,
                PriceType = listing.PriceType,
                PriceAmount = listing.PriceAmount,
                PriceMin = listing.PriceMin,
                PriceMax = listing.PriceMax,
                Currency = listing.Currency,
                CategoryName = listing.Category?.CategoryName,
                OwnerUserId = listing.OwnerUserId,
                OwnerName = listing.OwnerUser == null ? null : $"{listing.OwnerUser.FirstName} {listing.OwnerUser.LastName}".Trim(),
                PublishedAt = listing.PublishedAt,
                ProductDetails = listing.ProductDetails == null ? null : ListingProductDetailsResponse.FromEntity(listing.ProductDetails),
                ServiceDetails = listing.ServiceDetails == null ? null : ListingServiceDetailsResponse.FromEntity(listing.ServiceDetails),
                EquipmentRentalDetails = listing.EquipmentRentalDetails == null ? null : EquipmentRentalDetailsResponse.FromEntity(listing.EquipmentRentalDetails)
            };
        }
    }

    public class ListingProductDetailsResponse
    {
        public ProductCondition Condition { get; set; }
        public int StockQty { get; set; }
        public int? WarrantyMonths { get; set; }
        public ShippingType ShippingType { get; set; }
        public string? Brand { get; set; }
        public string? Model { get; set; }

        public static ListingProductDetailsResponse FromEntity(ListingProductDetails details) => new()
        {
            Condition = details.Condition,
            StockQty = details.StockQty,
            WarrantyMonths = details.WarrantyMonths,
            ShippingType = details.ShippingType,
            Brand = details.Brand,
            Model = details.Model
        };
    }

    public class ListingServiceDetailsResponse
    {
        public ServiceMode ServiceMode { get; set; }
        public int? DurationMinutes { get; set; }
        public int? ServiceRadiusKm { get; set; }
        public bool HasPackages { get; set; }
        public List<ServicePackageResponse> Packages { get; set; } = new();

        public static ListingServiceDetailsResponse FromEntity(ListingServiceDetails details) => new()
        {
            ServiceMode = details.ServiceMode,
            DurationMinutes = details.DurationMinutes,
            ServiceRadiusKm = details.ServiceRadiusKm,
            HasPackages = details.HasPackages,
            Packages = details.Packages?.Select(ServicePackageResponse.FromEntity).ToList() ?? new List<ServicePackageResponse>()
        };
    }

    public class ServicePackageResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal PriceAmount { get; set; }
        public int? DurationMinutes { get; set; }

        public static ServicePackageResponse FromEntity(ServicePackage package) => new()
        {
            Id = package.ID,
            Title = package.Title,
            Description = package.Description,
            PriceAmount = package.PriceAmount,
            DurationMinutes = package.DurationMinutes
        };
    }

    public class EquipmentRentalDetailsResponse
    {
        public string? GpuModel { get; set; }
        public int? GpuCount { get; set; }
        public int? CpuCores { get; set; }
        public int? RamGb { get; set; }
        public int? StorageGb { get; set; }
        public string? NetworkSpec { get; set; }
        public RentalBillingUnit BillingUnit { get; set; }
        public decimal PricePerUnit { get; set; }
        public int? MinRentalUnits { get; set; }
        public int? MaxRentalUnits { get; set; }
        public bool RequiresManualApproval { get; set; }

        public static EquipmentRentalDetailsResponse FromEntity(EquipmentRentalDetails details) => new()
        {
            GpuModel = details.GpuModel,
            GpuCount = details.GpuCount,
            CpuCores = details.CpuCores,
            RamGb = details.RamGb,
            StorageGb = details.StorageGb,
            NetworkSpec = details.NetworkSpec,
            BillingUnit = details.BillingUnit,
            PricePerUnit = details.PricePerUnit,
            MinRentalUnits = details.MinRentalUnits,
            MaxRentalUnits = details.MaxRentalUnits,
            RequiresManualApproval = details.RequiresManualApproval
        };
    }
}
