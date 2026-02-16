using AiTech.Domains;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class PaymentHistoryRep : IPaymentHistoryRep
    {
        private TheAppContext _context;

        public PaymentHistoryRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddPaymentHistoryAsync(PaymentHistory paymentHistory)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.PaymentHistories.AddAsync(paymentHistory);
                await _context.SaveChangesAsync();
                result.ID = paymentHistory.ID;
                _context.Entry(paymentHistory).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditPaymentHistoryAsync(PaymentHistory paymentHistory)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.PaymentHistories.Update(paymentHistory);
                await _context.SaveChangesAsync();
                result.ID = paymentHistory.ID;
                _context.Entry(paymentHistory).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistPaymentHistoryAsync(long paymentHistoryId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.PaymentHistories
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == paymentHistoryId);
                result.ID = paymentHistoryId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<PaymentHistory>> GetAllPaymentHistoriesAsync(long foreignkeyId = 0, string entityType = "", long UserId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "")
        {
            ListResultObject<PaymentHistory> results = new ListResultObject<PaymentHistory>();
            try
            {
                var query = _context.PaymentHistories.Include(x=> x.User).AsNoTracking();

                if (!string.IsNullOrEmpty(entityType))
                    query = query.Where(x => x.EntityType == entityType);

                if (foreignkeyId > 0)
                    query = query.Where(x => x.ForeignKeyId == foreignkeyId);
                if (UserId > 0)
                {
                    query = query.Where(x => x.UserId == UserId);
                }

                query = query.Where(x =>
                        (x.Amount.ToString().Contains(searchText)) ||
                       (!string.IsNullOrEmpty(x.User.FirstName) && x.User.FirstName.Contains(searchText)) ||
                       (!string.IsNullOrEmpty(x.User.LastName) && x.User.LastName.Contains(searchText))
                    );

                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.PaymentDate)
                     .SortBy(sortQuery).ToPaging(pageIndex, pageSize)
                    .Include(x => x.User)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<PaymentHistory>> GetPaymentHistoryByIdAsync(long paymentHistoryId)
        {
            RowResultObject<PaymentHistory> result = new RowResultObject<PaymentHistory>();
            try
            {
                result.Result = await _context.PaymentHistories
                    .AsNoTracking()
                    .Include(x => x.User)
                    .SingleOrDefaultAsync(x => x.ID == paymentHistoryId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemovePaymentHistoryAsync(PaymentHistory paymentHistory)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.PaymentHistories.Remove(paymentHistory);
                await _context.SaveChangesAsync();
                result.ID = paymentHistory.ID;
                _context.Entry(paymentHistory).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemovePaymentHistoryAsync(long paymentHistoryId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var paymentHistory = await GetPaymentHistoryByIdAsync(paymentHistoryId);
                result = await RemovePaymentHistoryAsync(paymentHistory.Result);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }
    }
}