using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ProjectType : byte { Fixed = 1, Hourly = 2 }
    public enum ProjectStatus : byte { Draft = 1, Published = 2, Bidding = 3, Assigned = 4, InProgress = 5, Done = 6, Cancelled = 7 }
    public enum LocationMode : byte { Remote = 1, OnSite = 2, Hybrid = 3 }

    /// <summary>پروژه ثبت‌شده توسط کارفرما (شخص یا سازمان).</summary>
    public class Project : BaseEntity
    {
        /// <summary>کارفرما.</summary>
        public long EmployerUserId { get; set; }

        /// <summary>اگر پروژه سازمانی باشد.</summary>
        public long? OrganizationId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public long CategoryId { get; set; }

        public ProjectType ProjectType { get; set; }

        /// <summary>بودجه حداقل.</summary>
        public decimal? BudgetMin { get; set; }

        /// <summary>بودجه حداکثر.</summary>
        public decimal? BudgetMax { get; set; }

        [MaxLength(3)]
        public string Currency { get; set; } = "IRR";

        /// <summary>مدت تقریبی (روز).</summary>
        public int? TimelineDays { get; set; }

        /// <summary>ددلاین.</summary>
        public DateTime? DeadlineAt { get; set; }

        public LocationMode LocationMode { get; set; } = LocationMode.Remote;

        public long? CityId { get; set; }

        public ProjectStatus Status { get; set; } = ProjectStatus.Draft;

        public DateTime? PublishedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        // Navigation
        public User EmployerUser { get; set; } = default!;
        public Organization? Organization { get; set; }
        public Category Category { get; set; } = default!;
        public City? City { get; set; }

        public ICollection<FileUpload> Attachments { get; set; } = new List<FileUpload>();
        public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
        public ICollection<ProjectSkill> Skills { get; set; } = new List<ProjectSkill>();

        public ProjectAssignment? Assignment { get; set; }
        public Contract? Contract { get; set; }
    }
}