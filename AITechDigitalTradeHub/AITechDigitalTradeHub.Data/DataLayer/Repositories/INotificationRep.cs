using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface INotificationRep
    {
        Task<ListResultObject<Notification>> GetAllNotificationsAsync(long userId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");

        Task<RowResultObject<Notification>> GetNotificationByIdAsync(long notificationId);

        Task<BitResultObject> AddNotificationAsync(Notification notification);

        Task<BitResultObject> EditNotificationAsync(Notification notification);

        Task<BitResultObject> RemoveNotificationAsync(Notification notification);

        Task<BitResultObject> RemoveNotificationAsync(long notificationId);

        Task<BitResultObject> ExistNotificationAsync(long notificationId);
    }
}