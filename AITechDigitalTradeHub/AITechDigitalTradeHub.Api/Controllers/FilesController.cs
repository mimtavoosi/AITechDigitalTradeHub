using AITechDigitalTradeHub.Api.ViewModels.Files;
using AITechDigitalTradeHub.Api.ViewModels.Projects;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class FilesController : ControllerBase
    {
        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "text/plain",
            "application/zip",
            "application/x-zip-compressed",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        private readonly TheAppContext _context;
        private readonly IWebHostEnvironment _environment;

        public FilesController(TheAppContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpPost]
        [RequestSizeLimit(25 * 1024 * 1024)]
        public async Task<IActionResult> Upload([FromForm] FileUploadRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var file = request.File;

            if (file == null || file.Length == 0)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "فایل معتبر نیست" });
            }

            if (file.Length > 25 * 1024 * 1024)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "حجم فایل نباید بیشتر از ۲۵ مگابایت باشد" });
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نوع فایل مجاز نیست" });
            }

            var safeEntityType = string.IsNullOrWhiteSpace(request.EntityType)
                ? "General"
                : request.EntityType.Trim();

            var uploadsRoot = Path.Combine(
                _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot"),
                "uploads",
                safeEntityType.ToLowerInvariant()
            );

            Directory.CreateDirectory(uploadsRoot);

            var extension = Path.GetExtension(file.FileName);
            var storedName = $"{DateTime.UtcNow:yyyyMMddHHmmssfff}_{Guid.NewGuid():N}{extension}";
            var physicalPath = Path.Combine(uploadsRoot, storedName);

            await using (var stream = System.IO.File.Create(physicalPath))
            {
                await file.CopyToAsync(stream);
            }

            var relativePath = $"/uploads/{safeEntityType.ToLowerInvariant()}/{storedName}";

            var fileUpload = new FileUpload
            {
                FileName = file.FileName,
                FilePath = relativePath,
                GetUrl = relativePath,
                ContentType = file.ContentType,
                Description = file.FileName,
                CreatorId = userId,
                ForeignKeyId = request.ForeignKeyId,
                EntityType = safeEntityType,
                Tag = request.Tag,
                Note = request.Note,
                CreateDate = DateTime.UtcNow,
                UpdateDate = DateTime.UtcNow,
                IsActive = true
            };

            await _context.FileUploads.AddAsync(fileUpload);
            await _context.SaveChangesAsync();

            return Ok(new RowResultObject<ProjectDocumentResponse>
            {
                Result = ProjectDocumentResponse.FromEntity(fileUpload)
            });
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
