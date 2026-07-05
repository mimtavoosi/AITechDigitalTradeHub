namespace AITechDigitalTradeHub.Api.Services
{
    public interface IProjectAccessService
    {
        Task<bool> CanAccessAsync(long projectId, long userId, bool bypassOwnership = false);
    }
}
