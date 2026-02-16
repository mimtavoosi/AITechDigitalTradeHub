using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.EntityFrameworkCore;
using AITechDigitalTradeHub.Data.Tools;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class AdminReportRep : IAdminReportRep
    {
        private TheAppContext _context;

        public AdminReportRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddAdminReportAsync(AdminReport adminReport)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.AdminReports.AddAsync(adminReport);
                await _context.SaveChangesAsync();
                result.ID = adminReport.ID;
                _context.Entry(adminReport).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditAdminReportAsync(AdminReport adminReport)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.AdminReports.Update(adminReport);
                await _context.SaveChangesAsync();
                result.ID = adminReport.ID;
                _context.Entry(adminReport).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistAdminReportAsync(long adminReportId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.AdminReports
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == adminReportId);
                result.ID = adminReportId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<AdminReport>> GetAllAdminReportsAsync(long userId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="")
        {
            ListResultObject<AdminReport> results = new ListResultObject<AdminReport>();
            try
            {
                var query = _context.AdminReports.AsNoTracking();
                if(userId > 0)
                {
                    query = query.Where(x => x.AdminId == userId);
                }
                    query = query.Where(x =>
                        ((!string.IsNullOrEmpty(x.Title) && x.Title.Contains(searchText)) ||
                        (!string.IsNullOrEmpty(x.Content) && x.Content.Contains(searchText))
                    ));

                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.ReportDate)
                     .SortBy(sortQuery).ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<AdminReport>> GetAdminReportByIdAsync(long adminReportId)
        {
            RowResultObject<AdminReport> result = new RowResultObject<AdminReport>();
            try
            {
                result.Result = await _context.AdminReports
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.ID == adminReportId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveAdminReportAsync(AdminReport adminReport)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.AdminReports.Remove(adminReport);
                await _context.SaveChangesAsync();
                result.ID = adminReport.ID;
                _context.Entry(adminReport).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveAdminReportAsync(long adminReportId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var adminReport = await GetAdminReportByIdAsync(adminReportId);
                result = await RemoveAdminReportAsync(adminReport.Result);
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