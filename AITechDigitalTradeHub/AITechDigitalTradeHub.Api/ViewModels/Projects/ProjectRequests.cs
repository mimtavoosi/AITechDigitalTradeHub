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

    public class CreateContractMilestoneRequest
    {
        [Required, MaxLength(160)]
        public string Title { get; set; } = string.Empty;

        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        public DateTime? DueAt { get; set; }

        public Milestone ToEntity()
        {
            return new Milestone
            {
                Title = Title.Trim(),
                Amount = Amount,
                DueAt = DueAt,
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

    public class HoldProjectMilestoneEscrowRequest
    {
        [Range(1, long.MaxValue)]
        public long PayerWalletId { get; set; }

        [Range(1, long.MaxValue)]
        public long PayeeWalletId { get; set; }
    }
}
