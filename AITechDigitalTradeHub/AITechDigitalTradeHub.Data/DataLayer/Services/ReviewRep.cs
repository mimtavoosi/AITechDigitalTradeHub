using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class ReviewRep : IReviewRep
    {
        private readonly TheAppContext _context;

        public ReviewRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<ListResultObject<Review>> GetTargetReviewsAsync(ReviewTargetType targetType, long targetId, int pageIndex = 1, int pageSize = 20)
        {
            var result = new ListResultObject<Review>();
            try
            {
                var query = _context.Reviews
                    .AsNoTracking()
                    .Include(x => x.ReviewerUser)
                    .Where(x => x.TargetType == targetType && x.TargetId == targetId && x.DeleteDate == null);

                result.TotalCount = await query.CountAsync();
                result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
                result.Results = await query
                    .OrderByDescending(x => x.CreateDate)
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

        public async Task<ListResultObject<Review>> GetUserReviewsAsync(long reviewerUserId, int pageIndex = 1, int pageSize = 20)
        {
            var result = new ListResultObject<Review>();
            try
            {
                var query = _context.Reviews
                    .AsNoTracking()
                    .Where(x => x.ReviewerUserId == reviewerUserId && x.DeleteDate == null);

                result.TotalCount = await query.CountAsync();
                result.PageCount = DbTools.GetPageCount(result.TotalCount, pageSize);
                result.Results = await query
                    .OrderByDescending(x => x.CreateDate)
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

        public async Task<RowResultObject<RatingAggregate>> GetAggregateAsync(ReviewTargetType targetType, long targetId)
        {
            var result = new RowResultObject<RatingAggregate>();
            try
            {
                result.Result = await _context.RatingAggregates
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.TargetType == targetType && x.TargetId == targetId && x.DeleteDate == null);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        public async Task<BitResultObject> CreateReviewAsync(Review review)
        {
            var result = new BitResultObject();
            try
            {
                if (review.Rating < 1 || review.Rating > 5)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "Rating must be between 1 and 5." };
                }

                var validation = await ValidateReviewContextAsync(review);
                if (!validation.Status)
                {
                    return validation;
                }

                var alreadyReviewed = await _context.Reviews.AnyAsync(x =>
                    x.ReviewerUserId == review.ReviewerUserId &&
                    x.ContextType == review.ContextType &&
                    x.ContextId == review.ContextId &&
                    x.TargetType == review.TargetType &&
                    x.TargetId == review.TargetId &&
                    x.DeleteDate == null);

                if (alreadyReviewed)
                {
                    return new BitResultObject { Status = false, ErrorMessage = "This context has already been reviewed by the current user." };
                }

                review.CreateDate = DateTime.Now;
                review.UpdateDate = DateTime.Now;
                review.CreatorId = review.ReviewerUserId;

                await _context.Reviews.AddAsync(review);
                await _context.SaveChangesAsync();
                await RecalculateAggregateAsync(review.TargetType, review.TargetId);

                result.ID = review.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }

            return result;
        }

        private async Task<BitResultObject> ValidateReviewContextAsync(Review review)
        {
            if (review.ContextType != ReviewContextType.Order)
            {
                return new BitResultObject { Status = false, ErrorMessage = "Only order reviews are supported at this stage." };
            }

            var order = await _context.Orders
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == review.ContextId && x.DeleteDate == null);

            if (order == null || order.Status != OrderStatus.Completed)
            {
                return new BitResultObject { Status = false, ErrorMessage = "The order must be completed before review." };
            }

            var isBuyer = order.BuyerUserId == review.ReviewerUserId;
            var isSeller = order.SellerUserId == review.ReviewerUserId;
            if (!isBuyer && !isSeller)
            {
                return new BitResultObject { Status = false, ErrorMessage = "Only order participants can submit a review." };
            }

            var targetIsValid =
                review.TargetType == ReviewTargetType.Listing && review.TargetId == order.ListingId ||
                review.TargetType == ReviewTargetType.User && (review.TargetId == order.BuyerUserId || review.TargetId == order.SellerUserId);

            if (!targetIsValid || review.TargetId == review.ReviewerUserId && review.TargetType == ReviewTargetType.User)
            {
                return new BitResultObject { Status = false, ErrorMessage = "Invalid review target for this order." };
            }

            return new BitResultObject();
        }

        private async Task RecalculateAggregateAsync(ReviewTargetType targetType, long targetId)
        {
            var stats = await _context.Reviews
                .Where(x => x.TargetType == targetType && x.TargetId == targetId && x.DeleteDate == null)
                .GroupBy(x => new { x.TargetType, x.TargetId })
                .Select(g => new { Avg = g.Average(x => (decimal)x.Rating), Count = g.Count() })
                .SingleAsync();

            var aggregate = await _context.RatingAggregates
                .SingleOrDefaultAsync(x => x.TargetType == targetType && x.TargetId == targetId);

            if (aggregate == null)
            {
                aggregate = new RatingAggregate
                {
                    TargetType = targetType,
                    TargetId = targetId,
                    CreateDate = DateTime.Now
                };
                await _context.RatingAggregates.AddAsync(aggregate);
            }

            aggregate.AvgRating = stats.Avg;
            aggregate.Count = stats.Count;
            aggregate.UpdateDate = DateTime.Now;
            await _context.SaveChangesAsync();
        }
    }
}
