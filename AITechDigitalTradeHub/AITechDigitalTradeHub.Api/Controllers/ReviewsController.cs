using System.Security.Claims;
using AITechDigitalTradeHub.Api.ViewModels.Reviews;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly IReviewRep _reviewRep;

        public ReviewsController(IReviewRep reviewRep)
        {
            _reviewRep = reviewRep;
        }

        [HttpGet("targets/{targetType}/{targetId:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetTargetReviews(
            ReviewTargetType targetType,
            long targetId,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20)
        {
            var result = await _reviewRep.GetTargetReviewsAsync(targetType, targetId, pageIndex, pageSize);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("targets/{targetType}/{targetId:long}/aggregate")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAggregate(ReviewTargetType targetType, long targetId)
        {
            var result = await _reviewRep.GetAggregateAsync(targetType, targetId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("mine")]
        [Authorize]
        public async Task<IActionResult> GetMine([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _reviewRep.GetUserReviewsAsync(GetCurrentUserId(), pageIndex, pageSize);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateReviewRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var review = request.ToEntity(userId);
            var result = await _reviewRep.CreateReviewAsync(review);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
