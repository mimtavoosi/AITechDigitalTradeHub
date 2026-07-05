using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace AITechDigitalTradeHub.Tests;

public class ProjectAccessServiceTests
{
    [Fact]
    public async Task CanAccessAsync_AllowsEmployerContractorAndActiveOrganizationMember()
    {
        await using var context = CreateContext();
        context.Projects.AddRange(
            new Project { ID = 1, EmployerUserId = 10, OrganizationId = 50, Title = "Project", IsActive = true },
            new Project { ID = 2, EmployerUserId = 20, Title = "Contract project", IsActive = true });
        context.Contracts.Add(new Contract { ID = 1, ProjectId = 2, EmployerUserId = 20, ContractorUserId = 30, IsActive = true });
        context.OrganizationMembers.Add(new OrganizationMember { ID = 1, OrganizationId = 50, UserId = 40, IsActive = true });
        await context.SaveChangesAsync();
        var service = new ProjectAccessService(context);

        Assert.True(await service.CanAccessAsync(1, 10));
        Assert.True(await service.CanAccessAsync(2, 30));
        Assert.True(await service.CanAccessAsync(1, 40));
        Assert.False(await service.CanAccessAsync(1, 99));
    }

    [Fact]
    public async Task CanAccessAsync_RejectsDeletedProjectAndInactiveOrganizationMember()
    {
        await using var context = CreateContext();
        context.Projects.AddRange(
            new Project { ID = 1, EmployerUserId = 10, DeleteDate = DateTime.UtcNow, Title = "Deleted", IsActive = true },
            new Project { ID = 2, EmployerUserId = 20, OrganizationId = 50, Title = "Organization", IsActive = true });
        context.OrganizationMembers.Add(new OrganizationMember { ID = 1, OrganizationId = 50, UserId = 40, IsActive = false });
        await context.SaveChangesAsync();
        var service = new ProjectAccessService(context);

        Assert.False(await service.CanAccessAsync(1, 10));
        Assert.False(await service.CanAccessAsync(2, 40));
        Assert.True(await service.CanAccessAsync(2, 0, bypassOwnership: true));
    }

    private static TheAppContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<TheAppContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TheAppContext(options);
    }
}
