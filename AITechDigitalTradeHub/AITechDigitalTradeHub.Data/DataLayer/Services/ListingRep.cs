using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class ListingRep : IListingRep
    {
        private readonly TheAppContext _context;

        public ListingRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddListingAsync(Listing listing)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Listings.AddAsync(listing);
                await _context.SaveChangesAsync();
                result.ID = listing.ID;
                _context.Entry(listing).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditListingAsync(Listing listing, long ownerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var current = await _context.Listings.SingleOrDefaultAsync(x => x.ID == listing.ID && x.OwnerUserId == ownerUserId);
                if (current == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "آگهی پیدا نشد یا شما دسترسی ویرایش ندارید";
                    return result;
                }

                current.ListingType = listing.ListingType;
                current.Title = listing.Title;
                current.Description = listing.Description;
                current.CategoryId = listing.CategoryId;
                current.AddressId = listing.AddressId;
                current.Latitude = listing.Latitude;
                current.Longitude = listing.Longitude;
                current.PriceType = listing.PriceType;
                current.PriceAmount = listing.PriceAmount;
                current.PriceMin = listing.PriceMin;
                current.PriceMax = listing.PriceMax;
                current.Currency = listing.Currency;
                current.CoverFileId = listing.CoverFileId;
                current.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = current.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Listing>> GetUserListingsAsync(long ownerUserId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Listing> results = new ListResultObject<Listing>();
            try
            {
                var query = _context.Listings
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.ProductDetails)
                    .Include(x => x.ServiceDetails)
                    .Include(x => x.EquipmentRentalDetails)
                    .Where(x => x.OwnerUserId == ownerUserId);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> ExistListingAsync(long listingId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.Listings.AsNoTracking().AnyAsync(x => x.ID == listingId);
                result.ID = listingId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Listing>> GetAllListingsAsync(
            ListingType? listingType = null,
            ListingStatus? status = null,
            long categoryId = 0,
            decimal? minPrice = null,
            decimal? maxPrice = null,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "")
        {
            ListResultObject<Listing> results = new ListResultObject<Listing>();
            try
            {
                IQueryable<Listing> query = _context.Listings
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.OwnerUser)
                    .Include(x => x.ProductDetails)
                    .Include(x => x.ServiceDetails)
                    .Include(x => x.EquipmentRentalDetails)
                    .Where(x =>
                        (listingType == null || x.ListingType == listingType) &&
                        (status == null || x.Status == status) &&
                        (categoryId <= 0 || x.CategoryId == categoryId) &&
                        (minPrice == null || (x.PriceAmount ?? x.PriceMin ?? 0) >= minPrice) &&
                        (maxPrice == null || (x.PriceAmount ?? x.PriceMax ?? 0) <= maxPrice) &&
                        (string.IsNullOrEmpty(searchText) ||
                         x.Title.Contains(searchText) ||
                         (x.Description != null && x.Description.Contains(searchText))));

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.PublishedAt ?? x.CreateDate)
                    .SortBy(sortQuery)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<Listing>> GetListingByIdAsync(long listingId)
        {
            RowResultObject<Listing> result = new RowResultObject<Listing>();
            try
            {
                result.Result = await _context.Listings
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.OwnerUser)
                    .Include(x => x.ProductDetails)
                    .Include(x => x.ServiceDetails)
                        .ThenInclude(x => x!.Packages)
                    .Include(x => x.EquipmentRentalDetails)
                    .Include(x => x.ListingTags)
                        .ThenInclude(x => x.Tag)
                    .SingleOrDefaultAsync(x => x.ID == listingId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> PublishListingAsync(long listingId, long ownerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var listing = await _context.Listings.SingleOrDefaultAsync(x => x.ID == listingId && x.OwnerUserId == ownerUserId);
                if (listing == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "آگهی پیدا نشد یا شما دسترسی انتشار ندارید";
                    return result;
                }

                listing.Status = ListingStatus.Published;
                listing.PublishedAt ??= DateTime.Now;
                listing.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = listing.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveListingAsync(long listingId, long ownerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var listing = await _context.Listings.SingleOrDefaultAsync(x => x.ID == listingId && x.OwnerUserId == ownerUserId);
                if (listing == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "آگهی پیدا نشد یا شما دسترسی حذف ندارید";
                    return result;
                }

                listing.DeleteDate = DateTime.Now;
                listing.IsActive = false;
                await _context.SaveChangesAsync();
                result.ID = listing.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }
    }
}
