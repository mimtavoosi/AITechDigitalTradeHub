using System.Security.Claims;
using System.Text.Json;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Users;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserManagementController : ControllerBase
    {
        private static readonly HashSet<string> RequestableRoles = new(StringComparer.OrdinalIgnoreCase)
        {
            RoleNames.Instructor,
            RoleNames.ServiceProvider,
            RoleNames.Fundraiser,
            RoleNames.Arbitrator,
            RoleNames.OrganizationAdmin
        };

        private static readonly HashSet<string> PanelKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "dashboard",
            "admin",
            "company"
        };

        private static readonly HashSet<string> ThemeKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "default",
            "violet",
            "teal",
            "slate",
            "emerald",
            "cyan",
            "blue",
            "rose",
            "amber",
            "indigo"
        };

        private static readonly HashSet<string> DensityKeys = new(StringComparer.OrdinalIgnoreCase)
        {
            "comfortable",
            "compact"
        };

        private static readonly HashSet<string> FontScales = new(StringComparer.OrdinalIgnoreCase)
        {
            "small",
            "normal",
            "large"
        };

        private static readonly HashSet<string> FontFamilies = new(StringComparer.OrdinalIgnoreCase)
        {
            "vazirmatn",
            "system",
            "tahoma",
            "iransans"
        };

        private static readonly HashSet<string> SidebarModes = new(StringComparer.OrdinalIgnoreCase)
        {
            "dark",
            "glass",
            "light"
        };

        private readonly TheAppContext _context;

        public UserManagementController(TheAppContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                .AsNoTracking()
                .Where(x => x.IsActive)
                .OrderBy(x => x.ID)
                .Select(x => new RoleOptionResponse { Id = x.ID, Name = x.Name, Description = x.Description })
                .ToListAsync();

            return Ok(roles);
        }

        [Authorize]
        [HttpGet("me/capabilities")]
        public async Task<IActionResult> GetMyCapabilities()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var roles = await _context.UserRoles
                .AsNoTracking()
                .Include(x => x.Role)
                .Where(x => x.UserId == userId && x.IsActive)
                .OrderBy(x => x.Role.Name)
                .ToListAsync();

            return Ok(roles.Select(UserRoleAssignmentResponse.FromEntity));
        }

        [Authorize]
        [HttpPost("me/capabilities")]
        public async Task<IActionResult> RequestCapability([FromBody] RequestUserRoleRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var roleName = request.RoleName.Trim();
            if (!RequestableRoles.Contains(roleName))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "این قابلیت از پنل کاربر قابل درخواست نیست" });
            }

            var role = await _context.Roles.SingleOrDefaultAsync(x => x.Name == roleName && x.IsActive);
            if (role == null)
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "نقش انتخاب‌شده پیدا نشد" });
            }

            var current = await _context.UserRoles.SingleOrDefaultAsync(x => x.UserId == userId && x.RoleId == role.ID);
            if (current == null)
            {
                current = new UserRole
                {
                    UserId = userId,
                    RoleId = role.ID,
                    Status = UserRoleAssignmentStatus.Pending,
                    RequestedAt = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.UserRoles.AddAsync(current);
            }
            else if (current.Status == UserRoleAssignmentStatus.Rejected || current.Status == UserRoleAssignmentStatus.Suspended || !current.IsActive)
            {
                current.Status = UserRoleAssignmentStatus.Pending;
                current.RequestedAt = DateTime.UtcNow;
                current.RejectedAt = null;
                current.AdminNote = null;
                current.IsActive = true;
                current.UpdateDate = DateTime.UtcNow;
            }
            else
            {
                return Ok(new BitResultObject { ID = current.ID });
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = current.ID });
        }

        [Authorize]
        [HttpGet("me/project-profile")]
        public async Task<IActionResult> GetMyProjectProfile()
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var profile = await BuildProjectProfileResponseAsync(userId, includeContact: true);
            return profile == null ? NotFound() : Ok(profile);
        }

        [Authorize]
        [HttpGet("me/panel-preferences/{panelKey}")]
        public async Task<IActionResult> GetPanelPreference(string panelKey)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            panelKey = NormalizePanelKey(panelKey);
            if (!PanelKeys.Contains(panelKey))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "پنل انتخاب‌شده معتبر نیست" });
            }

            var preference = await _context.UserPanelPreferences
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.UserId == userId && x.PanelKey == panelKey);

            return Ok(ToPanelPreferenceResponse(panelKey, preference));
        }

        [Authorize]
        [HttpPut("me/panel-preferences/{panelKey}")]
        public async Task<IActionResult> UpdatePanelPreference(string panelKey, [FromBody] PanelPreferenceRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            panelKey = NormalizePanelKey(panelKey);
            if (!PanelKeys.Contains(panelKey))
            {
                return BadRequest(new BitResultObject { Status = false, ErrorMessage = "پنل انتخاب‌شده معتبر نیست" });
            }

            var themeKey = ThemeKeys.Contains(request.ThemeKey) ? request.ThemeKey.ToLowerInvariant() : "default";
            var densityKey = DensityKeys.Contains(request.DensityKey) ? request.DensityKey.ToLowerInvariant() : "comfortable";
            var fontScale = FontScales.Contains(request.FontScale) ? request.FontScale.ToLowerInvariant() : "normal";
            var fontFamily = FontFamilies.Contains(request.FontFamily) ? request.FontFamily.ToLowerInvariant() : "vazirmatn";
            var sidebarMode = SidebarModes.Contains(request.SidebarMode) ? request.SidebarMode.ToLowerInvariant() : "dark";
            var cardOrder = SanitizePreferenceIds(request.CardOrder);
            var hiddenItems = SanitizePreferenceIds(request.HiddenItems);

            var preference = await _context.UserPanelPreferences
                .SingleOrDefaultAsync(x => x.UserId == userId && x.PanelKey == panelKey);

            if (preference == null)
            {
                preference = new UserPanelPreference
                {
                    UserId = userId,
                    PanelKey = panelKey,
                    CreatorId = userId,
                    CreateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.UserPanelPreferences.AddAsync(preference);
            }

            preference.ThemeKey = themeKey;
            preference.DensityKey = densityKey;
            preference.FontScale = fontScale;
            preference.FontFamily = fontFamily;
            preference.SidebarMode = sidebarMode;
            preference.CardOrderJson = JsonSerializer.Serialize(cardOrder);
            preference.HiddenItemsJson = JsonSerializer.Serialize(hiddenItems);
            preference.UpdateDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(ToPanelPreferenceResponse(panelKey, preference));
        }

        [Authorize]
        [HttpPut("me/project-profile")]
        public async Task<IActionResult> UpdateMyProjectProfile([FromBody] UpdateProjectProfileRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var requestedIds = request.SkillTagIds
                .Where(id => id > 0)
                .Distinct()
                .ToList();

            var validIds = requestedIds.Count == 0
                ? new List<long>()
                : await _context.Tags
                    .AsNoTracking()
                    .Where(x => requestedIds.Contains(x.ID) && x.IsActive && x.DeleteDate == null)
                    .Select(x => x.ID)
                    .ToListAsync();

            var existingSkills = await _context.UserSkills.Where(x => x.UserId == userId).ToListAsync();
            _context.UserSkills.RemoveRange(existingSkills);

            if (validIds.Count > 0)
            {
                await _context.UserSkills.AddRangeAsync(validIds.Select(tagId => new UserSkill
                {
                    UserId = userId,
                    TagId = tagId,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true,
                    CreatorId = userId
                }));
            }

            if (request.ResumeFileUploadId.HasValue)
            {
                var resume = await _context.FileUploads.SingleOrDefaultAsync(x => x.ID == request.ResumeFileUploadId.Value && x.CreatorId == userId);
                if (resume == null)
                {
                    return BadRequest(new BitResultObject { Status = false, ErrorMessage = "فایل رزومه پیدا نشد یا متعلق به شما نیست" });
                }

                resume.EntityType = "UserResume";
                resume.ForeignKeyId = userId;
                resume.Tag = "رزومه کاربر";
                resume.UpdateDate = DateTime.UtcNow;
            }

            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == userId);
            if (user != null)
            {
                user.ResumeHeadline = string.IsNullOrWhiteSpace(request.ResumeHeadline) ? null : request.ResumeHeadline.Trim();
                user.ResumeSummary = string.IsNullOrWhiteSpace(request.ResumeSummary) ? null : request.ResumeSummary.Trim();
                user.ResumeExperience = string.IsNullOrWhiteSpace(request.ResumeExperience) ? null : request.ResumeExperience.Trim();
                user.ResumeEducation = string.IsNullOrWhiteSpace(request.ResumeEducation) ? null : request.ResumeEducation.Trim();
                user.UpdateDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = userId });
        }

        [Authorize]
        [HttpGet("project-profiles/{id:long}")]
        public async Task<IActionResult> GetProjectProfile(long id)
        {
            var profile = await BuildProjectProfileResponseAsync(id, includeContact: true);
            return profile == null ? NotFound() : Ok(profile);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] long roleId = 0,
            [FromQuery] UserStatus? status = null,
            [FromQuery] bool? isVerified = null,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "")
        {
            var query = _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .Where(x =>
                    (status == null || x.Status == status) &&
                    (isVerified == null || x.IsVerified == isVerified) &&
                    (roleId <= 0 || x.UserRoles.Any(ur => ur.RoleId == roleId && ur.IsActive)) &&
                    (string.IsNullOrEmpty(searchText) ||
                     x.FirstName.Contains(searchText) ||
                     x.LastName.Contains(searchText) ||
                     x.Email.Contains(searchText) ||
                     x.Username.Contains(searchText)));

            var result = new ListResultObject<AdminUserListItemResponse>
            {
                TotalCount = await query.CountAsync()
            };
            result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
            var users = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();
            result.Results = users.Select(AdminUserListItemResponse.FromEntity).ToList();

            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin/{id:long}")]
        public async Task<IActionResult> GetUser(long id)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .Include(x => x.UserRoles)
                    .ThenInclude(x => x.Role)
                .SingleOrDefaultAsync(x => x.ID == id);

            return user == null ? NotFound() : Ok(AdminUserListItemResponse.FromEntity(user));
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpGet("admin/capability-requests")]
        public async Task<IActionResult> GetCapabilityRequests([FromQuery] UserRoleAssignmentStatus? status = null)
        {
            var query = _context.UserRoles
                .AsNoTracking()
                .Include(x => x.User)
                .Include(x => x.Role)
                .Where(x => x.IsActive && (status == null || x.Status == status));

            var items = await query.OrderByDescending(x => x.RequestedAt).ToListAsync();
            return Ok(items.Select(UserRoleAssignmentResponse.FromEntity));
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/capability-requests/{id:long}")]
        public async Task<IActionResult> UpdateCapabilityRequest(long id, [FromBody] UpdateUserRoleStatusRequest request)
        {
            var adminUserId = GetCurrentUserId();
            var assignment = await _context.UserRoles.SingleOrDefaultAsync(x => x.ID == id);
            if (assignment == null)
            {
                return NotFound();
            }

            assignment.Status = request.Status;
            assignment.AdminNote = request.AdminNote;
            assignment.UpdateDate = DateTime.UtcNow;
            assignment.IsActive = request.Status != UserRoleAssignmentStatus.Suspended;

            if (request.Status == UserRoleAssignmentStatus.Approved)
            {
                assignment.ApprovedAt = DateTime.UtcNow;
                assignment.ApprovedByUserId = adminUserId > 0 ? adminUserId : null;
                assignment.RejectedAt = null;
            }
            else if (request.Status == UserRoleAssignmentStatus.Rejected)
            {
                assignment.RejectedAt = DateTime.UtcNow;
            }

            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == assignment.UserId);
            if (user != null)
            {
                user.PermissionsVersion++;
                user.UpdateDate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = assignment.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/{id:long}/status")]
        public async Task<IActionResult> UpdateUserStatus(long id, [FromBody] UpdateUserStatusRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == id);
            if (user == null)
            {
                return NotFound();
            }

            user.Status = request.Status;
            user.IsActive = request.IsActive;
            user.PermissionsVersion++;
            user.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = user.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.ManageUsers)]
        [HttpPatch("admin/{id:long}/verification")]
        public async Task<IActionResult> UpdateUserVerification(long id, [FromBody] UpdateUserVerificationRequest request)
        {
            var user = await _context.Users.SingleOrDefaultAsync(x => x.ID == id);
            if (user == null)
            {
                return NotFound();
            }

            user.IsVerified = request.IsVerified;
            user.VerificationLevel = request.VerificationLevel;
            user.UpdateDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new BitResultObject { ID = user.ID });
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }

        private static string NormalizePanelKey(string value)
        {
            return string.IsNullOrWhiteSpace(value) ? "" : value.Trim().ToLowerInvariant();
        }

        private static PanelPreferenceResponse ToPanelPreferenceResponse(string panelKey, UserPanelPreference? preference)
        {
            return new PanelPreferenceResponse
            {
                PanelKey = panelKey,
                ThemeKey = preference?.ThemeKey ?? "default",
                DensityKey = preference?.DensityKey ?? "comfortable",
                FontScale = preference?.FontScale ?? "normal",
                FontFamily = preference?.FontFamily ?? "vazirmatn",
                SidebarMode = preference?.SidebarMode ?? "dark",
                CardOrder = ParsePreferenceIds(preference?.CardOrderJson),
                HiddenItems = ParsePreferenceIds(preference?.HiddenItemsJson),
                UpdateDate = preference?.UpdateDate
            };
        }

        private static List<string> ParsePreferenceIds(string? json)
        {
            if (string.IsNullOrWhiteSpace(json))
            {
                return new List<string>();
            }

            try
            {
                return JsonSerializer.Deserialize<List<string>>(json) ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        private static List<string> SanitizePreferenceIds(IEnumerable<string> values)
        {
            return values
                .Where(x => !string.IsNullOrWhiteSpace(x))
                .Select(x => x.Trim())
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(80)
                .ToList();
        }

        private async Task<UserProjectProfileResponse?> BuildProjectProfileResponseAsync(long userId, bool includeContact)
        {
            var user = await _context.Users
                .AsNoTracking()
                .Include(x => x.LoginMethods)
                .SingleOrDefaultAsync(x => x.ID == userId);

            if (user == null)
            {
                return null;
            }

            var skills = await _context.UserSkills
                .AsNoTracking()
                .Include(x => x.Tag)
                .Where(x => x.UserId == userId && x.IsActive && x.Tag.IsActive && x.Tag.DeleteDate == null)
                .OrderBy(x => x.Tag.Name)
                .Select(x => new UserProjectSkillResponse
                {
                    Id = x.TagId,
                    Name = x.Tag.Name,
                    Slug = x.Tag.Slug
                })
                .ToListAsync();

            var resume = await _context.FileUploads
                .AsNoTracking()
                .Where(x => x.EntityType == "UserResume" && x.ForeignKeyId == userId && x.IsActive && x.DeleteDate == null)
                .OrderByDescending(x => x.CreateDate)
                .FirstOrDefaultAsync();

            var completedProjectsCount = await _context.Contracts
                .AsNoTracking()
                .CountAsync(x => x.ContractorUserId == userId && x.Status == ContractStatus.Completed);

            var portfolioItems = await _context.PortfolioItems
                .AsNoTracking()
                .Where(x => x.OwnerType == PortfolioOwnerType.User && x.OwnerId == userId && x.IsPublic && x.IsActive && x.DeleteDate == null)
                .OrderByDescending(x => x.CreateDate)
                .Take(8)
                .Select(x => new UserPortfolioItemResponse
                {
                    Id = x.ID,
                    Title = x.Title,
                    Description = x.Description,
                    ExternalUrl = x.ExternalUrl
                })
                .ToListAsync();

            return new UserProjectProfileResponse
            {
                UserId = user.ID,
                DisplayName = $"{user.FirstName} {user.LastName}".Trim(),
                Email = includeContact ? user.Email : null,
                MobileNumber = includeContact
                    ? user.LoginMethods?
                        .Where(x => x.Method == "SMS" && x.MobileNumber != null)
                        .OrderByDescending(x => x.CreateDate)
                        .Select(x => x.MobileNumber)
                        .FirstOrDefault()
                    : null,
                IsVerified = user.IsVerified,
                VerificationLevel = user.VerificationLevel,
                TrustScore = user.TrustScore,
                CompletedProjectsCount = completedProjectsCount,
                Skills = skills,
                ResumeFileUploadId = resume?.ID,
                ResumeFileName = resume?.FileName,
                ResumeFileUrl = resume?.GetUrl ?? resume?.FilePath,
                ResumeHeadline = user.ResumeHeadline,
                ResumeSummary = user.ResumeSummary,
                ResumeExperience = user.ResumeExperience,
                ResumeEducation = user.ResumeEducation,
                PortfolioItems = portfolioItems
            };
        }
    }
}
