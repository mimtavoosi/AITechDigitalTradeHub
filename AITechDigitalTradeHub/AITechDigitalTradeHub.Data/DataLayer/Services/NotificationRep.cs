using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class NotificationRep : INotificationRep
    {
        private readonly TheAppContext _context;

        public NotificationRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<ListResultObject<Notification>> GetAllNotificationsAsync(long userId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "")
        {
            var result = new ListResultObject<Notification>();
            try
            {
                var query = _context.Notifications
                    .AsNoTracking()
                    .Where(x => x.DeleteDate == null);

                if (userId > 0)
                {
                    query = query.Where(x => x.UserId == userId);
                }

                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(x => x.Message.Contains(searchText));
                }

                result.TotalCount = await query.CountAsync();
                result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
                result.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .SortBy(sortQuery)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<RowResultObject<Notification>> GetNotificationByIdAsync(long notificationId)
        {
            var result = new RowResultObject<Notification>();
            try
            {
                result.Result = await _context.Notifications
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.ID == notificationId && x.DeleteDate == null);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> AddNotificationAsync(Notification notification)
        {
            var result = new BitResultObject();
            try
            {
                notification.CreateDate ??= DateTime.Now;
                notification.UpdateDate = DateTime.Now;
                await _context.Notifications.AddAsync(notification);
                await _context.SaveChangesAsync();
                result.ID = notification.ID;
                _context.Entry(notification).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> EditNotificationAsync(Notification notification)
        {
            var result = new BitResultObject();
            try
            {
                notification.UpdateDate = DateTime.Now;
                _context.Notifications.Update(notification);
                await _context.SaveChangesAsync();
                result.ID = notification.ID;
                _context.Entry(notification).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> RemoveNotificationAsync(Notification notification)
        {
            notification.DeleteDate = DateTime.Now;
            notification.IsActive = false;
            return await EditNotificationAsync(notification);
        }

        public async Task<BitResultObject> RemoveNotificationAsync(long notificationId)
        {
            var notification = await GetNotificationByIdAsync(notificationId);
            if (!notification.Status || notification.Result == null)
            {
                return new BitResultObject { Status = false, ID = notificationId, ErrorMessage = "Notification not found." };
            }

            return await RemoveNotificationAsync(notification.Result);
        }

        public async Task<BitResultObject> ExistNotificationAsync(long notificationId)
        {
            var result = new BitResultObject { ID = notificationId };
            try
            {
                result.Status = await _context.Notifications
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == notificationId && x.DeleteDate == null);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> MarkAllAsReadAsync(long userId)
        {
            var result = new BitResultObject();
            try
            {
                var notifications = await _context.Notifications
                    .Where(x => x.UserId == userId && !x.IsRead && x.DeleteDate == null)
                    .ToListAsync();

                foreach (var notification in notifications)
                {
                    notification.IsRead = true;
                    notification.UpdateDate = DateTime.Now;
                }

                await _context.SaveChangesAsync();
                result.ID = userId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<int> CountUnreadAsync(long userId)
        {
            return await _context.Notifications
                .AsNoTracking()
                .CountAsync(x => x.UserId == userId && !x.IsRead && x.DeleteDate == null);
        }
    }
}
