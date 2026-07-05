using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ProjectActivityType : byte
    {
        Created = 1,
        ProposalSubmitted = 2,
        ContractorSelected = 3,
        ContractSigned = 4,
        MilestoneUpdated = 5,
        DeliverableSubmitted = 6,
        DecisionRecorded = 7,
        StatusChanged = 8,
        DocumentAdded = 9,
        MessageSent = 10,
        DisputeOpened = 11
    }

    /// <summary>تاریخچه تصمیمات و تغییرات پروژه.</summary>
    public class ProjectActivityLog : BaseEntity
    {
        public long ProjectId { get; set; }
        public long? ActorUserId { get; set; }
        public ProjectActivityType ActivityType { get; set; }

        [MaxLength(220)]
        public string Title { get; set; } = string.Empty;

        public string? DetailsJson { get; set; }

        public Project Project { get; set; } = default!;
        public User? ActorUser { get; set; }
    }
}
