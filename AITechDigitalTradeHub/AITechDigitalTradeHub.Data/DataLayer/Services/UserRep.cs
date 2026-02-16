using AITechDigitalTradeHub.Data.CustomResponses;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;
using MTPermissionCenter.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class UserRep : IUserRep, IUserRoleProvider
    {
        private TheAppContext _context;

        public UserRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddUserAsync(User user)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
                result.ID = user.ID;
                _context.Entry(user).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditUserAsync(User user)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Users.Update(user);
                await _context.SaveChangesAsync();
                result.ID = user.ID;
                _context.Entry(user).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistUserAsync(string fieldValue, string fieldName)
        {
            BitResultObject result = new BitResultObject();
            long userId = 0;
            try
            {
                switch (fieldName.ToLower().Trim())
                {
                    case "id":
                    default:
                        {
                            var theUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.ID == long.Parse(fieldValue)) ?? new User();
                            userId = theUser.ID;
                            break;
                        }
                    case "username":
                        {
                            var theUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Username == fieldValue) ?? new User();
                            userId = theUser.ID;
                            break;
                        }
                    case "email":
                        {
                            var theUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.Email == fieldValue) ?? new User();
                            userId = theUser.ID;
                            break;
                        }
                    case "nationalcode":
                        {
                            var theUser = await _context.Users.AsNoTracking().FirstOrDefaultAsync(x => x.NationalCode == fieldValue) ?? new User();
                            userId = theUser.ID;
                            break;
                        }
                }
                result.ID = userId;
                result.Status = userId > 0;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<RowResultObject<User>> AuthenticateAsync(string userName, string password, int loginType)
        {
            RowResultObject<User> result = new RowResultObject<User>();
            try
            {
                switch (loginType)
                {
                    default:
                    case 1:
                        {
                            result.Status = await _context.Users
               .AsNoTracking()
               .AnyAsync(x => x.Username == userName && x.PasswordHash == password.ToHash());
                            if (result.Status)
                            {
                                var loginRow = await _context.Users.Include(x=> x.Role)
                            .AsNoTracking()
                            .SingleOrDefaultAsync(x => x.Username == userName && x.PasswordHash == password.ToHash());
                                if (loginRow != null)
                                {
                                    result.Result = loginRow;
                                    result.ErrorMessage = $"احراز هویت موفق بود";
                                }
                                else
                                {
                                    result.Status = false;
                                    result.ErrorMessage = $"احراز هویت ناموفق بود";

                                }

                            }
                            else
                            {
                                result.ErrorMessage = $"احراز هویت ناموفق بود";
                            }
                        }
                        break;
                    case 2:
                        {
                            result.Status = await _context.Users
               .AsNoTracking()
               .AnyAsync(x => x.Username == userName);
                            if (result.Status)
                            {
                                var loginRow = await _context.Users.Include(x => x.Role)
               .AsNoTracking()
               .SingleOrDefaultAsync(x => x.Username == userName);
                                if (loginRow != null)
                                {
                                    result.Result = loginRow;
                                    result.ErrorMessage = $"احراز هویت موفق بود";
                                }
                                else
                                {
                                    result.Status = false;
                                    result.ErrorMessage = $"احراز هویت ناموفق بود";
                                }

                            }
                            else
                            {
                                result.ErrorMessage = $"احراز هویت ناموفق بود";
                            }
                        }
                        break;
                }

            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<UserListCustomResponse<User>> GetAllUsersAsync(long AddressId = 0, long RoleId = 0,int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "")
        {
            UserListCustomResponse<User> results = new UserListCustomResponse<User>();
            try
            {
                IQueryable<User> query;
  
                    query = _context.Users
                .AsNoTracking()
                .Where(x =>
                     ((AddressId > 0 ? x.AddressId == AddressId : true) &&
                      (RoleId > 0 ? x.RoleId == RoleId : true)) &&
                       ((!string.IsNullOrEmpty(x.FirstName) && x.FirstName.Contains(searchText)) ||
                       (!string.IsNullOrEmpty(x.LastName) && x.LastName.Contains(searchText)) ||
                       (!string.IsNullOrEmpty(x.Email) && x.Email.Contains(searchText)) ||
                       (!string.IsNullOrEmpty(x.Username) && x.Username.Contains(searchText)))
                );
             
                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate)
                     .SortBy(sortQuery).ToPaging(pageIndex, pageSize)
                    .Include(x => x.Role)
                    .Include(x => x.PaymentHistories)
                    .ToListAsync();


                // Map images for each user
                results.ResultImages = results.Results
                    .ToDictionary(
                        user => user,
                        user => _context.Images
                            .Where(img => img.ForeignKeyId == user.ID && img.EntityType == "User")
                            .ToList()
                    );
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<UserRowCustomResponse<User>> GetUserByIdAsync(long userId)
        {
            UserRowCustomResponse<User> result = new UserRowCustomResponse<User>();
            try
            {
                result.Result = await _context.Users
                    .AsNoTracking()
                    .Include(x => x.Role)
                    .Include(x => x.PaymentHistories)
                    .SingleOrDefaultAsync(x => x.ID == userId);

                // اگر کاربر وجود داشت، لیست تصاویرش را دریافت کن
                if (result.Result != null)
                {
                    result.ResultImages = new Dictionary<User, List<Image>?>
            {
                { result.Result, await _context.Images
                    .Where(img => img.ForeignKeyId == userId && img.EntityType == "User")
                    .ToListAsync() }
            };
                }
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveUserAsync(User user)
        {
            BitResultObject result = new BitResultObject();
            try
            {

                // حذف تصاویر مرتبط با کاربر
                var userImages = _context.Images.Where(img => img.ForeignKeyId == user.ID && img.EntityType == "User");
                _context.Images.RemoveRange(userImages);

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
                result.ID = user.ID;
                _context.Entry(user).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveUserAsync(long userId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var user = await GetUserByIdAsync(userId);
                result = await RemoveUserAsync(user.Result);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<long?> GetUserRoleIdAsync(long userId, CancellationToken ct = default)
        {
            return await _context.Users.AsNoTracking()
                       .Where(u => u.ID == userId)
                       .Select(u => (long?)u.RoleId)
                       .SingleOrDefaultAsync(ct);
        }
    }
}