using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum BadgeTargetType : byte { User = 1, Organization = 2 }
    public enum BadgeAssignmentStatus : byte { Active = 1, Revoked = 2, Expired = 3 }

    /// <summary>نشان حرفه‌ای مانند مجری برتر، شرکت قابل اعتماد یا مدرس برتر.</summary>
    public class Badge : BaseEntity
    {
        [MaxLength(120)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(80)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(80)]
        public string? IconName { get; set; }

        public bool IsSystemBadge { get; set; } = true;
    }

    public class BadgeAssignment : BaseEntity
    {
        public long BadgeId { get; set; }
        public BadgeTargetType TargetType { get; set; }
        public long TargetId { get; set; }
        public long? AssignedByUserId { get; set; }

        public BadgeAssignmentStatus Status { get; set; } = BadgeAssignmentStatus.Active;
        public DateTime? ExpiresAt { get; set; }

        [MaxLength(500)]
        public string? Reason { get; set; }

        public Badge Badge { get; set; } = default!;
        public User? AssignedByUser { get; set; }
    }
}
