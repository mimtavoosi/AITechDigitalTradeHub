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
        public LocationMode LocationMode { get; set; }
        public decimal? BudgetMin { get; set; }
        public decimal? BudgetMax { get; set; }
        public string Currency { get; set; } = "IRR";
        public int? TimelineDays { get; set; }
        public DateTime? DeadlineAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public long CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string? EmployerName { get; set; }
        public long EmployerUserId { get; set; }
        public long? OrganizationId { get; set; }
        public string? OrganizationName { get; set; }
        public int ProposalsCount { get; set; }
        public int ActiveDisputesCount { get; set; }
        public List<ProjectSkillResponse> Skills { get; set; } = new();

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
                LocationMode = project.LocationMode,
                BudgetMin = project.BudgetMin,
                BudgetMax = project.BudgetMax,
                Currency = project.Currency,
                TimelineDays = project.TimelineDays,
                DeadlineAt = project.DeadlineAt,
                PublishedAt = project.PublishedAt,
                ClosedAt = project.ClosedAt,
                CategoryId = project.CategoryId,
                CategoryName = project.Category?.CategoryName,
                EmployerUserId = project.EmployerUserId,
                OrganizationId = project.OrganizationId,
                OrganizationName = project.Organization?.Title,
                EmployerName = project.EmployerUser == null ? null : $"{project.EmployerUser.FirstName} {project.EmployerUser.LastName}".Trim(),
                ProposalsCount = project.QueryProposalsCount ?? project.Proposals?.Count ?? 0,
                Skills = project.Skills?
                    .Where(x => x.Tag != null)
                    .Select(ProjectSkillResponse.FromEntity)
                    .ToList() ?? new List<ProjectSkillResponse>()
            };
        }
    }

    public class ProjectSkillResponse
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Slug { get; set; } = string.Empty;

        public static ProjectSkillResponse FromEntity(ProjectSkill skill)
        {
            return new ProjectSkillResponse
            {
                Id = skill.TagId,
                Name = skill.Tag?.Name ?? string.Empty,
                Slug = skill.Tag?.Slug ?? string.Empty
            };
        }
    }

    public class ProjectDetailResponse : ProjectListItemResponse
    {
        public ContractResponse? Contract { get; set; }
        public ProjectAssignmentResponse? Assignment { get; set; }
        public List<ProposalResponse> Proposals { get; set; } = new();
        public List<ProjectActivityLogResponse> ActivityLogs { get; set; } = new();
        public List<ProjectDocumentResponse> Documents { get; set; } = new();

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
                LocationMode = project.LocationMode,
                BudgetMin = project.BudgetMin,
                BudgetMax = project.BudgetMax,
                Currency = project.Currency,
                TimelineDays = project.TimelineDays,
                DeadlineAt = project.DeadlineAt,
                PublishedAt = project.PublishedAt,
                ClosedAt = project.ClosedAt,
                CategoryName = project.Category?.CategoryName,
                OrganizationName = project.Organization?.Title,
                EmployerName = project.EmployerUser == null ? null : $"{project.EmployerUser.FirstName} {project.EmployerUser.LastName}".Trim(),
                ProposalsCount = project.Proposals?.Count ?? 0,
                Skills = project.Skills?
                    .Where(x => x.Tag != null)
                    .Select(ProjectSkillResponse.FromEntity)
                    .ToList() ?? new List<ProjectSkillResponse>(),
                EmployerUserId = project.EmployerUserId,
                OrganizationId = project.OrganizationId,
                Assignment = project.Assignment == null ? null : ProjectAssignmentResponse.FromEntity(project.Assignment),
                Contract = project.Contract == null ? null : ContractResponse.FromEntity(project.Contract),
                Proposals = project.Proposals?.Select(ProposalResponse.FromEntity).ToList() ?? new List<ProposalResponse>(),
                ActivityLogs = project.ActivityLogs?
                    .OrderByDescending(x => x.CreateDate)
                    .Select(ProjectActivityLogResponse.FromEntity)
                    .ToList() ?? new List<ProjectActivityLogResponse>()
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
        public string? ProjectTitle { get; set; }
        public ProjectStatus? ProjectStatus { get; set; }
        public bool ProjectHasContract { get; set; }
        public long? ContractId { get; set; }
        public decimal ProposedPrice { get; set; }
        public int ProposedDays { get; set; }
        public decimal? CounterPrice { get; set; }
        public int? CounterDays { get; set; }
        public string? CounterMessage { get; set; }
        public DateTime? CounterOfferAt { get; set; }
        public DateTime? CounterAcceptedAt { get; set; }
        public DateTime? CounterRejectedAt { get; set; }
        public string? CoverLetter { get; set; }
        public ProposalStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public long? ResumeFileUploadId { get; set; }
        public string? ResumeFileName { get; set; }
        public string? ResumeFileUrl { get; set; }

        public static ProposalResponse FromEntity(Proposal proposal)
        {
            return new ProposalResponse
            {
                Id = proposal.ID,
                ProjectId = proposal.ProjectId,
                FreelancerUserId = proposal.FreelancerUserId,
                FreelancerName = proposal.FreelancerUser == null ? null : $"{proposal.FreelancerUser.FirstName} {proposal.FreelancerUser.LastName}".Trim(),
                ProjectTitle = proposal.Project?.Title,
                ProjectStatus = proposal.Project?.Status,
                ProjectHasContract = proposal.Project?.Contract != null,
                ContractId = proposal.Project?.Contract?.ID,
                ProposedPrice = proposal.ProposedPrice,
                ProposedDays = proposal.ProposedDays,
                CounterPrice = proposal.CounterPrice,
                CounterDays = proposal.CounterDays,
                CounterMessage = proposal.CounterMessage,
                CounterOfferAt = proposal.CounterOfferAt,
                CounterAcceptedAt = proposal.CounterAcceptedAt,
                CounterRejectedAt = proposal.CounterRejectedAt,
                CoverLetter = proposal.CoverLetter,
                Status = proposal.Status,
                CreateDate = proposal.CreateDate
            };
        }

        public void AttachResumeFile(FileUpload file)
        {
            ResumeFileUploadId = file.ID;
            ResumeFileName = file.FileName;
            ResumeFileUrl = file.GetUrl ?? file.FilePath;
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
        public List<TimesheetResponse> Timesheets { get; set; } = new();

        public static ContractResponse FromEntity(Contract contract)
        {
            return new ContractResponse
            {
                Id = contract.ID,
                ProjectId = contract.ProjectId,
                EmployerUserId = contract.EmployerUserId,
                ContractorUserId = contract.ContractorUserId,
                Status = contract.Status,
                Milestones = contract.Milestones?.OrderBy(x => x.DueAt ?? x.CreateDate).Select(MilestoneResponse.FromEntity).ToList() ?? new List<MilestoneResponse>(),
                Timesheets = contract.Timesheets?.OrderByDescending(x => x.Date).Select(TimesheetResponse.FromEntity).ToList() ?? new List<TimesheetResponse>()
            };
        }
    }

    public class MilestoneResponse
    {
        public long Id { get; set; }
        public long ContractId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? DueAt { get; set; }
        public int? DurationDays { get; set; }
        public int? DaysRemaining { get; set; }
        public bool IsOverdue { get; set; }
        public MilestoneStatus Status { get; set; }
        public List<DeliverableResponse> Deliverables { get; set; } = new();
        public List<EscrowResponse> Escrows { get; set; } = new();

        public static MilestoneResponse FromEntity(Milestone milestone)
        {
            return new MilestoneResponse
            {
                Id = milestone.ID,
                ContractId = milestone.ContractId,
                Title = milestone.Title,
                Description = milestone.Description,
                Amount = milestone.Amount,
                StartsAt = milestone.StartsAt,
                DueAt = milestone.DueAt,
                DurationDays = milestone.DurationDays,
                DaysRemaining = milestone.DueAt.HasValue
                    ? (int)Math.Ceiling((milestone.DueAt.Value.Date - DateTime.UtcNow.Date).TotalDays)
                    : null,
                IsOverdue = milestone.DueAt.HasValue &&
                            milestone.DueAt.Value.Date < DateTime.UtcNow.Date &&
                            milestone.Status != MilestoneStatus.Approved,
                Status = milestone.Status,
                Deliverables = milestone.Deliverables?.OrderByDescending(x => x.SubmittedAt ?? x.CreateDate).Select(DeliverableResponse.FromEntity).ToList() ?? new List<DeliverableResponse>()
            };
        }
    }

    public class DeliverableResponse
    {
        public long Id { get; set; }
        public long MilestoneId { get; set; }
        public string? Note { get; set; }
        public long? FileUploadId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public DateTime? SubmittedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }

        public static DeliverableResponse FromEntity(Deliverable deliverable)
        {
            return new DeliverableResponse
            {
                Id = deliverable.ID,
                MilestoneId = deliverable.MilestoneId,
                Note = deliverable.Note,
                FileUploadId = deliverable.FileUploadId,
                FileName = deliverable.FileUpload?.FileName,
                FileUrl = deliverable.FileUpload?.GetUrl ?? deliverable.FileUpload?.FilePath,
                SubmittedAt = deliverable.SubmittedAt,
                ApprovedAt = deliverable.ApprovedAt
            };
        }
    }

    public class EscrowResponse
    {
        public long Id { get; set; }
        public long PayerWalletId { get; set; }
        public long PayeeWalletId { get; set; }
        public decimal Amount { get; set; }
        public string ContextType { get; set; } = string.Empty;
        public long ContextId { get; set; }
        public EscrowStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }

        public static EscrowResponse FromEntity(Escrow escrow)
        {
            return new EscrowResponse
            {
                Id = escrow.ID,
                PayerWalletId = escrow.PayerWalletId,
                PayeeWalletId = escrow.PayeeWalletId,
                Amount = escrow.Amount,
                ContextType = escrow.ContextType,
                ContextId = escrow.ContextId,
                Status = escrow.Status,
                CreateDate = escrow.CreateDate
            };
        }
    }

    public class TimesheetResponse
    {
        public long Id { get; set; }
        public long ContractId { get; set; }
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public DateOnly Date { get; set; }
        public int Minutes { get; set; }
        public string? Description { get; set; }
        public TimesheetStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }

        public static TimesheetResponse FromEntity(Timesheet timesheet)
        {
            return new TimesheetResponse
            {
                Id = timesheet.ID,
                ContractId = timesheet.ContractId,
                UserId = timesheet.UserId,
                UserName = timesheet.User == null ? null : $"{timesheet.User.FirstName} {timesheet.User.LastName}".Trim(),
                Date = timesheet.Date,
                Minutes = timesheet.Minutes,
                Description = timesheet.Description,
                Status = timesheet.Status,
                CreateDate = timesheet.CreateDate
            };
        }
    }

    public class ProjectActivityLogResponse
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public long? ActorUserId { get; set; }
        public string? ActorName { get; set; }
        public ProjectActivityType ActivityType { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? DetailsJson { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ProjectActivityLogResponse FromEntity(ProjectActivityLog activityLog)
        {
            return new ProjectActivityLogResponse
            {
                Id = activityLog.ID,
                ProjectId = activityLog.ProjectId,
                ActorUserId = activityLog.ActorUserId,
                ActorName = activityLog.ActorUser == null ? null : $"{activityLog.ActorUser.FirstName} {activityLog.ActorUser.LastName}".Trim(),
                ActivityType = activityLog.ActivityType,
                Title = activityLog.Title,
                DetailsJson = activityLog.DetailsJson,
                CreateDate = activityLog.CreateDate
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

    public class ProjectDocumentResponse
    {
        public long Id { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string? FileUrl { get; set; }
        public string ContentType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Tag { get; set; }
        public string? Note { get; set; }
        public long CreatorId { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ProjectDocumentResponse FromEntity(FileUpload file)
        {
            return new ProjectDocumentResponse
            {
                Id = file.ID,
                FileName = file.FileName,
                FileUrl = file.GetUrl ?? file.FilePath,
                ContentType = file.ContentType,
                Description = file.Description,
                Tag = file.Tag,
                Note = file.Note,
                CreatorId = file.CreatorId,
                CreateDate = file.CreateDate
            };
        }
    }

    public class ProjectConversationResponse
    {
        public long Id { get; set; }
        public long ProjectId { get; set; }
        public List<ProjectConversationMemberResponse> Members { get; set; } = new();
        public List<ProjectMessageResponse> Messages { get; set; } = new();

        public static ProjectConversationResponse FromEntity(Conversation conversation)
        {
            return new ProjectConversationResponse
            {
                Id = conversation.ID,
                ProjectId = conversation.ContextId,
                Members = conversation.Members?.Select(ProjectConversationMemberResponse.FromEntity).ToList() ?? new List<ProjectConversationMemberResponse>(),
                Messages = conversation.Messages?.OrderBy(x => x.CreateDate).Select(ProjectMessageResponse.FromEntity).ToList() ?? new List<ProjectMessageResponse>()
            };
        }
    }

    public class ProjectConversationMemberResponse
    {
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public long? LastReadMessageId { get; set; }
        public bool IsMuted { get; set; }

        public static ProjectConversationMemberResponse FromEntity(ConversationMember member)
        {
            return new ProjectConversationMemberResponse
            {
                UserId = member.UserId,
                UserName = member.User == null ? null : $"{member.User.FirstName} {member.User.LastName}".Trim(),
                LastReadMessageId = member.LastReadMessageId,
                IsMuted = member.IsMuted
            };
        }
    }

    public class ProjectMessageResponse
    {
        public long Id { get; set; }
        public long ConversationId { get; set; }
        public long SenderUserId { get; set; }
        public string? SenderName { get; set; }
        public MessageType MessageType { get; set; }
        public string? Text { get; set; }
        public long? FileUploadId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ProjectMessageResponse FromEntity(Message message)
        {
            return new ProjectMessageResponse
            {
                Id = message.ID,
                ConversationId = message.ConversationId,
                SenderUserId = message.SenderUserId,
                SenderName = message.SenderUser == null ? null : $"{message.SenderUser.FirstName} {message.SenderUser.LastName}".Trim(),
                MessageType = message.MessageType,
                Text = message.Text,
                FileUploadId = message.FileUploadId,
                FileName = message.FileUpload?.FileName,
                FileUrl = message.FileUpload?.GetUrl ?? message.FileUpload?.FilePath,
                CreateDate = message.CreateDate
            };
        }
    }

    public class ProjectDisputeResponse
    {
        public long Id { get; set; }
        public DisputeContextType ContextType { get; set; }
        public long ContextId { get; set; }
        public long OpenedByUserId { get; set; }
        public string? OpenedByName { get; set; }
        public long? RespondentUserId { get; set; }
        public string? RespondentName { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DisputeReason Reason { get; set; }
        public DisputeStatus Status { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? DecidedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public List<ProjectDisputeEvidenceResponse> EvidenceItems { get; set; } = new();
        public ProjectArbitrationDecisionResponse? Decision { get; set; }

        public static ProjectDisputeResponse FromEntity(Dispute dispute)
        {
            return new ProjectDisputeResponse
            {
                Id = dispute.ID,
                ContextType = dispute.ContextType,
                ContextId = dispute.ContextId,
                OpenedByUserId = dispute.OpenedByUserId,
                OpenedByName = dispute.OpenedByUser == null ? null : $"{dispute.OpenedByUser.FirstName} {dispute.OpenedByUser.LastName}".Trim(),
                RespondentUserId = dispute.RespondentUserId,
                RespondentName = dispute.RespondentUser == null ? null : $"{dispute.RespondentUser.FirstName} {dispute.RespondentUser.LastName}".Trim(),
                Title = dispute.Title,
                Description = dispute.Description,
                Reason = dispute.Reason,
                Status = dispute.Status,
                CreateDate = dispute.CreateDate,
                DecidedAt = dispute.DecidedAt,
                ClosedAt = dispute.ClosedAt,
                Decision = dispute.Decision == null ? null : ProjectArbitrationDecisionResponse.FromEntity(dispute.Decision),
                EvidenceItems = dispute.EvidenceItems?.OrderByDescending(x => x.CreateDate).Select(ProjectDisputeEvidenceResponse.FromEntity).ToList() ?? new List<ProjectDisputeEvidenceResponse>()
            };
        }
    }

    public class ProjectDisputeEvidenceResponse
    {
        public long Id { get; set; }
        public long SubmittedByUserId { get; set; }
        public string? SubmittedByName { get; set; }
        public long? FileUploadId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Note { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public DateTime? CreateDate { get; set; }

        public static ProjectDisputeEvidenceResponse FromEntity(DisputeEvidence evidence)
        {
            return new ProjectDisputeEvidenceResponse
            {
                Id = evidence.ID,
                SubmittedByUserId = evidence.SubmittedByUserId,
                SubmittedByName = evidence.SubmittedByUser == null ? null : $"{evidence.SubmittedByUser.FirstName} {evidence.SubmittedByUser.LastName}".Trim(),
                FileUploadId = evidence.FileUploadId,
                Title = evidence.Title,
                Note = evidence.Note,
                FileName = evidence.FileUpload?.FileName,
                FileUrl = evidence.FileUpload?.GetUrl ?? evidence.FileUpload?.FilePath,
                CreateDate = evidence.CreateDate
            };
        }
    }

    public class ProjectArbitrationDecisionResponse
    {
        public long Id { get; set; }
        public long DisputeId { get; set; }
        public long DecidedByUserId { get; set; }
        public ArbitrationDecisionType DecisionType { get; set; }
        public string? DecisionText { get; set; }
        public decimal? ReleaseAmount { get; set; }
        public decimal? RefundAmount { get; set; }
        public bool IsExecuted { get; set; }
        public DateTime? ExecutedAt { get; set; }

        public static ProjectArbitrationDecisionResponse FromEntity(ArbitrationDecision decision)
        {
            return new ProjectArbitrationDecisionResponse
            {
                Id = decision.ID,
                DisputeId = decision.DisputeId,
                DecidedByUserId = decision.DecidedByUserId,
                DecisionType = decision.DecisionType,
                DecisionText = decision.DecisionText,
                ReleaseAmount = decision.ReleaseAmount,
                RefundAmount = decision.RefundAmount,
                IsExecuted = decision.IsExecuted,
                ExecutedAt = decision.ExecutedAt
            };
        }
    }
}
