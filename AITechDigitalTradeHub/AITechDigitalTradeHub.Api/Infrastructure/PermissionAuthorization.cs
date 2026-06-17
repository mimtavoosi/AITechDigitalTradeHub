using System.Security.Claims;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace AITechDigitalTradeHub.Api.Infrastructure
{
    public static class PermissionPolicyNames
    {
        public const string Prefix = "Permission:";

        public static string For(string permissionKey)
        {
            return $"{Prefix}{permissionKey}";
        }
    }

    public class PermissionRequirement : IAuthorizationRequirement
    {
        public PermissionRequirement(string permissionKey)
        {
            PermissionKey = permissionKey;
        }

        public string PermissionKey { get; }
    }

    public class PermissionAuthorizationPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionAuthorizationPolicyProvider(IOptions<AuthorizationOptions> options)
            : base(options)
        {
        }

        public override async Task<AuthorizationPolicy?> GetPolicyAsync(string policyName)
        {
            if (!policyName.StartsWith(PermissionPolicyNames.Prefix, StringComparison.OrdinalIgnoreCase))
            {
                return await base.GetPolicyAsync(policyName);
            }

            var permissionKey = policyName[PermissionPolicyNames.Prefix.Length..];
            return new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .AddRequirements(new PermissionRequirement(permissionKey))
                .Build();
        }
    }

    public class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly TheAppContext _context;

        public PermissionAuthorizationHandler(TheAppContext context)
        {
            _context = context;
        }

        protected override async Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PermissionRequirement requirement)
        {
            if (context.User.IsInRole(RoleNames.SuperAdmin))
            {
                context.Succeed(requirement);
                return;
            }

            var userIdValue = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!long.TryParse(userIdValue, out var userId))
            {
                return;
            }

            var roleIds = context.User.FindAll("roleId")
                .Select(x => long.TryParse(x.Value, out var roleId) ? roleId : 0)
                .Where(x => x > 0)
                .Distinct()
                .ToList();

            if (roleIds.Count == 0)
            {
                roleIds = await _context.UserRoles
                    .AsNoTracking()
                    .Where(x => x.UserId == userId && x.Status == UserRoleAssignmentStatus.Approved && x.IsActive)
                    .Select(x => x.RoleId)
                    .ToListAsync();
            }

            var hasDirectGrant = await _context.UserPermissions
                .AsNoTracking()
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.IsGranted &&
                    x.IsActive &&
                    x.Permission.Key == requirement.PermissionKey &&
                    x.Permission.IsActive);

            if (hasDirectGrant)
            {
                context.Succeed(requirement);
                return;
            }

            var hasRoleGrant = await _context.PermissionRoles
                .AsNoTracking()
                .AnyAsync(x =>
                    roleIds.Contains(x.RoleId) &&
                    x.IsActive &&
                    x.Permission.Key == requirement.PermissionKey &&
                    x.Permission.IsActive);

            if (hasRoleGrant)
            {
                context.Succeed(requirement);
            }
        }
    }
}
