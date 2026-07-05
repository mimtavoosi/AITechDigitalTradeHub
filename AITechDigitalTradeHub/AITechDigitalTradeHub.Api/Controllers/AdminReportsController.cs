using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels.Admin;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Authorize(Roles = RoleNames.Admin + "," + RoleNames.SuperAdmin)]
    [Route("api/admin/reports")]
    public class AdminReportsController : ControllerBase
    {
        private readonly TheAppContext _context;

        public AdminReportsController(TheAppContext context)
        {
            _context = context;
        }

        [HttpGet("bi-dashboard")]
        public async Task<IActionResult> GetBiDashboard([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            var range = NormalizeRange(from, to);
            var response = new AdminBiDashboardResponse
            {
                Range = range,
                Users = await BuildActiveUsersReportAsync(range),
                Finance = await BuildFinanceReportAsync(range),
                Projects = await BuildProjectReportAsync(range),
                Services = await BuildServiceSalesReportAsync(range),
                Education = await BuildEducationReportAsync(range),
                Investments = await BuildInvestmentReportAsync(range),
                Disputes = await BuildDisputeReportAsync(range),
                DailyActivity = await BuildDailyActivityAsync(range)
            };

            return Ok(new RowResultObject<AdminBiDashboardResponse> { Result = response });
        }

        [HttpGet("active-users")]
        public async Task<IActionResult> GetActiveUsers([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<ActiveUsersReportResponse> { Result = await BuildActiveUsersReportAsync(NormalizeRange(from, to)) });
        }

        [HttpGet("finance")]
        public async Task<IActionResult> GetFinance([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<FinanceReportResponse> { Result = await BuildFinanceReportAsync(NormalizeRange(from, to)) });
        }

        [HttpGet("projects")]
        public async Task<IActionResult> GetProjects([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<ProjectPerformanceReportResponse> { Result = await BuildProjectReportAsync(NormalizeRange(from, to)) });
        }

        [HttpGet("services")]
        public async Task<IActionResult> GetServices([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<ServiceSalesReportResponse> { Result = await BuildServiceSalesReportAsync(NormalizeRange(from, to)) });
        }

        [HttpGet("education")]
        public async Task<IActionResult> GetEducation([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<EducationReportResponse> { Result = await BuildEducationReportAsync(NormalizeRange(from, to)) });
        }

        [HttpGet("investments")]
        public async Task<IActionResult> GetInvestments([FromQuery] DateTime? from = null, [FromQuery] DateTime? to = null)
        {
            return Ok(new RowResultObject<InvestmentReportSummaryResponse> { Result = await BuildInvestmentReportAsync(NormalizeRange(from, to)) });
        }

        private async Task<ActiveUsersReportResponse> BuildActiveUsersReportAsync(AdminReportRange range)
        {
            var usersInRange = _context.Users.AsNoTracking().Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var activeActorIds = await _context.AnalyticsEvents
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.UserId.HasValue && x.CreateDate >= range.From && x.CreateDate < range.To)
                .Select(x => x.UserId!.Value)
                .Distinct()
                .ToListAsync();

            return new ActiveUsersReportResponse
            {
                TotalUsers = await _context.Users.CountAsync(x => x.DeleteDate == null),
                NewUsers = await usersInRange.CountAsync(),
                ActiveUsers = activeActorIds.Count,
                VerifiedUsers = await _context.Users.CountAsync(x => x.DeleteDate == null && x.IsVerified),
                SuspendedUsers = await _context.Users.CountAsync(x => x.DeleteDate == null && x.Status != UserStatus.Active),
                NewUsersByDay = await CountByDayAsync(usersInRange.Select(x => x.CreateDate))
            };
        }

        private async Task<FinanceReportResponse> BuildFinanceReportAsync(AdminReportRange range)
        {
            var transactions = _context.Transactions.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.Status == TransactionStatus.Success && x.CreateDate >= range.From && x.CreateDate < range.To);
            var escrows = _context.Escrows.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.Status == EscrowStatus.Held);

            return new FinanceReportResponse
            {
                TransactionCount = await transactions.CountAsync(),
                TransactionVolume = await transactions.SumAsync(x => Math.Abs(x.Amount)),
                DepositVolume = await transactions.Where(x => x.TxType == TransactionType.Deposit).SumAsync(x => Math.Abs(x.Amount)),
                PaymentVolume = await transactions.Where(x => x.TxType == TransactionType.Payment).SumAsync(x => Math.Abs(x.Amount)),
                RefundVolume = await transactions.Where(x => x.TxType == TransactionType.Refund).SumAsync(x => Math.Abs(x.Amount)),
                PlatformFeeRevenue = await transactions.Where(x => x.TxType == TransactionType.Fee).SumAsync(x => Math.Abs(x.Amount)),
                HeldEscrows = await escrows.CountAsync(),
                HeldEscrowAmount = await escrows.SumAsync(x => x.Amount),
                VolumeByDay = await SumByDayAsync(transactions.Select(x => new MetricSource { CreateDate = x.CreateDate, Amount = Math.Abs(x.Amount) }))
            };
        }

        private async Task<ProjectPerformanceReportResponse> BuildProjectReportAsync(AdminReportRange range)
        {
            var projectsInRange = _context.Projects.AsNoTracking().Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var allProjects = _context.Projects.AsNoTracking().Where(x => x.DeleteDate == null);
            var statusCounts = await allProjects
                .GroupBy(x => x.Status)
                .Select(x => new MetricPointResponse { Label = x.Key.ToString(), Count = x.Count() })
                .ToListAsync();

            return new ProjectPerformanceReportResponse
            {
                TotalProjects = await allProjects.CountAsync(),
                NewProjects = await projectsInRange.CountAsync(),
                PublishedProjects = await allProjects.CountAsync(x => x.Status == ProjectStatus.Published),
                InProgressProjects = await allProjects.CountAsync(x => x.Status == ProjectStatus.InProgress),
                DoneProjects = await allProjects.CountAsync(x => x.Status == ProjectStatus.Done),
                CancelledProjects = await allProjects.CountAsync(x => x.Status == ProjectStatus.Cancelled),
                SubmittedProposals = await _context.Proposals.CountAsync(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To),
                ActiveContracts = await _context.Contracts.CountAsync(x => x.DeleteDate == null && x.Status == ContractStatus.Active),
                CompletedContracts = await _context.Contracts.CountAsync(x => x.DeleteDate == null && x.Status == ContractStatus.Completed),
                ProjectsByStatus = statusCounts
            };
        }

        private async Task<ServiceSalesReportResponse> BuildServiceSalesReportAsync(AdminReportRange range)
        {
            var orders = _context.Orders.AsNoTracking().Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var paidStatuses = new[] { OrderStatus.Paid, OrderStatus.InProgress, OrderStatus.Delivered, OrderStatus.Completed };
            var statusCounts = await orders
                .GroupBy(x => x.Status)
                .Select(x => new MetricPointResponse { Label = x.Key.ToString(), Count = x.Count(), Amount = x.Sum(o => o.PriceAmount * o.Qty) })
                .ToListAsync();

            return new ServiceSalesReportResponse
            {
                TotalOrders = await orders.CountAsync(),
                PaidOrders = await orders.CountAsync(x => paidStatuses.Contains(x.Status)),
                CompletedOrders = await orders.CountAsync(x => x.Status == OrderStatus.Completed),
                CancelledOrders = await orders.CountAsync(x => x.Status == OrderStatus.Cancelled || x.Status == OrderStatus.Refunded),
                SalesVolume = await orders.Where(x => paidStatuses.Contains(x.Status)).SumAsync(x => x.PriceAmount * x.Qty),
                CompletedSalesVolume = await orders.Where(x => x.Status == OrderStatus.Completed).SumAsync(x => x.PriceAmount * x.Qty),
                OrdersByStatus = statusCounts
            };
        }

        private async Task<EducationReportResponse> BuildEducationReportAsync(AdminReportRange range)
        {
            var enrollments = _context.CourseEnrollments.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var bookings = _context.TeacherBookings.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);

            return new EducationReportResponse
            {
                PublishedCourses = await _context.Courses.CountAsync(x => x.DeleteDate == null && x.Status == CourseStatus.Published),
                NewEnrollments = await enrollments.CountAsync(),
                ActiveEnrollments = await enrollments.CountAsync(x => x.Status == EnrollmentStatus.Active),
                CompletedEnrollments = await enrollments.CountAsync(x => x.Status == EnrollmentStatus.Completed),
                EnrollmentRevenue = await enrollments.Where(x => x.Status == EnrollmentStatus.Active || x.Status == EnrollmentStatus.Completed).SumAsync(x => x.PaidAmount),
                ConfirmedTeacherBookings = await bookings.CountAsync(x => x.Status == TeacherBookingStatus.Confirmed),
                CompletedTeacherBookings = await bookings.CountAsync(x => x.Status == TeacherBookingStatus.Completed),
                TeacherBookingRevenue = await bookings.Where(x => x.Status == TeacherBookingStatus.Confirmed || x.Status == TeacherBookingStatus.Completed).SumAsync(x => x.PriceAmount)
            };
        }

        private async Task<InvestmentReportSummaryResponse> BuildInvestmentReportAsync(AdminReportRange range)
        {
            var opportunities = _context.InvestmentOpportunities.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var commitments = _context.InvestmentCommitments.AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var fundedCommitments = commitments.Where(x => x.Status == InvestmentCommitmentStatus.Funded);
            var stageCounts = await _context.InvestmentOpportunities
                .AsNoTracking()
                .Where(x => x.DeleteDate == null)
                .GroupBy(x => x.Stage)
                .Select(x => new MetricPointResponse { Label = x.Key.ToString(), Count = x.Count(), Amount = x.Sum(o => o.RaisedCapital ?? 0) })
                .ToListAsync();
            var expectedRois = await opportunities
                .Where(x => x.ExpectedRoiPercent.HasValue)
                .Select(x => x.ExpectedRoiPercent!.Value)
                .ToListAsync();
            var reportedRois = await _context.InvestmentReports
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.ReportedAt >= range.From && x.ReportedAt < range.To && x.RoiPercent.HasValue)
                .Select(x => x.RoiPercent!.Value)
                .ToListAsync();

            return new InvestmentReportSummaryResponse
            {
                TotalOpportunities = await opportunities.CountAsync(),
                OpenOpportunities = await opportunities.CountAsync(x => x.Status == InvestmentOpportunityStatus.Open),
                FundedOpportunities = await opportunities.CountAsync(x => x.Status == InvestmentOpportunityStatus.Funded),
                ClosedOpportunities = await opportunities.CountAsync(x => x.Status == InvestmentOpportunityStatus.Closed),
                RequiredCapital = await opportunities.SumAsync(x => x.RequiredCapital),
                RaisedCapital = await opportunities.SumAsync(x => x.RaisedCapital ?? 0),
                AverageExpectedRoiPercent = expectedRois.Count == 0 ? 0 : Math.Round(expectedRois.Average(), 2),
                AverageReportedRoiPercent = reportedRois.Count == 0 ? 0 : Math.Round(reportedRois.Average(), 2),
                FundedCommitments = await fundedCommitments.CountAsync(),
                FundedCommitmentAmount = await fundedCommitments.SumAsync(x => x.Amount),
                OpportunitiesByStage = stageCounts
            };
        }

        private async Task<DisputeReportResponse> BuildDisputeReportAsync(AdminReportRange range)
        {
            var disputes = _context.Disputes.AsNoTracking().Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To);
            var contextCounts = await disputes
                .GroupBy(x => x.ContextType)
                .Select(x => new MetricPointResponse { Label = x.Key.ToString(), Count = x.Count() })
                .ToListAsync();

            return new DisputeReportResponse
            {
                TotalDisputes = await disputes.CountAsync(),
                OpenDisputes = await disputes.CountAsync(x => x.Status == DisputeStatus.Open),
                UnderReviewDisputes = await disputes.CountAsync(x => x.Status == DisputeStatus.UnderReview || x.Status == DisputeStatus.WaitingForEvidence),
                DecidedDisputes = await disputes.CountAsync(x => x.Status == DisputeStatus.Decided),
                ClosedDisputes = await disputes.CountAsync(x => x.Status == DisputeStatus.Closed),
                DisputesByContext = contextCounts
            };
        }

        private async Task<List<MetricPointResponse>> BuildDailyActivityAsync(AdminReportRange range)
        {
            var events = await CountByDayAsync(_context.AnalyticsEvents
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To)
                .Select(x => x.CreateDate));
            var projectLogs = await CountByDayAsync(_context.ProjectActivityLogs
                .AsNoTracking()
                .Where(x => x.DeleteDate == null && x.CreateDate >= range.From && x.CreateDate < range.To)
                .Select(x => x.CreateDate));

            return events.Concat(projectLogs)
                .GroupBy(x => x.Label)
                .Select(x => new MetricPointResponse { Label = x.Key, Count = x.Sum(p => p.Count), Amount = x.Sum(p => p.Amount) })
                .OrderBy(x => x.Label)
                .ToList();
        }

        private static AdminReportRange NormalizeRange(DateTime? from, DateTime? to)
        {
            var normalizedTo = (to ?? DateTime.UtcNow).Date.AddDays(1);
            var normalizedFrom = (from ?? normalizedTo.AddDays(-30)).Date;
            if (normalizedFrom >= normalizedTo)
            {
                normalizedFrom = normalizedTo.AddDays(-30);
            }

            return new AdminReportRange { From = normalizedFrom, To = normalizedTo };
        }

        private static async Task<List<MetricPointResponse>> CountByDayAsync(IQueryable<DateTime?> query)
        {
            var rows = await query
                .Where(x => x.HasValue)
                .GroupBy(x => x!.Value.Date)
                .OrderBy(x => x.Key)
                .Select(x => new { Date = x.Key, Count = x.Count() })
                .ToListAsync();

            return rows
                .Select(x => new MetricPointResponse { Label = x.Date.ToString("yyyy-MM-dd"), Count = x.Count })
                .ToList();
        }

        private static async Task<List<MetricPointResponse>> SumByDayAsync(IQueryable<MetricSource> query)
        {
            var rows = await query
                .Where(x => x.CreateDate.HasValue)
                .GroupBy(x => x.CreateDate!.Value.Date)
                .OrderBy(x => x.Key)
                .Select(x => new { Date = x.Key, Count = x.Count(), Amount = x.Sum(p => p.Amount) })
                .ToListAsync();

            return rows
                .Select(x => new MetricPointResponse { Label = x.Date.ToString("yyyy-MM-dd"), Count = x.Count, Amount = x.Amount })
                .ToList();
        }

        private class MetricSource
        {
            public DateTime? CreateDate { get; set; }
            public decimal Amount { get; set; }
        }
    }
}
