using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مستندات پرونده اختلاف.</summary>
    public class DisputeEvidence : BaseEntity
    {
        public long DisputeId { get; set; }
        public long SubmittedByUserId { get; set; }
        public long? FileUploadId { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public string? Note { get; set; }

        public Dispute Dispute { get; set; } = default!;
        public User SubmittedByUser { get; set; } = default!;
        public FileUpload? FileUpload { get; set; }
    }
}
