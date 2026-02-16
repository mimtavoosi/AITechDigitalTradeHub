using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IRoleRep
    {
        Task<ListResultObject<Role>> GetAllRolesAsync(int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");

        Task<RowResultObject<Role>> GetRoleByIdAsync(long roleId);

        Task<BitResultObject> AddRoleAsync(Role role);

        Task<BitResultObject> EditRoleAsync(Role role);

        Task<BitResultObject> RemoveRoleAsync(Role role);

        Task<BitResultObject> RemoveRoleAsync(long roleId);

        Task<BitResultObject> ExistRoleAsync(long roleId);
    }
}