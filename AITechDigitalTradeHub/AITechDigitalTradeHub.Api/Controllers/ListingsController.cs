using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Marketplace;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OutputCaching;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ListingsController : ControllerBase
    {
        private readonly IListingRep _listingRep;
        private readonly TheAppContext _context;

        public ListingsController(IListingRep listingRep, TheAppContext context)
        {
            _listingRep = listingRep;
            _context = context;
        }

        [HttpGet]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetAll(
            [FromQuery] ListingType? listingType,
            [FromQuery] ListingStatus? status,
            [FromQuery] long categoryId = 0,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _listingRep.GetAllListingsAsync(
                listingType,
                status,
                categoryId,
                minPrice,
                maxPrice,
                pageIndex,
                pageSize,
                searchText,
                sortQuery);

            return result.Status ? Ok(result.Map(ListingListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize]
        [HttpGet("mine")]
        public async Task<IActionResult> GetMine([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _listingRep.GetUserListingsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(ListingListItemResponse.FromEntity)) : BadRequest(result);
        }

        [HttpGet("{id:long}")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _listingRep.GetListingByIdAsync(id);
            return result.Status && result.Result != null ? Ok(result.Map(ListingDetailResponse.FromEntity)) : NotFound(result);
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminList(
            [FromQuery] ListingType? listingType,
            [FromQuery] ListingStatus? status,
            [FromQuery] long categoryId = 0,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _listingRep.GetAllListingsAsync(
                listingType,
                status,
                categoryId,
                minPrice,
                maxPrice,
                pageIndex,
                pageSize,
                searchText,
                sortQuery);

            return result.Status ? Ok(result.Map(ListingListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateAdminStatus(long id, [FromBody] UpdateListingStatusRequest request)
        {
            var result = new BitResultObject();
            var listing = await _context.Listings.SingleOrDefaultAsync(x => x.ID == id);
            if (listing == null)
            {
                result.Status = false;
                result.ErrorMessage = "لیستینگ پیدا نشد";
                return NotFound(result);
            }

            listing.Status = request.Status;
            listing.UpdateDate = DateTime.UtcNow;
            if (request.Status == ListingStatus.Published)
            {
                listing.PublishedAt ??= DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            result.ID = listing.ID;
            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.CreateListing)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ListingUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var listing = request.ToEntity(userId);
            var result = await _listingRep.AddListingAsync(listing);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnListing)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] ListingUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var listing = request.ToEntity(userId);
            listing.ID = id;
            var result = await _listingRep.EditListingAsync(listing, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnListing)]
        [HttpPost("{id:long}/publish")]
        public async Task<IActionResult> Publish(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _listingRep.PublishListingAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageOwnListing)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _listingRep.RemoveListingAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }

    public class UpdateListingStatusRequest
    {
        public ListingStatus Status { get; set; }
        public string? Note { get; set; }
    }
}
