using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IListingRep
    {
        Task<ListResultObject<Listing>> GetAllListingsAsync(
            ListingType? listingType = null,
            ListingStatus? status = null,
            long categoryId = 0,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "");

        Task<RowResultObject<Listing>> GetListingByIdAsync(long listingId);
        Task<ListResultObject<Listing>> GetUserListingsAsync(long ownerUserId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddListingAsync(Listing listing);
        Task<BitResultObject> EditListingAsync(Listing listing, long ownerUserId);
        Task<BitResultObject> PublishListingAsync(long listingId, long ownerUserId);
        Task<BitResultObject> RemoveListingAsync(long listingId, long ownerUserId);
        Task<BitResultObject> ExistListingAsync(long listingId);
    }
}
