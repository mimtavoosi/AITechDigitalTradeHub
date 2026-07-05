using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OutputCaching;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TagsController : ControllerBase
    {
        private readonly TheAppContext _context;

        public TagsController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet]
        [OutputCache(PolicyName = "PublicReference")]
        public async Task<IActionResult> GetAll(
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 100,
            [FromQuery] string searchText = "")
        {
            var query = _context.Tags
                .AsNoTracking()
                .Where(x =>
                    x.IsActive &&
                    x.DeleteDate == null &&
                    (string.IsNullOrEmpty(searchText) ||
                     x.Name.Contains(searchText) ||
                     x.Slug.Contains(searchText)));

            var result = new ListResultObject<TagResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            result.Results = await query
                .OrderBy(x => x.Name)
                .ToPaging(pageIndex, pageSize)
                .Select(x => TagResponse.FromEntity(x))
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("{id:long}")]
        [OutputCache(PolicyName = "PublicReference")]
        public async Task<IActionResult> GetById(long id)
        {
            var tag = await _context.Tags.AsNoTracking().SingleOrDefaultAsync(x => x.ID == id && x.IsActive && x.DeleteDate == null);
            var result = new RowResultObject<TagResponse>
            {
                Status = tag != null,
                Result = tag == null ? null : TagResponse.FromEntity(tag)
            };
            return result.Status ? Ok(result) : NotFound(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TagUpsertRequest request)
        {
            var result = new BitResultObject();
            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                result.Status = false;
                result.ErrorMessage = "نام مهارت الزامی است";
                return BadRequest(result);
            }

            var slug = NormalizeSlug(request.Slug, name);
            var exists = await _context.Tags.AnyAsync(x => x.DeleteDate == null && (x.Name == name || x.Slug == slug));
            if (exists)
            {
                result.Status = false;
                result.ErrorMessage = "این مهارت قبلاً ثبت شده است";
                return BadRequest(result);
            }

            var tag = new Tag
            {
                Name = name,
                Slug = slug,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                IsActive = true
            };

            await _context.Tags.AddAsync(tag);
            await _context.SaveChangesAsync();
            result.ID = tag.ID;
            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpPut("{id:long}")]
        public async Task<IActionResult> Update(long id, [FromBody] TagUpsertRequest request)
        {
            var result = new BitResultObject();
            var tag = await _context.Tags.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (tag == null)
            {
                result.Status = false;
                result.ErrorMessage = "مهارت پیدا نشد";
                return NotFound(result);
            }

            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
            {
                result.Status = false;
                result.ErrorMessage = "نام مهارت الزامی است";
                return BadRequest(result);
            }

            var slug = NormalizeSlug(request.Slug, name);
            var exists = await _context.Tags.AnyAsync(x => x.ID != id && x.DeleteDate == null && (x.Name == name || x.Slug == slug));
            if (exists)
            {
                result.Status = false;
                result.ErrorMessage = "این مهارت قبلاً ثبت شده است";
                return BadRequest(result);
            }

            tag.Name = name;
            tag.Slug = slug;
            tag.UpdateDate = DateTime.Now;
            await _context.SaveChangesAsync();
            result.ID = tag.ID;
            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageCategories)]
        [HttpDelete("{id:long}")]
        public async Task<IActionResult> Delete(long id)
        {
            var result = new BitResultObject();
            var tag = await _context.Tags.SingleOrDefaultAsync(x => x.ID == id && x.DeleteDate == null);
            if (tag == null)
            {
                result.Status = false;
                result.ErrorMessage = "مهارت پیدا نشد";
                return NotFound(result);
            }

            tag.DeleteDate = DateTime.Now;
            tag.IsActive = false;
            await _context.SaveChangesAsync();
            result.ID = tag.ID;
            return Ok(result);
        }

        private static string NormalizeSlug(string? slug, string fallback)
        {
            var value = string.IsNullOrWhiteSpace(slug) ? fallback : slug;
            return value.Trim().ToLowerInvariant().Replace(" ", "-");
        }
    }

    public class TagUpsertRequest
    {
        [Required, MaxLength(60)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(80)]
        public string? Slug { get; set; }
    }

    public class TagResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        public static TagResponse FromEntity(Tag tag)
        {
            return new TagResponse
            {
                Id = tag.ID,
                Name = tag.Name,
                Slug = tag.Slug
            };
        }
    }
}
