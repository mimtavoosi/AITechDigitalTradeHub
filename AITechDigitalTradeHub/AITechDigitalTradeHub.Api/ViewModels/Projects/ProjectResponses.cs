using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Projects
{
    public class ProjectListItemResponse
    {
        public long Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ProjectStatus Status { get; set; }
        public ProjectType ProjectType { get; set; }
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string Currency { get; set; } = "IRR";
        public int? TimelineDays { get; set; }
        public DateTime? DeadlineAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? CategoryName { get; set; }
        public string? EmployerName { get; set; }
        public int ProposalsCount { get; set; }

        public static ProjectListItemResponse FromEntity(Project project)
        {
            return new ProjectListItemResponse
            {
                Id = project.ID,
                Slug = project.ID.ToString(),
                Title = project.Title,
                Description = project.Description,
                Status = project.Status,
                ProjectType = project.ProjectType,
                BudgetMin = project.BudgetMin,
                BudgetMax = project.BudgetMax,
                Currency = project.Currency,
                TimelineDays = project.TimelineDays,
                DeadlineAt = project.DeadlineAt,
                PublishedAt = project.PublishedAt,
                CategoryName = project.Category?.CategoryName,
                EmployerName = project.EmployerUser == null ? null : $"{project.EmployerUser.FirstName} {project.EmployerUser.LastName}".Trim(),
                ProposalsCount = project.Proposals?.Count ?? 0
            };
        }
    }

    public class ProjectDetailResponse : ProjectListItemResponse
    {
        public long EmployerUserId { get; set; }
        public long? OrganizationId { get; set; }
        public ContractResponse? Contract { get; set; }
        public ProjectAssignmentResponse? Assignment { get; set; }
        public List<ProposalResponse> Proposals { get; set; } = new();

        public static new ProjectDetailResponse FromEntity(Project project)
        {
            var item = new ProjectDetailResponse
            {
                Id = project.ID,
                Slug = project.ID.ToString(),
                Title = project.Title,
                Description = project.Description,
                Status = project.Status,
                ProjectType = project.ProjectType,
                BudgetMin = project.BudgetMin,
                BudgetMax = project.BudgetMax,
                Currency = project.Currency,
                TimelineDays = project.TimelineDays,
                DeadlineAt = project.DeadlineAt,
                PublishedAt = project.PublishedAt,
                CategoryName = project.Category?.CategoryName,
                EmployerName = project.EmployerUser == null ? null : $"{project.EmployerUser.FirstName} {project.EmployerUser.LastName}".Trim(),
                ProposalsCount = project.Proposals?.Count ?? 0,
                EmployerUserId = project.EmployerUserId,
                OrganizationId = project.OrganizationId,
                Assignment = project.Assignment == null ? null : ProjectAssignmentResponse.FromEntity(project.Assignment),
                Contract = project.Contract == null ? null : ContractResponse.FromEntity(project.Contract),
                Proposals = project.Proposals?.Select(ProposalResponse.FromEntity).ToList() ?? new List<ProposalResponse>()
            };

            return item;
        }
    }

    public class ProposalResponse
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public long FreelancerUserId { get; set; }
        public string? FreelancerName { get; set; }
        public decimal ProposedPrice { get; set; }
        public int ProposedDays { get; set; }
        public string? CoverLetter { get; set; }
        public ProposalStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ProposalResponse FromEntity(Proposal proposal)
        {
            return new ProposalResponse
            {
                Id = proposal.ID,
                ProjectId = proposal.ProjectId,
                FreelancerUserId = proposal.FreelancerUserId,
                FreelancerName = proposal.FreelancerUser == null ? null : $"{proposal.FreelancerUser.FirstName} {proposal.FreelancerUser.LastName}".Trim(),
                ProposedPrice = proposal.ProposedPrice,
                ProposedDays = proposal.ProposedDays,
                CoverLetter = proposal.CoverLetter,
                Status = proposal.Status,
                CreateDate = proposal.CreateDate
            };
        }
    }

    public class ContractResponse
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public long EmployerUserId { get; set; }
        public long? ContractorUserId { get; set; }
        public ContractStatus Status { get; set; }
        public List<MilestoneResponse> Milestones { get; set; } = new();

        public static ContractResponse FromEntity(Contract contract)
        {
            return new ContractResponse
            {
                Id = contract.ID,
                ProjectId = contract.ProjectId,
                EmployerUserId = contract.EmployerUserId,
                ContractorUserId = contract.ContractorUserId,
                Status = contract.Status,
                Milestones = contract.Milestones?.Select(MilestoneResponse.FromEntity).ToList() ?? new List<MilestoneResponse>()
            };
        }
    }

    public class MilestoneResponse
    {
        public long Id { get; set; }
        public long ContractId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime? DueAt { get; set; }
        public MilestoneStatus Status { get; set; }

        public static MilestoneResponse FromEntity(Milestone milestone)
        {
            return new MilestoneResponse
            {
                Id = milestone.ID,
                ContractId = milestone.ContractId,
                Title = milestone.Title,
                Amount = milestone.Amount,
                DueAt = milestone.DueAt,
                Status = milestone.Status
            };
        }
    }

    public class ProjectAssignmentResponse
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public AssigneeType AssigneeType { get; set; }
        public long? AssigneeUserId { get; set; }
        public DateTime? AcceptedAt { get; set; }

        public static ProjectAssignmentResponse FromEntity(ProjectAssignment assignment)
        {
            return new ProjectAssignmentResponse
            {
                Id = assignment.ID,
                ProjectId = assignment.ProjectId,
                AssigneeType = assignment.AssigneeType,
                AssigneeUserId = assignment.AssigneeUserId,
                AcceptedAt = assignment.AcceptedAt
            };
        }
    }
}
