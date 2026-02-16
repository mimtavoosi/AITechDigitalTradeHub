using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ICommentRep
    {
        Task<ListResultObject<Comment>> GetAllCommentsAsync(string entityType = "", long ForeignKeyId = 0, long ParentId = 0, long creatorId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "");

        Task<RowResultObject<Comment>> GetCommentByIdAsync(long CommentId);

        Task<BitResultObject> AddCommentAsync(Comment Comment);
        Task<BitResultObject> EditCommentAsync(Comment Comment);

        Task<BitResultObject> RemoveCommentAsync(Comment Comment);
        Task<BitResultObject> RemoveCommentAsync(long CommentId);
        Task<BitResultObject> ExistCommentAsync(long CommentId);
    }
}