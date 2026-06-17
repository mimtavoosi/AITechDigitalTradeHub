using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Reviews
{
    public class CreateReviewRequest
    {
        public ReviewTargetType TargetType { get; set; }
        public long TargetId { get; set; }
        public ReviewContextType ContextType { get; set; } = ReviewContextType.Order;
        public long ContextId { get; set; }
        public byte Rating { get; set; }
        public string? Comment { get; set; }

        public Review ToEntity(long reviewerUserId)
        {
            return new Review
            {
                ReviewerUserId = reviewerUserId,
                TargetType = TargetType,
                TargetId = TargetId,
                ContextType = ContextType,
                ContextId = ContextId,
                Rating = Rating,
                Comment = Comment?.Trim()
            };
        }
    }
}
