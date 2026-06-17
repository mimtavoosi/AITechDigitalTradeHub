using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum PortfolioOwnerType : byte { User = 1, Organization = 2 }
    public enum PortfolioSourceType : byte { Manual = 1, CompletedProject = 2, CompletedOrder = 3, Course = 4 }

    /// <summary>نمونه‌کار قابل نمایش در پروفایل کاربر یا شرکت.</summary>
    public class PortfolioItem : BaseEntity
    {
        public PortfolioOwnerType OwnerType { get; set; }
        public long OwnerId { get; set; }
        public PortfolioSourceType SourceType { get; set; } = PortfolioSourceType.Manual;
        public long? SourceId { get; set; }
        public long? CoverFileId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [MaxLength(300)]
        public string? ExternalUrl { get; set; }

        public bool IsPublic { get; set; } = true;

        public FileUpload? CoverFile { get; set; }
    }
}
