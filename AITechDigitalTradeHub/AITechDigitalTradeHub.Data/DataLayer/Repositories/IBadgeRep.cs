using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IBadgeRep
    {
        Task<ListResultObject<Badge>> GetAllBadgesAsync();
        Task<BitResultObject> CreateBadgeAsync(Badge badge);
        Task<ListResultObject<BadgeAssignment>> GetAssignmentsForTargetAsync(BadgeTargetType targetType, long targetId);
        Task<ListResultObject<BadgeAssignment>> GetAllAssignmentsAsync(int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AssignBadgeAsync(BadgeAssignment assignment);
        Task<BitResultObject> RevokeBadgeAsync(long assignmentId);
    }
}
