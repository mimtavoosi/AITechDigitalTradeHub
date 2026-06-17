using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRep _categoryRep;

        public CategoriesController(ICategoryRep categoryRep)
        {
            _categoryRep = categoryRep;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 100,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _categoryRep.GetAllCategoriesAsync(pageIndex, pageSize, searchText, sortQuery);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(long id)
        {
            var result = await _categoryRep.GetCategoryByIdAsync(id);
            return result.Status && result.Result != null ? Ok(result) : NotFound(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category category)
        {
            var result = await _categoryRep.AddCategoryAsync(category);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] Category category)
        {
            category.ID = id;
            var result = await _categoryRep.EditCategoryAsync(category);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var result = await _categoryRep.RemoveCategoryAsync(id);
            return result.Status ? Ok(result) : BadRequest(result);
        }
    }
}
