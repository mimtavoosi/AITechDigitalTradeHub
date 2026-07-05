using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IProjectRep
    {
        Task<ListResultObject<Project>> GetAllProjectsAsync(
            ProjectStatus? status = null,
            long categoryId = 0,
            decimal? minBudget = null,
            decimal? maxBudget = null,
            long skillTagId = 0,
            ProjectType? projectType = null,
            LocationMode? locationMode = null,
            DateTime? deadlineFrom = null,
            DateTime? deadlineTo = null,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "");

        Task<RowResultObject<Project>> GetProjectByIdAsync(long projectId);
        Task<ListResultObject<Project>> GetUserProjectsAsync(long employerUserId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<Proposal>> GetUserProposalsAsync(long freelancerUserId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddProjectAsync(Project project);
        Task<BitResultObject> EditProjectAsync(Project project, long employerUserId);
        Task<BitResultObject> PublishProjectAsync(long projectId, long employerUserId);
        Task<BitResultObject> RemoveProjectAsync(long projectId, long employerUserId);
        Task<ListResultObject<Proposal>> GetProjectProposalsAsync(long projectId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddProposalAsync(Proposal proposal);
        Task<BitResultObject> UpdateProposalStatusAsync(long proposalId, ProposalStatus status, long employerUserId);
        Task<BitResultObject> AcceptProposalAsync(long proposalId, long employerUserId, IReadOnlyList<Milestone> milestones);
        Task<ListResultObject<Milestone>> GetContractMilestonesAsync(long contractId, long userId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddMilestoneAsync(long contractId, long userId, Milestone milestone);
        Task<BitResultObject> UpdateMilestoneStatusAsync(long milestoneId, long userId, MilestoneStatus status);
    }
}
