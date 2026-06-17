using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum InvestmentDocumentType : byte { PitchDeck = 1, BusinessPlan = 2, FinancialForecast = 3, TechnicalDocument = 4, LegalDocument = 5, Other = 99 }

    /// <summary>مستندات فرصت سرمایه‌گذاری.</summary>
    public class InvestmentDocument : BaseEntity
    {
        public long InvestmentOpportunityId { get; set; }
        public long FileUploadId { get; set; }
        public InvestmentDocumentType DocumentType { get; set; }

        [MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public bool IsConfidential { get; set; }

        public InvestmentOpportunity InvestmentOpportunity { get; set; } = default!;
        public FileUpload FileUpload { get; set; } = default!;
    }
}
