using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class CourseCertificate : BaseEntity
    {
        public long EnrollmentId { get; set; }
        public long CourseId { get; set; }
        public long StudentUserId { get; set; }
        public long InstructorUserId { get; set; }

        [MaxLength(64)]
        public string CertificateNumber { get; set; } = string.Empty;

        public DateTime IssuedAt { get; set; }
        public DateTime CompletedAt { get; set; }
        public byte ProgressPercent { get; set; }
        public bool IsRevoked { get; set; }

        [MaxLength(500)]
        public string? RevocationReason { get; set; }

        public CourseEnrollment Enrollment { get; set; } = default!;
        public Course Course { get; set; } = default!;
        public User StudentUser { get; set; } = default!;
        public User InstructorUser { get; set; } = default!;
    }
}
