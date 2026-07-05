using System.Reflection;
using AITechDigitalTradeHub.Api.Controllers;
using AITechDigitalTradeHub.Api.Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace AITechDigitalTradeHub.Tests;

public class EducationAuthorizationTests
{
    [Theory]
    [InlineData(nameof(EducationController.GetAdminCourses))]
    [InlineData(nameof(EducationController.UpdateAdminCourseStatus))]
    [InlineData(nameof(EducationController.GetAdminBookings))]
    public void AdminEndpoints_RequireDedicatedEducationAdminPermission(string methodName)
    {
        var method = GetMethod(methodName);
        var authorize = method.GetCustomAttribute<AuthorizeAttribute>();

        Assert.NotNull(authorize);
        Assert.Equal(
            PermissionPolicyNames.Prefix + PermissionKeys.EducationAdminManage,
            authorize!.Policy);
    }

    [Fact]
    public void CertificateVerification_IsPublicAndHasStableRoute()
    {
        var method = GetMethod(nameof(EducationController.VerifyCertificate));
        var route = method.GetCustomAttribute<HttpGetAttribute>();

        Assert.Null(method.GetCustomAttribute<AuthorizeAttribute>());
        Assert.Equal("certificates/{certificateNumber}/verify", route?.Template);
    }

    private static MethodInfo GetMethod(string methodName)
    {
        return typeof(EducationController).GetMethod(methodName)
            ?? throw new InvalidOperationException($"Method {methodName} was not found.");
    }
}
