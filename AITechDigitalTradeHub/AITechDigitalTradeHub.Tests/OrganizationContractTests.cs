using System.Reflection;
using AITechDigitalTradeHub.Api.Controllers;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Xunit;

namespace AITechDigitalTradeHub.Tests;

public class OrganizationContractTests
{
    [Fact]
    public void OrganizationType_IncludesUniversityAsFirstClassType()
    {
        Assert.Equal(2, (byte)OrganizationType.University);
        Assert.NotEqual(OrganizationType.Company, OrganizationType.University);
    }

    [Theory]
    [InlineData(nameof(OrganizationsController.GetAdmin))]
    [InlineData(nameof(OrganizationsController.UpdateStatus))]
    public void AdminEndpoints_RequireOrganizationAdminPermission(string methodName)
    {
        var method = typeof(OrganizationsController).GetMethod(methodName) ?? throw new InvalidOperationException();
        var authorize = method.GetCustomAttribute<AuthorizeAttribute>();
        Assert.Equal(PermissionPolicyNames.Prefix + PermissionKeys.OrganizationAdminManage, authorize?.Policy);
    }
}
