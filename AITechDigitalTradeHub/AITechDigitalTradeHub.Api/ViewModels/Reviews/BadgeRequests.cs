using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Reviews
{
    public class CreateBadgeRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? IconName { get; set; }

        public Badge ToEntity()
        {
            return new Badge
            {
                Title = Title.Trim(),
                Code = Code.Trim(),
                Description = Description?.Trim(),
                IconName = IconName?.Trim()
            };
        }
    }

    public class AssignBadgeRequest
    {
        public long BadgeId { get; set; }
        public BadgeTargetType TargetType { get; set; }
        public long TargetId { get; set; }
        public string? Reason { get; set; }
        public DateTime? ExpiresAt { get; set; }

        public BadgeAssignment ToEntity(long assignedByUserId)
        {
            return new BadgeAssignment
            {
                BadgeId = BadgeId,
                TargetType = TargetType,
                TargetId = TargetId,
                AssignedByUserId = assignedByUserId,
                Reason = Reason?.Trim(),
                ExpiresAt = ExpiresAt
            };
        }
    }
}
