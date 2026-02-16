using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ICategoryRep
    {
        Task<ListResultObject<Category>> GetAllCategoriesAsync(int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");

        Task<RowResultObject<Category>> GetCategoryByIdAsync(long categoryId);

        Task<BitResultObject> AddCategoryAsync(Category category);

        Task<BitResultObject> EditCategoryAsync(Category category);

        Task<BitResultObject> RemoveCategoryAsync(Category category);

        Task<BitResultObject> RemoveCategoryAsync(long categoryId);

        Task<BitResultObject> ExistCategoryAsync(long categoryId);
    }
}