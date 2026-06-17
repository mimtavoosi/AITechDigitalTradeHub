using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum UserRoleAssignmentStatus : byte
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
        Suspended = 4
    }

    /// <summary>اتصال چندنقشی کاربر به نقش‌های عملیاتی پلتفرم.</summary>
    public class UserRole : BaseEntity
    {
        public long UserId { get; set; }
        public long RoleId { get; set; }
        public UserRoleAssignmentStatus Status { get; set; } = UserRoleAssignmentStatus.Pending;
        public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }
        public long? ApprovedByUserId { get; set; }
        public DateTime? RejectedAt { get; set; }

        [MaxLength(500)]
        public string? AdminNote { get; set; }

        public User User { get; set; } = default!;
        public Role Role { get; set; } = default!;
        public User? ApprovedByUser { get; set; }
    }
}
