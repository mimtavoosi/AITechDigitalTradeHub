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

        //  public TheAppContext(DbContextOptions<TheAppContext> options)
        //: base(options)
        //  {
        //  }

        #region BaseTables

        public DbSet<Address> Addresses { get; set; }
        public DbSet<AdminReport> AdminReports { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<FileUpload> FileUploads { get; set; }
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
        public DbSet<User> Users { get; set; }
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
        public DbSet<ServicePackage> ServicePackages { get; set; }

        public DbSet<Tag> Tags { get; set; }
        public DbSet<ListingTag> ListingTags { get; set; }
        public DbSet<ListingSave> ListingSaves { get; set; }
        public DbSet<ListingQuestion> ListingQuestions { get; set; }
        public DbSet<ListingAnswer> ListingAnswers { get; set; }

        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderEvent> OrderEvents { get; set; }

        // -----------------------------
        // Projects
        // -----------------------------
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectSkill> ProjectSkills { get; set; }
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
        public DbSet<OrganizationMember> OrganizationMembers { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<Affiliation> Affiliations { get; set; }

        // -----------------------------
        // Finance
        // -----------------------------
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Escrow> Escrows { get; set; }
        public DbSet<PayoutRequest> PayoutRequests { get; set; }

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

        // -----------------------------
        // Moderation
        // -----------------------------
        public DbSet<Report> Reports { get; set; }
        public DbSet<ModerationAction> ModerationActions { get; set; }

        // -----------------------------
        // Analytics
        // -----------------------------
        public DbSet<AnalyticsEvent> AnalyticsEvents { get; set; }

        #endregion


        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            ConfigurationHelper configurationHelper = new ConfigurationHelper();
            optionsBuilder.UseSqlServer(configurationHelper.GetConnectionString("publicdb"));
            //  base.OnConfiguring(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
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

        private static void SetSoftDeleteFilter<TEntity>(ModelBuilder modelBuilder)
            where TEntity : BaseEntity
        {
            modelBuilder.Entity<TEntity>().HasQueryFilter(e => !(e.DeleteDate == null));
        }
    }
}