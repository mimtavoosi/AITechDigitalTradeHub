using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Investments
{
    public class CreateInvestmentOpportunityRequest
    {
        public long? OrganizationId { get; set; }
        public long? ProjectId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(220)]
        public string? Slug { get; set; }

        public string? Summary { get; set; }
        public string? BusinessModel { get; set; }
        public string? Roadmap { get; set; }
        public FundraisingStage Stage { get; set; } = FundraisingStage.MVP;
        public InvestmentRiskLevel RiskLevel { get; set; } = InvestmentRiskLevel.Medium;

        [Range(1, double.MaxValue)]
        public decimal RequiredCapital { get; set; }

        public decimal? OfferedSharePercent { get; set; }
        public decimal? ExpectedRoiPercent { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public bool SubmitForReview { get; set; } = true;
    }

    public class AddInvestmentDocumentRequest
    {
        [Range(1, long.MaxValue)]
        public long FileUploadId { get; set; }
        public InvestmentDocumentType DocumentType { get; set; } = InvestmentDocumentType.Other;

        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        public bool IsConfidential { get; set; }
    }

    public class AddInvestmentTrancheRequest
    {
        [Required, MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [Range(1, double.MaxValue)]
        public decimal Amount { get; set; }

        public string? ReleaseCondition { get; set; }
        public DateTime? DueAt { get; set; }
    }

    public class AddInvestmentReportRequest
    {
        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public decimal? SpentAmount { get; set; }
        public decimal? RoiPercent { get; set; }
    }

    public class DirectInvestmentRequest
    {
        [Range(1, long.MaxValue)]
        public long PayerWalletId { get; set; }

        [Range(1, double.MaxValue)]
        public decimal Amount { get; set; }

        public decimal? SharePercent { get; set; }
        public long? InvestorOrganizationId { get; set; }
        public long? ContractFileId { get; set; }
        public string? TermsJson { get; set; }
        public string? ReleaseConditionsJson { get; set; }
    }

    public class OpenInvestmentDisputeRequest
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DisputeReason Reason { get; set; } = DisputeReason.Other;
    }

    public class InvestmentOpportunityResponse
    {
        public long Id { get; set; }
        public long OwnerUserId { get; set; }
        public long? OrganizationId { get; set; }
        public long? ProjectId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;
        public string? Summary { get; set; }
        public string? BusinessModel { get; set; }
        public string? Roadmap { get; set; }
        public FundraisingStage Stage { get; set; }
        public InvestmentOpportunityStatus Status { get; set; }
        public InvestmentRiskLevel RiskLevel { get; set; }
        public decimal RequiredCapital { get; set; }
        public decimal RaisedCapital { get; set; }
        public decimal? OfferedSharePercent { get; set; }
        public decimal? ExpectedRoiPercent { get; set; }
        public string Currency { get; set; } = "IRR";
        public decimal FundingPercent { get; set; }
        public DateTime? OpenedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public List<InvestmentDocumentResponse> Documents { get; set; } = new();
        public List<InvestmentTrancheResponse> Tranches { get; set; } = new();
        public List<InvestmentReportResponse> Reports { get; set; } = new();

        public static InvestmentOpportunityResponse FromEntity(InvestmentOpportunity entity, bool includePrivate = false)
        {
            var raised = entity.RaisedCapital ?? entity.Commitments.Where(x => x.Status == InvestmentCommitmentStatus.Funded).Sum(x => x.Amount);
            return new InvestmentOpportunityResponse
            {
                Id = entity.ID,
                OwnerUserId = entity.OwnerUserId,
                OrganizationId = entity.OrganizationId,
                ProjectId = entity.ProjectId,
                Title = entity.Title,
                Slug = entity.Slug,
                Summary = entity.Summary,
                BusinessModel = entity.BusinessModel,
                Roadmap = entity.Roadmap,
                Stage = entity.Stage,
                Status = entity.Status,
                RiskLevel = entity.RiskLevel,
                RequiredCapital = entity.RequiredCapital,
                RaisedCapital = raised,
                OfferedSharePercent = entity.OfferedSharePercent,
                ExpectedRoiPercent = entity.ExpectedRoiPercent,
                Currency = entity.Currency,
                FundingPercent = entity.RequiredCapital <= 0 ? 0 : Math.Round((raised / entity.RequiredCapital) * 100, 2),
                OpenedAt = entity.OpenedAt,
                ClosedAt = entity.ClosedAt,
                Documents = entity.Documents
                    .Where(x => includePrivate || !x.IsConfidential)
                    .Select(InvestmentDocumentResponse.FromEntity)
                    .ToList(),
                Tranches = entity.Tranches.OrderBy(x => x.DueAt ?? DateTime.MaxValue).Select(InvestmentTrancheResponse.FromEntity).ToList(),
                Reports = entity.Reports.OrderByDescending(x => x.ReportedAt).Select(InvestmentReportResponse.FromEntity).ToList()
            };
        }
    }

    public class InvestmentDocumentResponse
    {
        public long Id { get; set; }
        public InvestmentDocumentType DocumentType { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsConfidential { get; set; }
        public long FileUploadId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }

        public static InvestmentDocumentResponse FromEntity(InvestmentDocument entity) => new()
        {
            Id = entity.ID,
            DocumentType = entity.DocumentType,
            Title = entity.Title,
            IsConfidential = entity.IsConfidential,
            FileUploadId = entity.FileUploadId,
            FileName = entity.FileUpload?.FileName,
            FileUrl = entity.FileUpload?.GetUrl ?? entity.FileUpload?.FilePath
        };
    }

    public class InvestmentTrancheResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string? ReleaseCondition { get; set; }
        public DateTime? DueAt { get; set; }
        public DateTime? ReleasedAt { get; set; }
        public InvestmentTrancheStatus Status { get; set; }

        public static InvestmentTrancheResponse FromEntity(InvestmentTranche entity) => new()
        {
            Id = entity.ID,
            Title = entity.Title,
            Amount = entity.Amount,
            ReleaseCondition = entity.ReleaseCondition,
            DueAt = entity.DueAt,
            ReleasedAt = entity.ReleasedAt,
            Status = entity.Status
        };
    }

    public class InvestmentReportResponse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public decimal? SpentAmount { get; set; }
        public decimal? RoiPercent { get; set; }
        public DateTime ReportedAt { get; set; }

        public static InvestmentReportResponse FromEntity(InvestmentReport entity) => new()
        {
            Id = entity.ID,
            Title = entity.Title,
            Content = entity.Content,
            SpentAmount = entity.SpentAmount,
            RoiPercent = entity.RoiPercent,
            ReportedAt = entity.ReportedAt
        };
    }
}
