using AITechDigitalTradeHub.Data.DataLayer;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Services
{
    public class ProjectAccessService : IProjectAccessService
    {
        private readonly TheAppContext _context;

        public ProjectAccessService(TheAppContext context)
        {
            _context = context;
        }

        public async Task<bool> CanAccessAsync(long projectId, long userId, bool bypassOwnership = false)
        {
            if (bypassOwnership)
            {
                return true;
            }

            if (projectId <= 0 || userId <= 0)
            {
                return false;
            }

            return await _context.Projects
                .AsNoTracking()
                .AnyAsync(project =>
                    project.ID == projectId &&
                    project.DeleteDate == null &&
                    (
                        project.EmployerUserId == userId ||
                        _context.Contracts.Any(contract =>
                            contract.ProjectId == projectId &&
                            contract.DeleteDate == null &&
                            (contract.EmployerUserId == userId || contract.ContractorUserId == userId)) ||
                        (project.OrganizationId.HasValue && _context.OrganizationMembers.Any(member =>
                            member.OrganizationId == project.OrganizationId.Value &&
                            member.UserId == userId &&
                            member.IsActive &&
                            member.DeleteDate == null))
                    ));
        }
    }
}
