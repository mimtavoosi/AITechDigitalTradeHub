using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum OrganizationInvitationStatus : byte { Pending = 1, Accepted = 2, Rejected = 3, Expired = 4, Cancelled = 5 }

    /// <summary>دعوت عضو به سازمان پیش از تبدیل شدن به OrganizationMember.</summary>
    public class OrganizationInvitation : BaseEntity
    {
        public long OrganizationId { get; set; }
        public long InvitedByUserId { get; set; }
        public long? AcceptedUserId { get; set; }

        [MaxLength(180)]
        public string EmailOrPhone { get; set; } = string.Empty;

        public OrgRole Role { get; set; } = OrgRole.Member;
        public OrganizationInvitationStatus Status { get; set; } = OrganizationInvitationStatus.Pending;

        [MaxLength(128)]
        public string InviteTokenHash { get; set; } = string.Empty;

        public DateTime ExpiresAt { get; set; }
        public DateTime? RespondedAt { get; set; }

        public Organization Organization { get; set; } = default!;
        public User InvitedByUser { get; set; } = default!;
        public User? AcceptedUser { get; set; }
    }
}
