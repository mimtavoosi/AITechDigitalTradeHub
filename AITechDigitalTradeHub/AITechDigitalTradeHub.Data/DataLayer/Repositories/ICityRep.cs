using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ICityRep
    {
        public Task<ListResultObject<City>> GetAllCitiesAsync(long parentId = 0, string? lang = "fa", int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");
        public Task<RowResultObject<City>> GetCityByIdAsync(long CityId, string? lang = "fa");
        public Task<BitResultObject> AddCityAsync(City City);
        public Task<BitResultObject> EditCityAsync(City City);
        public Task<BitResultObject> RemoveCityAsync(City City);
        public Task<BitResultObject> RemoveCityAsync(long CityId);
        public Task<BitResultObject> ExistCityAsync(long CityId);
    }
}
