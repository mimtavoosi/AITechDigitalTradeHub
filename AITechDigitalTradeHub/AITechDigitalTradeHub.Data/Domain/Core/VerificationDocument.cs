using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum VerificationOwnerType : byte { User = 1, Organization = 2 }
    public enum VerificationDocumentType : byte
    {
        NationalCard = 1,
        BusinessLicense = 2,
        CompanyRegistration = 3,
        TaxDocument = 4,
        TechnicalCertificate = 5,
        Other = 99
    }
    public enum VerificationDocumentStatus : byte { Pending = 1, Approved = 2, Rejected = 3, Expired = 4 }

    /// <summary>مدارک احراز هویت کاربر یا اعتبارسنجی شرکت.</summary>
    public class VerificationDocument : BaseEntity
    {
        public VerificationOwnerType OwnerType { get; set; }
        public long OwnerId { get; set; }
        public long FileUploadId { get; set; }
        public long? ReviewedByUserId { get; set; }

        public VerificationDocumentType DocumentType { get; set; }
        public VerificationDocumentStatus Status { get; set; } = VerificationDocumentStatus.Pending;

        [MaxLength(120)]
        public string? DocumentNumber { get; set; }

        [MaxLength(500)]
        public string? ReviewNote { get; set; }

        public DateTime? IssuedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public FileUpload FileUpload { get; set; } = default!;
        public User? ReviewedByUser { get; set; }
    }
}
