using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Finance;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
    public class FeeRulesController : ControllerBase
    {
        private readonly IFinanceRep _financeRep;

        public FeeRulesController(IFinanceRep financeRep)
        {
            _financeRep = financeRep;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _financeRep.GetFeeRulesAsync();
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FeeRuleRequest request)
        {
            var result = await _financeRep.CreateFeeRuleAsync(request.ToEntity());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] FeeRuleRequest request)
        {
            var rule = request.ToEntity();
            rule.ID = id;
            var result = await _financeRep.UpdateFeeRuleAsync(rule);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/activate")]
        public async Task<IActionResult> Activate(long id)
        {
            var result = await _financeRep.SetFeeRuleActiveAsync(id, true);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{id:long}/deactivate")]
        public async Task<IActionResult> Deactivate(long id)
        {
            var result = await _financeRep.SetFeeRuleActiveAsync(id, false);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("calculate")]
        public async Task<IActionResult> Calculate([FromQuery] Data.Domain.PlatformFeeContextType contextType, [FromQuery] decimal amount)
        {
            var fee = await _financeRep.CalculateFeeAsync(contextType, amount);
            return Ok(new { fee, netAmount = amount - fee });
        }
    }
}
