using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.CustomResponses;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ISettingRep
    {
        Task<SettingListCustomResponse<Setting>> GetAllSettingsAsync(long ParentId = 0,string key="", int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "");

        Task<SettingRowCustomResponse<Setting>> GetSettingRowAsync(long settingId=0,string settingKey="");

        Task<BitResultObject> AddSettingAsync(Setting setting);

        Task<BitResultObject> EditSettingAsync(Setting setting);

        Task<BitResultObject> RemoveSettingAsync(Setting setting);

        Task<BitResultObject> RemoveSettingAsync(long settingId);

        Task<BitResultObject> ExistSettingRowAsync(long settingId = 0, string settingKey = "");
    }
}