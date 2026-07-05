using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class ProjectRep : IProjectRep
    {
        private readonly TheAppContext _context;

        public ProjectRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddProjectAsync(Project project)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.Projects.AddAsync(project);
                await _context.SaveChangesAsync();
                result.ID = project.ID;
                _context.Entry(project).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> AddProposalAsync(Proposal proposal)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var project = await _context.Projects.AsNoTracking().SingleOrDefaultAsync(x => x.ID == proposal.ProjectId && x.IsActive && x.DeleteDate == null);
                if (project == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پروژه پیدا نشد";
                    return result;
                }

                if (project.EmployerUserId == proposal.FreelancerUserId)
                {
                    result.Status = false;
                    result.ErrorMessage = "کارفرما نمی‌تواند برای پروژه خودش پیشنهاد ثبت کند";
                    return result;
                }

                if (project.Status is not (ProjectStatus.Published or ProjectStatus.Bidding))
                {
                    result.Status = false;
                    result.ErrorMessage = "این پروژه دیگر در مرحله دریافت پیشنهاد نیست";
                    return result;
                }

                bool hasContract = await _context.Contracts.AnyAsync(x => x.ProjectId == proposal.ProjectId);
                if (hasContract)
                {
                    result.Status = false;
                    result.ErrorMessage = "برای این پروژه قبلاً قرارداد ساخته شده است";
                    return result;
                }

                bool alreadySent = await _context.Proposals.AnyAsync(x => x.ProjectId == proposal.ProjectId && x.FreelancerUserId == proposal.FreelancerUserId);
                if (alreadySent)
                {
                    result.Status = false;
                    result.ErrorMessage = "برای این پروژه قبلاً پیشنهاد ثبت کرده‌اید";
                    return result;
                }

                await _context.Proposals.AddAsync(proposal);
                await _context.SaveChangesAsync();
                result.ID = proposal.ID;
                _context.Entry(proposal).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditProjectAsync(Project project, long employerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var current = await _context.Projects.SingleOrDefaultAsync(x => x.ID == project.ID && x.EmployerUserId == employerUserId);
                if (current == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پروژه پیدا نشد یا شما دسترسی ویرایش ندارید";
                    return result;
                }

                bool hasContract = await _context.Contracts.AnyAsync(x => x.ProjectId == current.ID);
                if (hasContract)
                {
                    result.Status = false;
                    result.ErrorMessage = "بعد از ساخت قرارداد امکان ویرایش پروژه وجود ندارد";
                    return result;
                }

                current.OrganizationId = project.OrganizationId;
                current.Title = project.Title;
                current.Description = project.Description;
                current.CategoryId = project.CategoryId;
                current.ProjectType = project.ProjectType;
                current.BudgetMin = project.BudgetMin;
                current.BudgetMax = project.BudgetMax;
                current.Currency = project.Currency;
                current.TimelineDays = project.TimelineDays;
                current.DeadlineAt = project.DeadlineAt;
                current.LocationMode = project.LocationMode;
                current.CityId = project.CityId;
                current.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = current.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Project>> GetUserProjectsAsync(long employerUserId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Project> results = new ListResultObject<Project>();
            try
            {
                var query = _context.Projects
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.Skills)
                        .ThenInclude(x => x.Tag)
                    .Include(x => x.Organization)
                    .Where(x => x.EmployerUserId == employerUserId && x.DeleteDate == null);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
                await PopulateProposalCountsAsync(results.Results);
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<ListResultObject<Proposal>> GetUserProposalsAsync(long freelancerUserId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Proposal> results = new ListResultObject<Proposal>();
            try
            {
                var query = _context.Proposals
                    .AsNoTracking()
                    .Include(x => x.Project)
                        .ThenInclude(x => x.Contract)
                    .Where(x => x.FreelancerUserId == freelancerUserId);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<ListResultObject<Project>> GetAllProjectsAsync(
            ProjectStatus? status = null,
            long categoryId = 0,
            decimal? minBudget = null,
            decimal? maxBudget = null,
            long skillTagId = 0,
            ProjectType? projectType = null,
            LocationMode? locationMode = null,
            DateTime? deadlineFrom = null,
            DateTime? deadlineTo = null,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "")
        {
            ListResultObject<Project> results = new ListResultObject<Project>();
            try
            {
                IQueryable<Project> query = _context.Projects
                    .AsNoTracking()
                    .Include(x => x.EmployerUser)
                    .Include(x => x.Organization)
                    .Include(x => x.Category)
                    .Include(x => x.City)
                    .Include(x => x.Skills)
                        .ThenInclude(x => x.Tag)
                    .Where(x =>
                        (status == null
                            ? (x.Status == ProjectStatus.Published || x.Status == ProjectStatus.Bidding) && x.Contract == null
                            : x.Status == status) &&
                        x.IsActive &&
                        x.DeleteDate == null &&
                        (categoryId <= 0 || x.CategoryId == categoryId) &&
                        (skillTagId <= 0 || x.Skills.Any(skill => skill.TagId == skillTagId)) &&
                        (minBudget == null || (x.BudgetMax ?? x.BudgetMin ?? 0) >= minBudget) &&
                        (maxBudget == null || (x.BudgetMin ?? x.BudgetMax ?? 0) <= maxBudget) &&
                        (projectType == null || x.ProjectType == projectType) &&
                        (locationMode == null || x.LocationMode == locationMode) &&
                        (deadlineFrom == null || x.DeadlineAt >= deadlineFrom) &&
                        (deadlineTo == null || x.DeadlineAt <= deadlineTo) &&
                        (string.IsNullOrEmpty(searchText) ||
                         x.Title.Contains(searchText) ||
                         (x.Description != null && x.Description.Contains(searchText))));

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.PublishedAt ?? x.CreateDate)
                    .SortBy(sortQuery)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
                await PopulateProposalCountsAsync(results.Results);
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<Project>> GetProjectByIdAsync(long projectId)
        {
            RowResultObject<Project> result = new RowResultObject<Project>();
            try
            {
                result.Result = await _context.Projects
                    .AsNoTracking()
                    .AsSplitQuery()
                    .Include(x => x.EmployerUser)
                    .Include(x => x.Organization)
                    .Include(x => x.Category)
                    .Include(x => x.City)
                    .Include(x => x.Proposals)
                        .ThenInclude(x => x.FreelancerUser)
                    .Include(x => x.Skills)
                        .ThenInclude(x => x.Tag)
                    .Include(x => x.Assignment)
                    .Include(x => x.Contract)
                        .ThenInclude(x => x!.Milestones)
                            .ThenInclude(x => x.Deliverables)
                                .ThenInclude(x => x.FileUpload)
                    .Include(x => x.Contract)
                        .ThenInclude(x => x!.Timesheets)
                            .ThenInclude(x => x.User)
                    .SingleOrDefaultAsync(x => x.ID == projectId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        private async Task PopulateProposalCountsAsync(ICollection<Project>? projects)
        {
            if (projects == null || projects.Count == 0)
            {
                return;
            }

            var projectIds = projects.Select(x => x.ID).ToList();
            var counts = await _context.Proposals
                .AsNoTracking()
                .Where(x => projectIds.Contains(x.ProjectId))
                .GroupBy(x => x.ProjectId)
                .Select(group => new { ProjectId = group.Key, Count = group.Count() })
                .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

            foreach (var project in projects)
            {
                project.QueryProposalsCount = counts.GetValueOrDefault(project.ID);
            }
        }

        public async Task<ListResultObject<Proposal>> GetProjectProposalsAsync(long projectId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Proposal> results = new ListResultObject<Proposal>();
            try
            {
                var query = _context.Proposals
                    .AsNoTracking()
                    .Include(x => x.FreelancerUser)
                    .Where(x => x.ProjectId == projectId);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.CreateDate)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> PublishProjectAsync(long projectId, long employerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var project = await _context.Projects.SingleOrDefaultAsync(x => x.ID == projectId && x.EmployerUserId == employerUserId);
                if (project == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پروژه پیدا نشد یا شما دسترسی انتشار ندارید";
                    return result;
                }

                project.Status = ProjectStatus.Published;
                project.PublishedAt ??= DateTime.Now;
                project.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = project.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveProjectAsync(long projectId, long employerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var project = await _context.Projects.SingleOrDefaultAsync(x => x.ID == projectId && x.EmployerUserId == employerUserId);
                if (project == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پروژه پیدا نشد یا شما دسترسی حذف ندارید";
                    return result;
                }

                project.DeleteDate = DateTime.Now;
                project.IsActive = false;
                await _context.SaveChangesAsync();
                result.ID = project.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> UpdateProposalStatusAsync(long proposalId, ProposalStatus status, long employerUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var proposal = await _context.Proposals
                    .Include(x => x.Project)
                    .SingleOrDefaultAsync(x => x.ID == proposalId && x.Project.EmployerUserId == employerUserId);
                if (proposal == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پیشنهاد پیدا نشد یا شما دسترسی تغییر وضعیت ندارید";
                    return result;
                }

                proposal.Status = status;
                proposal.UpdateDate = DateTime.Now;
                await _context.SaveChangesAsync();
                result.ID = proposal.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> AcceptProposalAsync(long proposalId, long employerUserId, IReadOnlyList<Milestone> milestones)
        {
            BitResultObject result = new BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var proposal = await _context.Proposals
                    .Include(x => x.Project)
                    .SingleOrDefaultAsync(x => x.ID == proposalId && x.Project.EmployerUserId == employerUserId);

                if (proposal == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "پیشنهاد پیدا نشد یا شما دسترسی پذیرش ندارید";
                    return result;
                }

                if (proposal.Project.Status is ProjectStatus.Done or ProjectStatus.Cancelled)
                {
                    result.Status = false;
                    result.ErrorMessage = "وضعیت پروژه اجازه پذیرش پیشنهاد را نمی‌دهد";
                    return result;
                }

                bool hasContract = await _context.Contracts.AnyAsync(x => x.ProjectId == proposal.ProjectId);
                if (hasContract)
                {
                    result.Status = false;
                    result.ErrorMessage = "برای این پروژه قبلاً قرارداد ساخته شده است";
                    return result;
                }

                proposal.Status = ProposalStatus.Accepted;
                proposal.UpdateDate = DateTime.UtcNow;

                var otherProposals = await _context.Proposals
                    .Where(x => x.ProjectId == proposal.ProjectId && x.ID != proposal.ID && x.Status != ProposalStatus.Withdrawn)
                    .ToListAsync();

                foreach (var item in otherProposals)
                {
                    item.Status = ProposalStatus.Rejected;
                    item.UpdateDate = DateTime.UtcNow;
                }

                proposal.Project.Status = ProjectStatus.Assigned;
                proposal.Project.ClosedAt = DateTime.UtcNow;
                proposal.Project.UpdateDate = DateTime.UtcNow;

                var assignment = new ProjectAssignment
                {
                    ProjectId = proposal.ProjectId,
                    AssigneeType = AssigneeType.User,
                    AssigneeUserId = proposal.FreelancerUserId,
                    AcceptedAt = DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };

                var contract = new Contract
                {
                    ProjectId = proposal.ProjectId,
                    EmployerUserId = employerUserId,
                    ContractorUserId = proposal.FreelancerUserId,
                    Status = ContractStatus.Active,
                    TermsJson = proposal.CoverLetter,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };

                await _context.ProjectAssignments.AddAsync(assignment);
                await _context.Contracts.AddAsync(contract);
                await _context.SaveChangesAsync();

                var contractMilestones = milestones.Count > 0
                    ? milestones
                    : new List<Milestone>
                    {
                        new Milestone
                        {
                            Title = "مرحله اصلی پروژه",
                            Description = "اجرای کامل پروژه طبق پیشنهاد پذیرفته شده و معیارهای توافق شده در قرارداد.",
                            Amount = proposal.ProposedPrice,
                            StartsAt = DateTime.UtcNow,
                            DueAt = DateTime.UtcNow.AddDays(proposal.ProposedDays),
                            DurationDays = proposal.ProposedDays,
                            Status = MilestoneStatus.Pending
                        }
                    };

                foreach (var milestone in contractMilestones)
                {
                    milestone.ContractId = contract.ID;
                    if (milestone.DurationDays.HasValue && !milestone.DueAt.HasValue)
                    {
                        milestone.StartsAt ??= DateTime.UtcNow;
                        milestone.DueAt = milestone.StartsAt.Value.AddDays(milestone.DurationDays.Value);
                    }
                    milestone.Status = MilestoneStatus.Pending;
                    milestone.CreateDate = DateTime.UtcNow;
                    milestone.UpdateDate = DateTime.UtcNow;
                    milestone.IsActive = true;
                }

                await _context.Milestones.AddRangeAsync(contractMilestones);
                await _context.Notifications.AddAsync(new Notification
                {
                    UserId = proposal.FreelancerUserId,
                    Message = $"پیشنهاد شما برای پروژه «{proposal.Project.Title}» پذیرفته شد و قرارداد ساخته شد.",
                    IsRead = false,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });
                await _context.Notifications.AddAsync(new Notification
                {
                    UserId = employerUserId,
                    Message = $"قرارداد پروژه «{proposal.Project.Title}» با مجری انتخاب‌شده ساخته شد.",
                    IsRead = false,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });
                await _context.SaveChangesAsync();
                await tx.CommitAsync();

                result.ID = contract.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Milestone>> GetContractMilestonesAsync(long contractId, long userId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Milestone> results = new ListResultObject<Milestone>();
            try
            {
                var contract = await _context.Contracts
                    .AsNoTracking()
                    .SingleOrDefaultAsync(x => x.ID == contractId && (x.EmployerUserId == userId || x.ContractorUserId == userId));

                if (contract == null)
                {
                    results.Status = false;
                    results.ErrorMessage = "قرارداد پیدا نشد یا شما دسترسی ندارید";
                    return results;
                }

                var query = _context.Milestones
                    .AsNoTracking()
                    .Include(x => x.Deliverables)
                        .ThenInclude(x => x.FileUpload)
                    .Where(x => x.ContractId == contractId);
                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderBy(x => x.DueAt ?? x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> AddMilestoneAsync(long contractId, long userId, Milestone milestone)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                bool canManage = await _context.Contracts.AnyAsync(x => x.ID == contractId && x.EmployerUserId == userId && x.Status != ContractStatus.Completed);
                if (!canManage)
                {
                    result.Status = false;
                    result.ErrorMessage = "قرارداد پیدا نشد یا شما دسترسی افزودن مرحله ندارید";
                    return result;
                }

                milestone.ContractId = contractId;
                if (milestone.DurationDays.HasValue && !milestone.DueAt.HasValue)
                {
                    milestone.StartsAt ??= DateTime.UtcNow;
                    milestone.DueAt = milestone.StartsAt.Value.AddDays(milestone.DurationDays.Value);
                }
                milestone.Status = MilestoneStatus.Pending;
                milestone.CreateDate = DateTime.UtcNow;
                milestone.UpdateDate = DateTime.UtcNow;
                milestone.IsActive = true;

                await _context.Milestones.AddAsync(milestone);
                await _context.SaveChangesAsync();
                result.ID = milestone.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> UpdateMilestoneStatusAsync(long milestoneId, long userId, MilestoneStatus status)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var milestone = await _context.Milestones
                    .Include(x => x.Contract)
                    .SingleOrDefaultAsync(x => x.ID == milestoneId && (x.Contract.EmployerUserId == userId || x.Contract.ContractorUserId == userId));

                if (milestone == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "مرحله پیدا نشد یا شما دسترسی ندارید";
                    return result;
                }

                bool isEmployer = milestone.Contract.EmployerUserId == userId;
                bool isContractor = milestone.Contract.ContractorUserId == userId;

                if (status is MilestoneStatus.Approved or MilestoneStatus.Rejected)
                {
                    if (!isEmployer)
                    {
                        result.Status = false;
                        result.ErrorMessage = "فقط کارفرما می‌تواند مرحله را تایید یا رد کند";
                        return result;
                    }
                }
                else if (status is MilestoneStatus.InProgress or MilestoneStatus.Submitted)
                {
                    if (!isContractor && !isEmployer)
                    {
                        result.Status = false;
                        result.ErrorMessage = "شما دسترسی تغییر وضعیت این مرحله را ندارید";
                        return result;
                    }
                }

                milestone.Status = status;
                milestone.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                result.ID = milestone.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }
    }
}
