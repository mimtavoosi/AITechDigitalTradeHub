using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Organizations
{
    public class OrganizationUpsertRequest
    {
        [Required, MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [Required, MaxLength(160)]
        public string Slug { get; set; } = string.Empty;

        public OrganizationType Type { get; set; } = OrganizationType.Company;

        [MaxLength(32)]
        public string? NationalId { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(300), Url]
        public string? WebsiteUrl { get; set; }

        [MaxLength(180), EmailAddress]
        public string? PublicEmail { get; set; }

        [MaxLength(32)]
        public string? PublicPhone { get; set; }

        public bool RequireApprovalForMemberPayments { get; set; } = true;
        public decimal? DefaultMemberPaymentLimit { get; set; }
    }

    public class OrganizationMemberUpsertRequest
    {
        [Range(1, long.MaxValue)]
        public long UserId { get; set; }
        public OrgRole Role { get; set; } = OrgRole.Member;
        public bool CanRequestOrganizationPayments { get; set; } = true;
        public bool CanApproveOrganizationPayments { get; set; }
        public decimal? PaymentLimit { get; set; }
    }

    public class OrganizationStatusRequest
    {
        public OrganizationStatus Status { get; set; }
        public bool IsVerified { get; set; }
    }

    public class OrganizationResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public OrganizationType Type { get; set; }
        public string? NationalId { get; set; }
        public string? Description { get; set; }
        public string? WebsiteUrl { get; set; }
        public string? PublicEmail { get; set; }
        public string? PublicPhone { get; set; }
        public bool IsVerified { get; set; }
        public OrganizationStatus Status { get; set; }
        public long OwnerUserId { get; set; }
        public string OwnerName { get; set; } = string.Empty;
        public int MembersCount { get; set; }
        public int ProjectsCount { get; set; }
        public bool RequireApprovalForMemberPayments { get; set; }
        public decimal? DefaultMemberPaymentLimit { get; set; }

        public static OrganizationResponse FromEntity(Organization organization)
        {
            return new OrganizationResponse
            {
                Id = organization.ID,
                Title = organization.Title,
                Slug = organization.Slug,
                Type = organization.Type,
                NationalId = organization.NationalId,
                Description = organization.Description,
                WebsiteUrl = organization.WebsiteUrl,
                PublicEmail = organization.PublicEmail,
                PublicPhone = organization.PublicPhone,
                IsVerified = organization.IsVerified,
                Status = organization.Status,
                OwnerUserId = organization.OwnerUserId,
                OwnerName = $"{organization.OwnerUser?.FirstName} {organization.OwnerUser?.LastName}".Trim(),
                MembersCount = organization.Members?.Count(x => x.IsActive && x.DeleteDate == null) ?? 0,
                ProjectsCount = organization.Projects?.Count(x => x.DeleteDate == null) ?? 0,
                RequireApprovalForMemberPayments = organization.RequireApprovalForMemberPayments,
                DefaultMemberPaymentLimit = organization.DefaultMemberPaymentLimit
            };
        }
    }

    public class OrganizationMemberResponse
    {
        public long Id { get; set; }
        public long UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public OrgRole Role { get; set; }
        public bool IsActive { get; set; }
        public bool CanRequestOrganizationPayments { get; set; }
        public bool CanApproveOrganizationPayments { get; set; }
        public decimal? PaymentLimit { get; set; }

        public static OrganizationMemberResponse FromEntity(OrganizationMember member) => new()
        {
            Id = member.ID,
            UserId = member.UserId,
            DisplayName = $"{member.User?.FirstName} {member.User?.LastName}".Trim(),
            Email = member.User?.Email ?? string.Empty,
            Role = member.Role,
            IsActive = member.IsActive && member.DeleteDate == null,
            CanRequestOrganizationPayments = member.CanRequestCompanyPayments,
            CanApproveOrganizationPayments = member.CanApproveCompanyPayments,
            PaymentLimit = member.PaymentLimit
        };
    }
}
