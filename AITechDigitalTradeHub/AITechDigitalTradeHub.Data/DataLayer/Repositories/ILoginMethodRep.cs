using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ILoginMethodRep
    {
        Task<ListResultObject<LoginMethod>> GetAllLoginMethodsAsync(long userId=0,int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");

        Task<RowResultObject<LoginMethod>> GetLoginMethodByIdAsync(long loginMethodId);

        Task<BitResultObject> AddLoginMethodAsync(LoginMethod loginMethod);

        Task<BitResultObject> EditLoginMethodAsync(LoginMethod loginMethod);

        Task<BitResultObject> RemoveLoginMethodAsync(LoginMethod loginMethod);

        Task<BitResultObject> RemoveLoginMethodAsync(long loginMethodId);

        Task<BitResultObject> ExistLoginMethodAsync(long loginMethodId);
    }
}