using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IAdminReportRep
    {
        Task<ListResultObject<AdminReport>> GetAllAdminReportsAsync(long userId=0,int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");

        Task<RowResultObject<AdminReport>> GetAdminReportByIdAsync(long adminReportId);

        Task<BitResultObject> AddAdminReportAsync(AdminReport adminReport);

        Task<BitResultObject> EditAdminReportAsync(AdminReport adminReport);

        Task<BitResultObject> RemoveAdminReportAsync(AdminReport adminReport);

        Task<BitResultObject> RemoveAdminReportAsync(long adminReportId);

        Task<BitResultObject> ExistAdminReportAsync(long adminReportId);
    }
}