using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Admin
{
    public class AdminReportRange
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }

    public class MetricPointResponse
    {
        public string Label { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Amount { get; set; }
    }

    public class AdminBiDashboardResponse
    {
        public AdminReportRange Range { get; set; } = new();
        public ActiveUsersReportResponse Users { get; set; } = new();
        public FinanceReportResponse Finance { get; set; } = new();
        public ProjectPerformanceReportResponse Projects { get; set; } = new();
        public ServiceSalesReportResponse Services { get; set; } = new();
        public EducationReportResponse Education { get; set; } = new();
        public InvestmentReportSummaryResponse Investments { get; set; } = new();
        public DisputeReportResponse Disputes { get; set; } = new();
        public List<MetricPointResponse> DailyActivity { get; set; } = new();
    }

    public class ActiveUsersReportResponse
    {
        public int TotalUsers { get; set; }
        public int NewUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int VerifiedUsers { get; set; }
        public int SuspendedUsers { get; set; }
        public List<MetricPointResponse> NewUsersByDay { get; set; } = new();
    }

    public class FinanceReportResponse
    {
        public int TransactionCount { get; set; }
        public decimal TransactionVolume { get; set; }
        public decimal DepositVolume { get; set; }
        public decimal PaymentVolume { get; set; }
        public decimal RefundVolume { get; set; }
        public decimal PlatformFeeRevenue { get; set; }
        public int HeldEscrows { get; set; }
        public decimal HeldEscrowAmount { get; set; }
        public List<MetricPointResponse> VolumeByDay { get; set; } = new();
    }

    public class ProjectPerformanceReportResponse
    {
        public int TotalProjects { get; set; }
        public int NewProjects { get; set; }
        public int PublishedProjects { get; set; }
        public int InProgressProjects { get; set; }
        public int DoneProjects { get; set; }
        public int CancelledProjects { get; set; }
        public int SubmittedProposals { get; set; }
        public int ActiveContracts { get; set; }
        public int CompletedContracts { get; set; }
        public List<MetricPointResponse> ProjectsByStatus { get; set; } = new();
    }

    public class ServiceSalesReportResponse
    {
        public int TotalOrders { get; set; }
        public int PaidOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal SalesVolume { get; set; }
        public decimal CompletedSalesVolume { get; set; }
        public List<MetricPointResponse> OrdersByStatus { get; set; } = new();
    }

    public class EducationReportResponse
    {
        public int PublishedCourses { get; set; }
        public int NewEnrollments { get; set; }
        public int ActiveEnrollments { get; set; }
        public int CompletedEnrollments { get; set; }
        public decimal EnrollmentRevenue { get; set; }
        public int ConfirmedTeacherBookings { get; set; }
        public int CompletedTeacherBookings { get; set; }
        public decimal TeacherBookingRevenue { get; set; }
    }

    public class InvestmentReportSummaryResponse
    {
        public int TotalOpportunities { get; set; }
        public int OpenOpportunities { get; set; }
        public int FundedOpportunities { get; set; }
        public int ClosedOpportunities { get; set; }
        public decimal RequiredCapital { get; set; }
        public decimal RaisedCapital { get; set; }
        public decimal AverageExpectedRoiPercent { get; set; }
        public decimal AverageReportedRoiPercent { get; set; }
        public int FundedCommitments { get; set; }
        public decimal FundedCommitmentAmount { get; set; }
        public List<MetricPointResponse> OpportunitiesByStage { get; set; } = new();
    }

    public class DisputeReportResponse
    {
        public int TotalDisputes { get; set; }
        public int OpenDisputes { get; set; }
        public int UnderReviewDisputes { get; set; }
        public int DecidedDisputes { get; set; }
        public int ClosedDisputes { get; set; }
        public List<MetricPointResponse> DisputesByContext { get; set; } = new();
    }

    public class AdminInvestmentStatusRequest
    {
        public InvestmentOpportunityStatus Status { get; set; }
        public string? Note { get; set; }
    }
}
