using AITechDigitalTradeHub.Data.DataLayer;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Tools
{
    public interface IPermissionInvalidationService
    {
        Task BumpUserVersionAsync(List<long> userIds, CancellationToken ct = default);
        Task BumpRoleUsersVersionAsync(List<long> roleIds, CancellationToken ct = default);
    }

    public class PermissionInvalidationService : IPermissionInvalidationService
    {
        private readonly TheAppContext _db;

        public PermissionInvalidationService(TheAppContext db) => _db = db;

        public Task BumpUserVersionAsync(List<long> userIds, CancellationToken ct = default)
            => _db.Users
                .Where(u => userIds.Contains(u.ID))
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.PermissionsVersion, u => u.PermissionsVersion + 1), ct);

        public Task BumpRoleUsersVersionAsync(List<long> roleIds, CancellationToken ct = default)
            => _db.Users
                .Where(u => roleIds.Contains(u.RoleId))
                .ExecuteUpdateAsync(s => s.SetProperty(u => u.PermissionsVersion, u => u.PermissionsVersion + 1), ct);
    }
}
