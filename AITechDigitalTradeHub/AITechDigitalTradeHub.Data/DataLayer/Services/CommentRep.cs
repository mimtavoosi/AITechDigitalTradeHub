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
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using static System.Net.Mime.MediaTypeNames;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class CommentRep : ICommentRep
    {
        private TheAppContext _context;

        public CommentRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddCommentAsync(Comment Comment)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Comments.AddAsync(Comment);
                await _context.SaveChangesAsync();
                result.ID = Comment.ID;
                _context.Entry(Comment).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditCommentAsync(Comment Comment)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Comments.Update(Comment);
                await _context.SaveChangesAsync();
                result.ID = Comment.ID;
                _context.Entry(Comment).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistCommentAsync(long CommentId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.Comments
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == CommentId);
                result.ID = CommentId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Comment>> GetAllCommentsAsync(
      string entityType = "", long ForeignKeyId = 0, long ParentId = 0, long creatorId = 0,
      int pageIndex = 1, int pageSize = 20,
      string searchText = "", string sortQuery = "")
        {
            ListResultObject<Comment> results = new ListResultObject<Comment>();

            try
            {
                var query = _context.Comments.AsNoTracking().AsQueryable();

                // شرط‌های دینامیک فقط در صورت معتبر بودن
                if (ForeignKeyId > 0)
                    query = query.Where(x => x.ForeignKeyId == ForeignKeyId);

                if (creatorId > 0)
                    query = query.Where(x => x.CreatorId == creatorId);

                if (ParentId > 0)
                    query = query.Where(x => x.ParentId == ParentId);

                if (!string.IsNullOrEmpty(entityType))
                    query = query.Where(x => x.EntityType == entityType);

                if (!string.IsNullOrEmpty(searchText))
                {
                    query = query.Where(x =>
                        (!string.IsNullOrEmpty(x.Title) && x.Title.Contains(searchText)) ||
                        (!string.IsNullOrEmpty(x.Description) && x.Description.Contains(searchText))
                    );
                }

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);

                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .SortBy(sortQuery)
                    .ToPaging(pageIndex, pageSize)
                    //.Include(x => x.Assignment) // در صورت نیاز بازکنید
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return results;
        }


      

        public async Task<RowResultObject<Comment>> GetCommentByIdAsync(long CommentId)
        {
            RowResultObject<Comment> result = new RowResultObject<Comment>();
            try
            {
                result.Result = await _context.Comments
                    .AsNoTracking()
                    //.Include(x => x.Assignment)
                    .SingleOrDefaultAsync(x => x.ID == CommentId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }


        public async Task<BitResultObject> RemoveCommentAsync(Comment Comment)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.Comments.Remove(Comment);
                await _context.SaveChangesAsync();
                result.ID = Comment.ID;
                _context.Entry(Comment).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveCommentAsync(long CommentId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var Comment = await GetCommentByIdAsync(CommentId);
                result = await RemoveCommentAsync(Comment.Result);
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