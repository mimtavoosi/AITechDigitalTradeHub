using AiTech.Domains;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;
using MTPermissionCenter.EFCore;
using MTPermissionCenter.EFCore.Entities;
using NobatPlusDATA.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer
{
    public class TheAppContext : DbContext
    {
        public TheAppContext()
        {

        }

        public TheAppContext(DbContextOptions<TheAppContext> options)
            : base(options)
        {
        }

        #region BaseTables

        public DbSet<Address> Addresses { get; set; }
        public DbSet<AdminReport> AdminReports { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<FileUpload> FileUploads { get; set; }
        public DbSet<VerificationDocument> VerificationDocuments { get; set; }
        public DbSet<PortfolioItem> PortfolioItems { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<LoginMethod> LoginMethods { get; set; }
        public DbSet<Log> Logs { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PaymentHistory> PaymentHistories { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Setting> Settings { get; set; }
        public DbSet<Ticket> Tickets { get; set; }
        public DbSet<TicketMessage> TicketMessages { get; set; }
        public DbSet<TicketAttachment> TicketAttachments { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Token> Tokens { get; set; }
        public DbSet<SMSMessage> SMSMessages { get; set; }

        #endregion

        #region PermissionTables

        public DbSet<MTPermissionCenter_Permission> Permissions { get; set; }
        public DbSet<MTPermissionCenter_PermissionRole> PermissionRoles { get; set; }
        public DbSet<MTPermissionCenter_UserPermission> UserPermissions { get; set; }

        #endregion


        #region Beausiness

        // -----------------------------
        // Market
        // -----------------------------
        public DbSet<Listing> Listings { get; set; }
        public DbSet<ListingProductDetails> ListingProductDetails { get; set; }
        public DbSet<ListingServiceDetails> ListingServiceDetails { get; set; }
        public DbSet<EquipmentRentalDetails> EquipmentRentalDetails { get; set; }
        public DbSet<ServicePackage> ServicePackages { get; set; }

        public DbSet<Tag> Tags { get; set; }
        public DbSet<ListingTag> ListingTags { get; set; }
        public DbSet<ListingSave> ListingSaves { get; set; }
        public DbSet<ListingQuestion> ListingQuestions { get; set; }
        public DbSet<ListingAnswer> ListingAnswers { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderEvent> OrderEvents { get; set; }
        public DbSet<OrderMilestone> OrderMilestones { get; set; }

        // -----------------------------
        // Projects
        // -----------------------------
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectSkill> ProjectSkills { get; set; }
        public DbSet<ProjectActivityLog> ProjectActivityLogs { get; set; }
        public DbSet<Proposal> Proposals { get; set; }
        public DbSet<ProjectAssignment> ProjectAssignments { get; set; }
        public DbSet<Contract> Contracts { get; set; }
        public DbSet<Milestone> Milestones { get; set; }
        public DbSet<Deliverable> Deliverables { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }

        // -----------------------------
        // Organization
        // -----------------------------
        public DbSet<Organization> Organizations { get; set; }
        public DbSet<OrganizationInvitation> OrganizationInvitations { get; set; }
        public DbSet<OrganizationMember> OrganizationMembers { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<Affiliation> Affiliations { get; set; }
        public DbSet<OrganizationPaymentRequest> OrganizationPaymentRequests { get; set; }

        // -----------------------------
        // Finance
        // -----------------------------
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Escrow> Escrows { get; set; }
        public DbSet<PayoutRequest> PayoutRequests { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<InvoiceLine> InvoiceLines { get; set; }
        public DbSet<PlatformFeeRule> PlatformFeeRules { get; set; }

        // -----------------------------
        // Chat
        // -----------------------------
        public DbSet<Conversation> Conversations { get; set; }
        public DbSet<ConversationMember> ConversationMembers { get; set; }
        public DbSet<Message> Messages { get; set; }

        // -----------------------------
        // Reviews
        // -----------------------------
        public DbSet<Review> Reviews { get; set; }
        public DbSet<RatingAggregate> RatingAggregates { get; set; }
        public DbSet<Badge> Badges { get; set; }
        public DbSet<BadgeAssignment> BadgeAssignments { get; set; }

        // -----------------------------
        // Moderation
        // -----------------------------
        public DbSet<Report> Reports { get; set; }
        public DbSet<ModerationAction> ModerationActions { get; set; }

        // -----------------------------
        // Analytics
        // -----------------------------
        public DbSet<AnalyticsEvent> AnalyticsEvents { get; set; }

        // -----------------------------
        // Education
        // -----------------------------
        public DbSet<InstructorProfile> InstructorProfiles { get; set; }
        public DbSet<Course> Courses { get; set; }
        public DbSet<CourseLesson> CourseLessons { get; set; }
        public DbSet<CourseEnrollment> CourseEnrollments { get; set; }
        public DbSet<TeacherAvailabilitySlot> TeacherAvailabilitySlots { get; set; }
        public DbSet<TeacherBooking> TeacherBookings { get; set; }

        // -----------------------------
        // Investment
        // -----------------------------
        public DbSet<InvestorProfile> InvestorProfiles { get; set; }
        public DbSet<InvestmentOpportunity> InvestmentOpportunities { get; set; }
        public DbSet<InvestmentDocument> InvestmentDocuments { get; set; }
        public DbSet<InvestmentCommitment> InvestmentCommitments { get; set; }
        public DbSet<InvestmentTranche> InvestmentTranches { get; set; }
        public DbSet<InvestmentReport> InvestmentReports { get; set; }
        public DbSet<InvestmentContract> InvestmentContracts { get; set; }

        // -----------------------------
        // Disputes / Arbitration
        // -----------------------------
        public DbSet<Dispute> Disputes { get; set; }
        public DbSet<DisputeEvidence> DisputeEvidenceItems { get; set; }
        public DbSet<ArbitrationDecision> ArbitrationDecisions { get; set; }

        // -----------------------------
        // Supply Chain
        // -----------------------------
        public DbSet<ResourceAllocation> ResourceAllocations { get; set; }
        public DbSet<ResourceReservation> ResourceReservations { get; set; }
        public DbSet<ValueFlowEvent> ValueFlowEvents { get; set; }

        #endregion


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
                ConfigurationHelper configurationHelper = new ConfigurationHelper();
                optionsBuilder.UseSqlServer(configurationHelper.GetConnectionString("publicdb"));
            }
            //  base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            // dynamic auth config
            modelBuilder.AddMTPermissionCenter();

            foreach (var property in modelBuilder.Model.GetEntityTypes()
                         .SelectMany(entityType => entityType.GetProperties())
                         .Where(property => property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?)))
            {
                property.SetPrecision(18);
                property.SetScale(2);
            }

            // demo config
            modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();

            base.OnModelCreating(modelBuilder);

            modelBuilder
          .HasDbFunction(typeof(SqlServerJsonFunctions)
              .GetMethod(nameof(SqlServerJsonFunctions.JsonValue))!)
          .HasName("JSON_VALUE")
          .IsBuiltIn();

            modelBuilder
                .HasDbFunction(typeof(SqlServerJsonFunctions)
                    .GetMethod(nameof(SqlServerJsonFunctions.JsonQuery))!)
                .HasName("JSON_QUERY")
                .IsBuiltIn();


            // dynamic auth config
            modelBuilder.AddMTPermissionCenter();

            // demo config
            modelBuilder.Entity<Role>().HasIndex(x => x.Name).IsUnique();

            modelBuilder.Entity<UserRole>()
                .HasIndex(x => new { x.UserId, x.RoleId })
                .IsUnique();

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.User)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.Role)
                .WithMany(x => x.UserRoles)
                .HasForeignKey(x => x.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<UserRole>()
                .HasOne(x => x.ApprovedByUser)
                .WithMany()
                .HasForeignKey(x => x.ApprovedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

          

            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);


            modelBuilder.Entity<Address>()
             .HasOne(x => x.City)
             .WithMany(x => x.Addresses)
             .HasForeignKey(x => x.CityID)
             .OnDelete(DeleteBehavior.Cascade);

          

            modelBuilder.Entity<PaymentHistory>()
   .HasOne(x => x.User)
   .WithMany(x => x.PaymentHistories)
   .HasForeignKey(x => x.UserId)
   .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
   .HasOne(x => x.Role)
   .WithMany(x => x.Users)
   .HasForeignKey(x => x.RoleId)
   .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Setting>()
   .HasOne(x => x.Parent)
   .WithMany(x => x.Children)
   .HasForeignKey(x => x.ParentId)
   .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<TicketMessage>()
.HasOne(x => x.Ticket)
.WithMany(x => x.Messages)
.HasForeignKey(x => x.TicketId)
.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TicketMessage>()
.HasOne(x => x.User)
.WithMany(x => x.TicketMessages)
.HasForeignKey(x => x.UserId)
.OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<Ticket>()
                .HasOne(x => x.AssignedToUser)
                .WithMany()
                .HasForeignKey(x => x.AssignedToUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Ticket>()
                .HasIndex(x => new { x.Category, x.Status, x.Priority });

            modelBuilder.Entity<Ticket>()
                .HasIndex(x => new { x.ReferenceType, x.ReferenceId });

            modelBuilder.Entity<TicketAttachment>()
                .HasOne(x => x.Ticket)
                .WithMany(x => x.Attachments)
                .HasForeignKey(x => x.TicketId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TicketAttachment>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TicketAttachment>()
                .HasOne(x => x.UploadedByUser)
                .WithMany()
                .HasForeignKey(x => x.UploadedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VerificationDocument>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VerificationDocument>()
                .HasOne(x => x.ReviewedByUser)
                .WithMany()
                .HasForeignKey(x => x.ReviewedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<VerificationDocument>()
                .HasIndex(x => new { x.OwnerType, x.OwnerId, x.DocumentType });

            modelBuilder.Entity<PortfolioItem>()
                .HasOne(x => x.CoverFile)
                .WithMany()
                .HasForeignKey(x => x.CoverFileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PortfolioItem>()
                .HasIndex(x => new { x.OwnerType, x.OwnerId, x.IsPublic });

 
            modelBuilder.Entity<LoginMethod>()
.HasOne(x => x.User)
.WithMany(x => x.LoginMethods)
.HasForeignKey(x => x.UserId)
.OnDelete(DeleteBehavior.Cascade);


            modelBuilder.Entity<Notification>()
.HasOne(x => x.User)
.WithMany(x => x.Notifications)
.HasForeignKey(x => x.UserId)
.OnDelete(DeleteBehavior.Cascade);


            // ------------------------------------------------------------
            // Global filters + concurrency
            // ------------------------------------------------------------

            //ApplyGlobalSoftDeleteQueryFilter(modelBuilder);
            //ApplyRowVersionConcurrency(modelBuilder);

            // ------------------------------------------------------------
            // CORE Relations
            // ------------------------------------------------------------

          

            // FileAsset -> OwnerUser (required)
            //modelBuilder.Entity<FileAsset>()
            //    .HasOne(x => x.OwnerUser)
            //    .WithMany(x => x.OwnedFiles)
            //    .HasForeignKey(x => x.OwnerUserId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // City -> Country (optional)
            //modelBuilder.Entity<City>()
            //    .HasOne(x => x.Country)
            //    .WithMany(x => x.Cities)
            //    .HasForeignKey(x => x.CountryId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // CATEGORY (tree)
            // ------------------------------------------------------------
            modelBuilder.Entity<Category>()
                .HasOne(x => x.Parent)
                .WithMany(x => x.Children)
                .HasForeignKey(x => x.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            //modelBuilder.Entity<Category>()
            //    .HasIndex(x => x.Slug)
            //    .IsUnique();

            // ------------------------------------------------------------
            // LISTINGS
            // ------------------------------------------------------------

            modelBuilder.Entity<Listing>()
                .HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Listing>()
                .HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Listing>()
                .HasOne(x => x.Address)
                .WithMany()
                .HasForeignKey(x => x.AddressId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Listing>()
                .HasOne(x => x.CoverFile)
                .WithMany()
                .HasForeignKey(x => x.CoverFileId)
                .OnDelete(DeleteBehavior.Restrict);

            // Listing 1-1 ProductDetails
            modelBuilder.Entity<Listing>()
                .HasOne(x => x.ProductDetails)
                .WithOne(x => x.Listing)
                .HasForeignKey<ListingProductDetails>(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingProductDetails>()
                .HasIndex(x => x.ListingId)
                .IsUnique();

            // Listing 1-1 ServiceDetails
            modelBuilder.Entity<Listing>()
                .HasOne(x => x.ServiceDetails)
                .WithOne(x => x.Listing)
                .HasForeignKey<ListingServiceDetails>(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingServiceDetails>()
                .HasIndex(x => x.ListingId)
                .IsUnique();

            modelBuilder.Entity<Listing>()
                .HasOne(x => x.EquipmentRentalDetails)
                .WithOne(x => x.Listing)
                .HasForeignKey<EquipmentRentalDetails>(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EquipmentRentalDetails>()
                .HasIndex(x => x.ListingId)
                .IsUnique();

            // ServicePackages -> ListingServiceDetails (1-N)
            modelBuilder.Entity<ServicePackage>()
                .HasOne(x => x.ListingServiceDetails)
                .WithMany(x => x.Packages)
                .HasForeignKey(x => x.ListingServiceDetailsId)
                .OnDelete(DeleteBehavior.Cascade);

            //// ListingMedia (1-N)
            //modelBuilder.Entity<ListingMedia>()
            //    .HasOne(x => x.Listing)
            //    .WithMany(x => x.Media)
            //    .HasForeignKey(x => x.ListingId)
            //    .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<ListingMedia>()
            //    .HasOne(x => x.FileAsset)
            //    .WithMany()
            //    .HasForeignKey(x => x.FileAssetId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // Tags unique
            modelBuilder.Entity<Tag>()
                .HasIndex(x => x.Slug)
                .IsUnique();

            // ListingTag M2M (composite key)
            modelBuilder.Entity<ListingTag>()
                .HasKey(x => new { x.ListingId, x.TagId });

            modelBuilder.Entity<ListingTag>()
                .HasOne(x => x.Listing)
                .WithMany(x => x.ListingTags)
                .HasForeignKey(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingTag>()
                .HasOne(x => x.Tag)
                .WithMany(x => x.ListingTags)
                .HasForeignKey(x => x.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            // ListingSave
            modelBuilder.Entity<ListingSave>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ListingSave>()
                .HasOne(x => x.Listing)
                .WithMany(x => x.Saves)
                .HasForeignKey(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingSave>()
                .HasIndex(x => new { x.UserId, x.ListingId })
                .IsUnique(); // یک کاربر یک آگهی را دوبار ذخیره نکند

            // Q&A
            modelBuilder.Entity<ListingQuestion>()
                .HasOne(x => x.Listing)
                .WithMany(x => x.Questions)
                .HasForeignKey(x => x.ListingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingQuestion>()
                .HasOne(x => x.AskerUser)
                .WithMany()
                .HasForeignKey(x => x.AskerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ListingAnswer>()
                .HasOne(x => x.ListingQuestion)
                .WithMany(x => x.Answers)
                .HasForeignKey(x => x.ListingQuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ListingAnswer>()
                .HasOne(x => x.ResponderUser)
                .WithMany()
                .HasForeignKey(x => x.ResponderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Orders
            modelBuilder.Entity<Order>()
                .HasOne(x => x.BuyerUser)
                .WithMany()
                .HasForeignKey(x => x.BuyerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.SellerUser)
                .WithMany()
                .HasForeignKey(x => x.SellerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.Listing)
                .WithMany()
                .HasForeignKey(x => x.ListingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Order>()
                .HasOne(x => x.ServicePackage)
                .WithMany()
                .HasForeignKey(x => x.ServicePackageId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderEvent>()
                .HasOne(x => x.Order)
                .WithMany(x => x.Events)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderMilestone>()
                .HasOne(x => x.Order)
                .WithMany(x => x.Milestones)
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            // ------------------------------------------------------------
            // PROJECTS
            // ------------------------------------------------------------
            modelBuilder.Entity<Project>()
                .HasOne(x => x.EmployerUser)
                .WithMany()
                .HasForeignKey(x => x.EmployerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
                .HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
                .HasOne(x => x.City)
                .WithMany()
                .HasForeignKey(x => x.CityId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectActivityLog>()
                .HasOne(x => x.Project)
                .WithMany(x => x.ActivityLogs)
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectActivityLog>()
                .HasOne(x => x.ActorUser)
                .WithMany()
                .HasForeignKey(x => x.ActorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            //// ProjectAttachment
            //modelBuilder.Entity<FileUpload>()
            //    .HasOne(x => x.Project)
            //    .WithMany(x => x.Attachments)
            //    .HasForeignKey(x => x.ProjectId)
            //    .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<ProjectAttachment>()
            //    .HasOne(x => x.FileAsset)
            //    .WithMany()
            //    .HasForeignKey(x => x.FileAssetId)
            //    .OnDelete(DeleteBehavior.Restrict);

            // Proposal
            modelBuilder.Entity<Proposal>()
                .HasOne(x => x.Project)
                .WithMany(x => x.Proposals)
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Proposal>()
                .HasOne(x => x.FreelancerUser)
                .WithMany()
                .HasForeignKey(x => x.FreelancerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Proposal>()
                .HasIndex(x => new { x.ProjectId, x.FreelancerUserId })
                .IsUnique(); // هر فریلنسر یک پیشنهاد برای یک پروژه

            // ProjectSkill M2M
            modelBuilder.Entity<ProjectSkill>()
                .HasKey(x => new { x.ProjectId, x.TagId });

            modelBuilder.Entity<ProjectSkill>()
                .HasOne(x => x.Project)
                .WithMany(x => x.Skills)
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectSkill>()
                .HasOne(x => x.Tag)
                .WithMany()
                .HasForeignKey(x => x.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            // ProjectAssignment
            modelBuilder.Entity<ProjectAssignment>()
                .HasOne(x => x.Project)
                .WithOne(x => x.Assignment)
                .HasForeignKey<ProjectAssignment>(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProjectAssignment>()
                .HasOne(x => x.AssigneeUser)
                .WithMany()
                .HasForeignKey(x => x.AssigneeUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProjectAssignment>()
                .HasOne(x => x.AssigneeTeam)
                .WithMany()
                .HasForeignKey(x => x.AssigneeTeamId)
                .OnDelete(DeleteBehavior.Restrict);

            // Contract (1-1 with Project)
            modelBuilder.Entity<Contract>()
                .HasOne(x => x.Project)
                .WithOne(x => x.Contract)
                .HasForeignKey<Contract>(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(x => x.EmployerUser)
                .WithMany()
                .HasForeignKey(x => x.EmployerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(x => x.ContractorUser)
                .WithMany()
                .HasForeignKey(x => x.ContractorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Contract>()
                .HasOne(x => x.ContractorOrganization)
                .WithMany()
                .HasForeignKey(x => x.ContractorOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            // Milestone
            modelBuilder.Entity<Milestone>()
                .HasOne(x => x.Contract)
                .WithMany(x => x.Milestones)
                .HasForeignKey(x => x.ContractId)
                .OnDelete(DeleteBehavior.Cascade);

            // Deliverable
            modelBuilder.Entity<Deliverable>()
                .HasOne(x => x.Milestone)
                .WithMany(x => x.Deliverables)
                .HasForeignKey(x => x.MilestoneId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Deliverable>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            // Timesheet
            modelBuilder.Entity<Timesheet>()
                .HasOne(x => x.Contract)
                .WithMany(x => x.Timesheets)
                .HasForeignKey(x => x.ContractId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Timesheet>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Timesheet>()
                .HasIndex(x => new { x.ContractId, x.UserId, x.Date })
                .IsUnique();

            // ------------------------------------------------------------
            // ORG
            // ------------------------------------------------------------
            modelBuilder.Entity<Organization>()
                .HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Organization>()
                .HasIndex(x => x.Slug)
                .IsUnique();

            modelBuilder.Entity<OrganizationMember>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrganizationMember>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationMember>()
                .HasIndex(x => new { x.OrganizationId, x.UserId })
                .IsUnique();

            modelBuilder.Entity<OrganizationInvitation>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.Invitations)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrganizationInvitation>()
                .HasOne(x => x.InvitedByUser)
                .WithMany()
                .HasForeignKey(x => x.InvitedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationInvitation>()
                .HasOne(x => x.AcceptedUser)
                .WithMany()
                .HasForeignKey(x => x.AcceptedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationInvitation>()
                .HasIndex(x => new { x.OrganizationId, x.EmailOrPhone, x.Status });

            modelBuilder.Entity<OrganizationInvitation>()
                .HasIndex(x => x.InviteTokenHash)
                .IsUnique();

            modelBuilder.Entity<Team>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.Teams)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeamMember>()
                .HasOne(x => x.Team)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeamMember>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeamMember>()
                .HasIndex(x => new { x.TeamId, x.UserId })
                .IsUnique();

            modelBuilder.Entity<Affiliation>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.Affiliations)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Affiliation>()
                .HasOne(x => x.ContractorUser)
                .WithMany()
                .HasForeignKey(x => x.ContractorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Affiliation>()
                .HasIndex(x => new { x.OrganizationId, x.ContractorUserId })
                .IsUnique();

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasOne(x => x.Organization)
                .WithMany(x => x.PaymentRequests)
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasOne(x => x.RequesterUser)
                .WithMany()
                .HasForeignKey(x => x.RequesterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasOne(x => x.ApproverUser)
                .WithMany()
                .HasForeignKey(x => x.ApproverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasOne(x => x.Wallet)
                .WithMany()
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasOne(x => x.Transaction)
                .WithMany()
                .HasForeignKey(x => x.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasIndex(x => new { x.OrganizationId, x.Status, x.CreateDate });

            modelBuilder.Entity<OrganizationPaymentRequest>()
                .HasIndex(x => new { x.ReferenceType, x.ReferenceId });

            // ------------------------------------------------------------
            // FINANCE
            // ------------------------------------------------------------
            modelBuilder.Entity<Wallet>()
                .HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Wallet>()
                .HasOne(x => x.OwnerOrganization)
                .WithMany()
                .HasForeignKey(x => x.OwnerOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .HasOne(x => x.Wallet)
                .WithMany()
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Escrow>()
                .HasOne(x => x.PayerWallet)
                .WithMany()
                .HasForeignKey(x => x.PayerWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Escrow>()
                .HasOne(x => x.PayeeWallet)
                .WithMany()
                .HasForeignKey(x => x.PayeeWalletId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PayoutRequest>()
                .HasOne(x => x.Wallet)
                .WithMany()
                .HasForeignKey(x => x.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.BuyerUser)
                .WithMany()
                .HasForeignKey(x => x.BuyerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.BuyerOrganization)
                .WithMany()
                .HasForeignKey(x => x.BuyerOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.SellerUser)
                .WithMany()
                .HasForeignKey(x => x.SellerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.SellerOrganization)
                .WithMany()
                .HasForeignKey(x => x.SellerOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasOne(x => x.Transaction)
                .WithMany()
                .HasForeignKey(x => x.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Invoice>()
                .HasIndex(x => x.InvoiceNumber)
                .IsUnique();

            modelBuilder.Entity<Invoice>()
                .HasIndex(x => new { x.ContextType, x.ContextId });

            modelBuilder.Entity<InvoiceLine>()
                .HasOne(x => x.Invoice)
                .WithMany(x => x.Lines)
                .HasForeignKey(x => x.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PlatformFeeRule>()
                .HasIndex(x => new { x.ContextType, x.IsActiveRule });

            // ------------------------------------------------------------
            // CHAT
            // ------------------------------------------------------------
            modelBuilder.Entity<ConversationMember>()
                .HasOne(x => x.Conversation)
                .WithMany(x => x.Members)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ConversationMember>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ConversationMember>()
                .HasIndex(x => new { x.ConversationId, x.UserId })
                .IsUnique();

            modelBuilder.Entity<Message>()
                .HasOne(x => x.Conversation)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Message>()
                .HasOne(x => x.SenderUser)
                .WithMany()
                .HasForeignKey(x => x.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // REVIEWS
            // ------------------------------------------------------------
            modelBuilder.Entity<Review>()
                .HasOne(x => x.ReviewerUser)
                .WithMany()
                .HasForeignKey(x => x.ReviewerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<RatingAggregate>()
                .HasIndex(x => new { x.TargetType, x.TargetId })
                .IsUnique();

            modelBuilder.Entity<Badge>()
                .HasIndex(x => x.Code)
                .IsUnique();

            modelBuilder.Entity<BadgeAssignment>()
                .HasOne(x => x.Badge)
                .WithMany()
                .HasForeignKey(x => x.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<BadgeAssignment>()
                .HasOne(x => x.AssignedByUser)
                .WithMany()
                .HasForeignKey(x => x.AssignedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<BadgeAssignment>()
                .HasIndex(x => new { x.TargetType, x.TargetId, x.BadgeId })
                .IsUnique();

            // ------------------------------------------------------------
            // MODERATION
            // ------------------------------------------------------------
            modelBuilder.Entity<Report>()
                .HasOne(x => x.ReporterUser)
                .WithMany()
                .HasForeignKey(x => x.ReporterUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ModerationAction>()
                .HasOne(x => x.Report)
                .WithMany()
                .HasForeignKey(x => x.ReportId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ModerationAction>()
                .HasOne(x => x.PerformedByUser)
                .WithMany()
                .HasForeignKey(x => x.PerformedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // ANALYTICS
            // ------------------------------------------------------------
            modelBuilder.Entity<AnalyticsEvent>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            // ------------------------------------------------------------
            // EDUCATION
            // ------------------------------------------------------------
            modelBuilder.Entity<InstructorProfile>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InstructorProfile>()
                .HasIndex(x => x.UserId)
                .IsUnique();

            modelBuilder.Entity<Course>()
                .HasOne(x => x.InstructorUser)
                .WithMany()
                .HasForeignKey(x => x.InstructorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasOne(x => x.CoverFile)
                .WithMany()
                .HasForeignKey(x => x.CoverFileId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Course>()
                .HasIndex(x => x.Slug)
                .IsUnique();

            modelBuilder.Entity<CourseLesson>()
                .HasOne(x => x.Course)
                .WithMany(x => x.Lessons)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseLesson>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseLesson>()
                .HasIndex(x => new { x.CourseId, x.SortOrder });

            modelBuilder.Entity<CourseEnrollment>()
                .HasOne(x => x.Course)
                .WithMany(x => x.Enrollments)
                .HasForeignKey(x => x.CourseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CourseEnrollment>()
                .HasOne(x => x.StudentUser)
                .WithMany()
                .HasForeignKey(x => x.StudentUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseEnrollment>()
                .HasOne(x => x.Transaction)
                .WithMany()
                .HasForeignKey(x => x.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<CourseEnrollment>()
                .HasIndex(x => new { x.CourseId, x.StudentUserId })
                .IsUnique();

            modelBuilder.Entity<TeacherAvailabilitySlot>()
                .HasOne(x => x.InstructorUser)
                .WithMany()
                .HasForeignKey(x => x.InstructorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherAvailabilitySlot>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherAvailabilitySlot>()
                .HasIndex(x => new { x.InstructorUserId, x.StartsAt, x.EndsAt });

            modelBuilder.Entity<TeacherBooking>()
                .HasOne(x => x.InstructorUser)
                .WithMany()
                .HasForeignKey(x => x.InstructorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherBooking>()
                .HasOne(x => x.StudentUser)
                .WithMany()
                .HasForeignKey(x => x.StudentUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherBooking>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherBooking>()
                .HasOne(x => x.AvailabilitySlot)
                .WithMany(x => x.Bookings)
                .HasForeignKey(x => x.AvailabilitySlotId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherBooking>()
                .HasOne(x => x.Transaction)
                .WithMany()
                .HasForeignKey(x => x.TransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeacherBooking>()
                .HasIndex(x => new { x.InstructorUserId, x.StartsAt, x.EndsAt });

            modelBuilder.Entity<TeacherBooking>()
                .HasIndex(x => new { x.StudentUserId, x.Status });

            // ------------------------------------------------------------
            // INVESTMENT
            // ------------------------------------------------------------
            modelBuilder.Entity<InvestorProfile>()
                .HasOne(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestorProfile>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestorProfile>()
                .HasIndex(x => x.UserId)
                .IsUnique();

            modelBuilder.Entity<InvestmentOpportunity>()
                .HasOne(x => x.OwnerUser)
                .WithMany()
                .HasForeignKey(x => x.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentOpportunity>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentOpportunity>()
                .HasOne(x => x.Project)
                .WithMany()
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentOpportunity>()
                .HasIndex(x => x.Slug)
                .IsUnique();

            modelBuilder.Entity<InvestmentDocument>()
                .HasOne(x => x.InvestmentOpportunity)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.InvestmentOpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvestmentDocument>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentCommitment>()
                .HasOne(x => x.InvestmentOpportunity)
                .WithMany(x => x.Commitments)
                .HasForeignKey(x => x.InvestmentOpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvestmentCommitment>()
                .HasOne(x => x.InvestorUser)
                .WithMany()
                .HasForeignKey(x => x.InvestorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentCommitment>()
                .HasOne(x => x.InvestorOrganization)
                .WithMany()
                .HasForeignKey(x => x.InvestorOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentCommitment>()
                .HasOne(x => x.Escrow)
                .WithMany()
                .HasForeignKey(x => x.EscrowId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentTranche>()
                .HasOne(x => x.InvestmentOpportunity)
                .WithMany(x => x.Tranches)
                .HasForeignKey(x => x.InvestmentOpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvestmentReport>()
                .HasOne(x => x.InvestmentOpportunity)
                .WithMany(x => x.Reports)
                .HasForeignKey(x => x.InvestmentOpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvestmentContract>()
                .HasOne(x => x.InvestmentOpportunity)
                .WithMany(x => x.Contracts)
                .HasForeignKey(x => x.InvestmentOpportunityId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<InvestmentContract>()
                .HasOne(x => x.InvestorUser)
                .WithMany()
                .HasForeignKey(x => x.InvestorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentContract>()
                .HasOne(x => x.InvestorOrganization)
                .WithMany()
                .HasForeignKey(x => x.InvestorOrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentContract>()
                .HasOne(x => x.Escrow)
                .WithMany()
                .HasForeignKey(x => x.EscrowId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<InvestmentContract>()
                .HasOne(x => x.ContractFile)
                .WithMany()
                .HasForeignKey(x => x.ContractFileId)
                .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // DISPUTES / ARBITRATION
            // ------------------------------------------------------------
            modelBuilder.Entity<Dispute>()
                .HasOne(x => x.OpenedByUser)
                .WithMany()
                .HasForeignKey(x => x.OpenedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(x => x.RespondentUser)
                .WithMany()
                .HasForeignKey(x => x.RespondentUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasOne(x => x.ArbitratorUser)
                .WithMany()
                .HasForeignKey(x => x.ArbitratorUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Dispute>()
                .HasIndex(x => new { x.ContextType, x.ContextId, x.Status });

            modelBuilder.Entity<DisputeEvidence>()
                .HasOne(x => x.Dispute)
                .WithMany(x => x.EvidenceItems)
                .HasForeignKey(x => x.DisputeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DisputeEvidence>()
                .HasOne(x => x.SubmittedByUser)
                .WithMany()
                .HasForeignKey(x => x.SubmittedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<DisputeEvidence>()
                .HasOne(x => x.FileUpload)
                .WithMany()
                .HasForeignKey(x => x.FileUploadId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ArbitrationDecision>()
                .HasOne(x => x.Dispute)
                .WithOne(x => x.Decision)
                .HasForeignKey<ArbitrationDecision>(x => x.DisputeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ArbitrationDecision>()
                .HasOne(x => x.DecidedByUser)
                .WithMany()
                .HasForeignKey(x => x.DecidedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // SUPPLY CHAIN
            // ------------------------------------------------------------
            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.Project)
                .WithMany()
                .HasForeignKey(x => x.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.Contract)
                .WithMany()
                .HasForeignKey(x => x.ContractId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.Order)
                .WithMany()
                .HasForeignKey(x => x.OrderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.Listing)
                .WithMany()
                .HasForeignKey(x => x.ListingId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.AssignedUser)
                .WithMany()
                .HasForeignKey(x => x.AssignedUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasOne(x => x.Organization)
                .WithMany()
                .HasForeignKey(x => x.OrganizationId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ResourceAllocation>()
                .HasIndex(x => new { x.ProjectId, x.Status });

            modelBuilder.Entity<ResourceReservation>()
                .HasOne(x => x.ResourceAllocation)
                .WithMany()
                .HasForeignKey(x => x.ResourceAllocationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ResourceReservation>()
                .HasIndex(x => new { x.ResourceAllocationId, x.StartsAt, x.EndsAt });

            modelBuilder.Entity<ValueFlowEvent>()
                .HasOne(x => x.ResourceAllocation)
                .WithMany(x => x.ValueFlowEvents)
                .HasForeignKey(x => x.ResourceAllocationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ValueFlowEvent>()
                .HasOne(x => x.CreatedByUser)
                .WithMany()
                .HasForeignKey(x => x.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ------------------------------------------------------------
            // ایندکس‌های کاربردی (نمونه‌های مهم)
            // ------------------------------------------------------------
            modelBuilder.Entity<Listing>()
                .HasIndex(x => new { x.CategoryId, x.Status, x.PublishedAt });

            modelBuilder.Entity<Project>()
                .HasIndex(x => new { x.Status, x.PublishedAt });

            modelBuilder.Entity<Transaction>()
                .HasIndex(x => new { x.WalletId, x.CreateDate });

            modelBuilder.Entity<Message>()
                .HasIndex(x => new { x.ConversationId, x.ID });

            modelBuilder.Entity<AnalyticsEvent>()
                .HasIndex(x => new { x.EventName, x.CreateDate });

            modelBuilder.Entity<Course>()
                .HasIndex(x => new { x.Status, x.PublishedAt });

            modelBuilder.Entity<InvestmentOpportunity>()
                .HasIndex(x => new { x.Status, x.Stage, x.OpenedAt });

            ApplyDefaultDecimalPrecision(modelBuilder);
        }

        // -----------------------------
        // Helpers
        // -----------------------------

        /// <summary>
        /// روی تمام Entity هایی که از BaseEntity ارث می‌برند، فیلتر حذف نرم اعمال می‌کند.
        /// </summary>
        private static void ApplyGlobalSoftDeleteQueryFilter(ModelBuilder modelBuilder)
        {
            var baseEntityType = typeof(BaseEntity);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var clrType = entityType.ClrType;
                if (clrType == null) continue;

                if (baseEntityType.IsAssignableFrom(clrType))
                {
                    // Build expression: (e) => !e.IsDeleted
                    var method = typeof(TheAppContext)
                        .GetMethod(nameof(SetSoftDeleteFilter), BindingFlags.NonPublic | BindingFlags.Static)!
                        .MakeGenericMethod(clrType);

                    method.Invoke(null, new object[] { modelBuilder });
                }
            }
        }

        private static void ApplyRowVersionConcurrency(ModelBuilder modelBuilder)
        {
            var baseEntityType = typeof(BaseEntity);

            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                var clrType = entityType.ClrType;
                if (clrType == null) continue;

                if (baseEntityType.IsAssignableFrom(clrType))
                {
                    // Ensure RowVersion is concurrency token
                    //modelBuilder.Entity(clrType)
                    //    .Property(nameof(BaseEntity.RowVersion))
                    //    .IsRowVersion()
                    //    .IsConcurrencyToken();
                }
            }
        }

        private static void ApplyDefaultDecimalPrecision(ModelBuilder modelBuilder)
        {
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    var clrType = Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType;
                    if (clrType == typeof(decimal) && property.GetColumnType() == null)
                    {
                        property.SetPrecision(18);
                        property.SetScale(2);
                    }
                }
            }
        }

        private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
            where TEntity : BaseEntity
        {
            modelBuilder.Entity<TEntity>().HasQueryFilter(e => !(e.DeleteDate == null));
        }
    }
}
