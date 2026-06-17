using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IReviewRep
    {
        Task<ListResultObject<Review>> GetTargetReviewsAsync(ReviewTargetType targetType, long targetId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<Review>> GetUserReviewsAsync(long reviewerUserId, int pageIndex = 1, int pageSize = 20);
        Task<RowResultObject<RatingAggregate>> GetAggregateAsync(ReviewTargetType targetType, long targetId);
        Task<BitResultObject> CreateReviewAsync(Review review);
    }
}
