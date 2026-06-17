using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.EntityFrameworkCore;
using MTPermissionCenter.EFCore.Entities;

namespace AITechDigitalTradeHub.Api.Infrastructure
{
    public static class IdentityDataSeeder
    {
        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TheAppContext>();

            await SeedRolesAsync(context);
            await SeedPermissionsAsync(context);
        }

        private static async Task SeedRolesAsync(TheAppContext context)
        {
            var roles = new Dictionary<string, string>
            {
                [RoleNames.User] = "کاربر عادی",
                [RoleNames.Employer] = "کارفرما",
                [RoleNames.Freelancer] = "مجری پروژه",
                [RoleNames.ServiceProvider] = "ارائه‌دهنده خدمات",
                [RoleNames.Instructor] = "مدرس",
                [RoleNames.OrganizationAdmin] = "مدیر سازمان",
                [RoleNames.Investor] = "سرمایه‌گذار",
                [RoleNames.Fundraiser] = "سرمایه‌پذیر",
                [RoleNames.Support] = "پشتیبان",
                [RoleNames.Arbitrator] = "داور",
                [RoleNames.Admin] = "مدیر",
                [RoleNames.SuperAdmin] = "مدیر کل"
            };

            foreach (var role in roles)
            {
                if (await context.Roles.AnyAsync(x => x.Name == role.Key))
                {
                    continue;
                }

                await context.Roles.AddAsync(new Role
                {
                    Name = role.Key,
                    Description = role.Value,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true,
                    Users = new List<User>(),
                    PermissionRoles = new List<MTPermissionCenter_PermissionRole>()
                });
            }

            await context.SaveChangesAsync();
        }

        private static async Task SeedPermissionsAsync(TheAppContext context)
        {
            var permissions = new Dictionary<string, string>
            {
                [PermissionKeys.ManageUsers] = "مدیریت کاربران و قابلیت‌های حساب",
                [PermissionKeys.ManageCategories] = "مدیریت دسته‌بندی‌ها",
                [PermissionKeys.CreateListing] = "ثبت آگهی و خدمت",
                [PermissionKeys.ManageOwnListing] = "مدیریت آگهی‌های خود",
                [PermissionKeys.CreateProject] = "ثبت پروژه",
                [PermissionKeys.ManageOwnProject] = "مدیریت پروژه‌های خود",
                [PermissionKeys.SubmitProposal] = "ارسال پیشنهاد پروژه",
                [PermissionKeys.ManageProjectProposal] = "مدیریت پیشنهادهای پروژه",
                [PermissionKeys.UseWallet] = "استفاده از کیف پول",
                [PermissionKeys.ManageTickets] = "مدیریت تیکت‌ها",
                [PermissionKeys.ReviewCreate] = "ثبت نظر و امتیاز",
                [PermissionKeys.EducationCourseRead] = "مشاهده دوره‌ها",
                [PermissionKeys.EducationCourseManage] = "مدیریت دوره‌های آموزشی",
                [PermissionKeys.EducationInstructorManage] = "مدیریت پروفایل مدرس",
                [PermissionKeys.EducationBookingCreate] = "رزرو جلسه آموزشی",
                [PermissionKeys.EducationBookingManage] = "مدیریت رزروهای آموزشی"
            };

            foreach (var permission in permissions)
            {
                if (await context.Permissions.AnyAsync(x => x.Key == permission.Key))
                {
                    continue;
                }

                await context.Permissions.AddAsync(new MTPermissionCenter_Permission
                {
                    Key = permission.Key,
                    Name = permission.Value,
                    PermissionType = "Api",
                    Description = permission.Value,
                    IsActive = true,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow
                });
            }

            await context.SaveChangesAsync();
            await AssignRolePermissionsAsync(context);
        }

        private static async Task AssignRolePermissionsAsync(TheAppContext context)
        {
            var grants = new Dictionary<string, string[]>
            {
                [RoleNames.User] = new[]
                {
                    PermissionKeys.CreateListing,
                    PermissionKeys.ManageOwnListing,
                    PermissionKeys.CreateProject,
                    PermissionKeys.ManageOwnProject,
                    PermissionKeys.ManageProjectProposal,
                    PermissionKeys.SubmitProposal,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead,
                    PermissionKeys.EducationBookingCreate
                },
                [RoleNames.Employer] = new[]
                {
                    PermissionKeys.CreateProject,
                    PermissionKeys.ManageOwnProject,
                    PermissionKeys.ManageProjectProposal,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead
                },
                [RoleNames.Freelancer] = new[]
                {
                    PermissionKeys.SubmitProposal,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead
                },
                [RoleNames.ServiceProvider] = new[]
                {
                    PermissionKeys.CreateListing,
                    PermissionKeys.ManageOwnListing,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead
                },
                [RoleNames.Instructor] = new[]
                {
                    PermissionKeys.EducationCourseRead,
                    PermissionKeys.EducationBookingCreate,
                    PermissionKeys.EducationCourseManage,
                    PermissionKeys.EducationInstructorManage,
                    PermissionKeys.EducationBookingManage,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets
                },
                [RoleNames.Investor] = new[]
                {
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead
                },
                [RoleNames.Fundraiser] = new[]
                {
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead
                },
                [RoleNames.Support] = new[] { PermissionKeys.ManageTickets },
                [RoleNames.Admin] = new[]
                {
                    PermissionKeys.ManageUsers,
                    PermissionKeys.ManageCategories,
                    PermissionKeys.CreateListing,
                    PermissionKeys.ManageOwnListing,
                    PermissionKeys.CreateProject,
                    PermissionKeys.ManageOwnProject,
                    PermissionKeys.ManageProjectProposal,
                    PermissionKeys.SubmitProposal,
                    PermissionKeys.UseWallet,
                    PermissionKeys.ManageTickets,
                    PermissionKeys.ReviewCreate,
                    PermissionKeys.EducationCourseRead,
                    PermissionKeys.EducationBookingCreate,
                    PermissionKeys.EducationCourseManage,
                    PermissionKeys.EducationInstructorManage,
                    PermissionKeys.EducationBookingManage
                },
                [RoleNames.SuperAdmin] = Array.Empty<string>()
            };

            var roleIds = await context.Roles.ToDictionaryAsync(x => x.Name, x => x.ID);
            var permissionIds = await context.Permissions.ToDictionaryAsync(x => x.Key, x => x.ID);

            foreach (var grant in grants)
            {
                if (!roleIds.TryGetValue(grant.Key, out var roleId))
                {
                    continue;
                }

                foreach (var permissionKey in grant.Value)
                {
                    if (!permissionIds.TryGetValue(permissionKey, out var permissionId))
                    {
                        continue;
                    }

                    if (await context.PermissionRoles.AnyAsync(x => x.RoleId == roleId && x.PermissionId == permissionId))
                    {
                        continue;
                    }

                    await context.PermissionRoles.AddAsync(new MTPermissionCenter_PermissionRole
                    {
                        RoleId = roleId,
                        PermissionId = permissionId,
                        IsActive = true,
                        OwnerOnly = false,
                        CreateDate = DateTime.UtcNow,
                        UpdateDate = DateTime.UtcNow
                    });
                }
            }

            await context.SaveChangesAsync();
        }
    }
}
