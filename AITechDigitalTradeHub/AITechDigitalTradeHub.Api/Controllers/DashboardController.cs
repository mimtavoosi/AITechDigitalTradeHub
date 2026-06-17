using System.Security.Claims;
using AITechDigitalTradeHub.Api.ViewModels.Dashboard;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly TheAppContext _context;

        public DashboardController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary([FromQuery] string currency = "IRR")
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var wallet = await _context.Wallets
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.OwnerType == WalletOwnerType.User && x.OwnerUserId == userId && x.Currency == currency);

            var response = new DashboardSummaryResponse
            {
                ListingsCount = await _context.Listings.CountAsync(x => x.OwnerUserId == userId && x.DeleteDate == null),
                ProjectsCount = await _context.Projects.CountAsync(x => x.EmployerUserId == userId && x.DeleteDate == null),
                SentProposalsCount = await _context.Proposals.CountAsync(x => x.FreelancerUserId == userId && x.DeleteDate == null),
                PurchasesCount = await _context.Orders.CountAsync(x => x.BuyerUserId == userId && x.DeleteDate == null),
                SalesCount = await _context.Orders.CountAsync(x => x.SellerUserId == userId && x.DeleteDate == null),
                WalletBalance = wallet?.Balance ?? 0,
                Currency = wallet?.Currency ?? currency
            };

            return Ok(response);
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
