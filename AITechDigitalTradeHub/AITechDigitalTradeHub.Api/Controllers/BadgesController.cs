using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Reviews;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BadgesController : ControllerBase
    {
        private readonly IBadgeRep _badgeRep;

        public BadgesController(IBadgeRep badgeRep)
        {
            _badgeRep = badgeRep;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var result = await _badgeRep.GetAllBadgesAsync();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("targets/{targetType}/{targetId:long}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetForTarget(BadgeTargetType targetType, long targetId)
        {
            var result = await _badgeRep.GetAssignmentsForTargetAsync(targetType, targetId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        public async Task<IActionResult> Create([FromBody] CreateBadgeRequest request)
        {
            var result = await _badgeRep.CreateBadgeAsync(request.ToEntity());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("assignments")]
        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        public async Task<IActionResult> GetAllAssignments([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _badgeRep.GetAllAssignmentsAsync(pageIndex, pageSize);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("assignments")]
        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        public async Task<IActionResult> Assign([FromBody] AssignBadgeRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var assignment = request.ToEntity(userId);
            var result = await _badgeRep.AssignBadgeAsync(assignment);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("assignments/{id:long}/revoke")]
        [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
        public async Task<IActionResult> Revoke(long id)
        {
            var result = await _badgeRep.RevokeBadgeAsync(id);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
