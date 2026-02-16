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
    public class CategoryRep : ICategoryRep
    {
        private TheAppContext _context;

        public CategoryRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddCategoryAsync(Category category)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Categories.AddAsync(category);
                await _context.SaveChangesAsync();
                result.ID = category.ID;
                _context.Entry(category).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditCategoryAsync(Category category)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Categories.Update(category);
                await _context.SaveChangesAsync();
                result.ID = category.ID;
                _context.Entry(category).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistCategoryAsync(long categoryId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.Categories
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == categoryId);
                result.ID = categoryId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Category>> GetAllCategoriesAsync(int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="")
        {
            ListResultObject<Category> results = new ListResultObject<Category>();
            try
            {
                var query = _context.Categories
                    .AsNoTracking()
                    .Where(x =>
                        (!string.IsNullOrEmpty(x.CategoryName) && x.CategoryName.Contains(searchText)) ||
                        (!string.IsNullOrEmpty(x.CategoryDescription) && x.CategoryDescription.Contains(searchText))
                    );

                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate)
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

        public async Task<RowResultObject<Category>> GetCategoryByIdAsync(long categoryId)
        {
            RowResultObject<Category> result = new RowResultObject<Category>();
            try
            {
                result.Result = await _context.Categories
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.ID == categoryId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveCategoryAsync(Category category)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Categories.Remove(category);
                await _context.SaveChangesAsync();
                result.ID = category.ID;
                _context.Entry(category).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveCategoryAsync(long categoryId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var category = await GetCategoryByIdAsync(categoryId);
                result = await RemoveCategoryAsync(category.Result);
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