using System.ComponentModel.DataAnnotations;
using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Projects
{
    public class ProjectUpsertRequest
    {
        public long? OrganizationId { get; set; }

        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Range(1, long.MaxValue)]
        public long CategoryId { get; set; }

        public ProjectType ProjectType { get; set; } = ProjectType.Fixed;
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        public int? TimelineDays { get; set; }
        public DateTime? DeadlineAt { get; set; }
        public LocationMode LocationMode { get; set; } = LocationMode.Remote;
        public long? CityId { get; set; }
        public List<long> SkillTagIds { get; set; } = new();

        public Project ToEntity(long employerUserId)
        {
            return new Project
            {
                EmployerUserId = employerUserId,
                OrganizationId = OrganizationId,
                Title = Title.Trim(),
                Description = Description,
                CategoryId = CategoryId,
                ProjectType = ProjectType,
                BudgetMin = BudgetMin,
                BudgetMax = BudgetMax,
                Currency = Currency,
                TimelineDays = TimelineDays,
                DeadlineAt = DeadlineAt,
                LocationMode = LocationMode,
                CityId = CityId
            };
        }
    }

    public class CreateProposalRequest
    {
        [Range(0.01, double.MaxValue)]
        public decimal ProposedPrice { get; set; }

        [Range(1, int.MaxValue)]
        public int ProposedDays { get; set; }

        public string? CoverLetter { get; set; }

        public long? ResumeFileUploadId { get; set; }

        public Proposal ToEntity(long projectId, long freelancerUserId)
        {
            return new Proposal
            {
                ProjectId = projectId,
                FreelancerUserId = freelancerUserId,
                ProposedPrice = ProposedPrice,
                ProposedDays = ProposedDays,
                CoverLetter = CoverLetter
            };
        }
    }

    public class UpdateProposalStatusRequest
    {
        public ProposalStatus Status { get; set; }
    }

    public class CreateProposalCounterOfferRequest
    {
        [Range(0.01, double.MaxValue)]
        public decimal CounterPrice { get; set; }

        [Range(1, int.MaxValue)]
        public int CounterDays { get; set; }

        [MaxLength(1000)]
        public string? Message { get; set; }
    }

    public class RespondProposalCounterOfferRequest
    {
        public bool Accepted { get; set; }

        [MaxLength(1000)]
        public string? Message { get; set; }
    }

    public class CreateContractMilestoneRequest
    {
        [Required, MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime? StartsAt { get; set; }

        public DateTime? DueAt { get; set; }

        [Range(1, 3650)]
        public int? DurationDays { get; set; }

        public Milestone ToEntity()
        {
            return new Milestone
            {
                Title = Title.Trim(),
                Description = Description,
                Amount = Amount,
                StartsAt = StartsAt,
                DueAt = DueAt,
                DurationDays = DurationDays,
                Status = MilestoneStatus.Pending
            };
        }
    }

    public class AcceptProposalRequest
    {
        public List<CreateContractMilestoneRequest> Milestones { get; set; } = new();
    }

    public class UpdateMilestoneStatusRequest
    {
        public MilestoneStatus Status { get; set; }
    }

    public class CompleteProjectRequest
    {
        public bool AddToContractorPortfolio { get; set; } = true;

        [MaxLength(300)]
        public string? PortfolioExternalUrl { get; set; }
    }

    public class AdminUpdateProjectStatusRequest
    {
        public ProjectStatus Status { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class HoldProjectMilestoneEscrowRequest
    {
        public long? PayerWalletId { get; set; }

        public long? PayeeWalletId { get; set; }
    }

    public class SubmitDeliverableRequest
    {
        [MaxLength(1000)]
        public string? Note { get; set; }

        public long? FileUploadId { get; set; }
    }

    public class ReviewDeliverableRequest
    {
        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class CreateTimesheetRequest
    {
        public DateOnly Date { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

        [Range(1, 1440)]
        public int Minutes { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        public Timesheet ToEntity(long contractId, long userId)
        {
            return new Timesheet
            {
                ContractId = contractId,
                UserId = userId,
                Date = Date,
                Minutes = Minutes,
                Description = Description,
                Status = TimesheetStatus.Submitted
            };
        }
    }

    public class UpdateTimesheetStatusRequest
    {
        public TimesheetStatus Status { get; set; }
    }

    public class AttachProjectDocumentRequest
    {
        [Range(1, long.MaxValue)]
        public long FileUploadId { get; set; }

        [MaxLength(160)]
        public string? Title { get; set; }

        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class SendProjectMessageRequest
    {
        [MaxLength(4000)]
        public string? Text { get; set; }

        public long? FileUploadId { get; set; }
    }

    public class OpenProjectDisputeRequest
    {
        [Required, MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(4000)]
        public string? Description { get; set; }

        public DisputeReason Reason { get; set; } = DisputeReason.Other;

        public long? MilestoneId { get; set; }

        public long? FileUploadId { get; set; }

        [MaxLength(180)]
        public string? EvidenceTitle { get; set; }

        [MaxLength(1000)]
        public string? EvidenceNote { get; set; }
    }

    public class AddProjectDisputeEvidenceRequest
    {
        [Range(1, long.MaxValue)]
        public long FileUploadId { get; set; }

        [Required, MaxLength(180)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Note { get; set; }
    }

    public class ResolveProjectDisputeRequest
    {
        public ArbitrationDecisionType DecisionType { get; set; } = ArbitrationDecisionType.NoAction;

        [MaxLength(4000)]
        public string? DecisionText { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? ReleaseAmount { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? RefundAmount { get; set; }

        public bool ExecuteFinancialDecision { get; set; } = true;
    }
}
