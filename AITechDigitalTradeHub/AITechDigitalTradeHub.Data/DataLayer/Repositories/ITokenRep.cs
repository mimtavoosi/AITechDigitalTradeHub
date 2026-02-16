using AITechDigitalTradeHub.Data.ResultObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;

namespace Repositories
{
    public interface ITokenRep
    {
        public Task<ListResultObject<Token>> GetAllTokensAsync(long UserId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "");

        public Task<RowResultObject<Token>> GetTokenByIdAsync(long TokenId);

        public Task<RowResultObject<Token>> FindTokenAsync(string Token, string type, bool status = true);

        public Task<BitResultObject> AddTokenAsync(Token Token);

        public Task<BitResultObject> EditTokenAsync(Token Token);

        public Task<BitResultObject> MakeTokenExpireAsync(long TokenId);

        public Task<BitResultObject> RemoveTokenAsync(Token Token);

        public Task<BitResultObject> RemoveTokenAsync(long TokenId);

        public Task<BitResultObject> ExistTokenAsync(long TokenId);
    }
}