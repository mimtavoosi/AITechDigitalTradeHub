using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public enum DisputeContextType : byte { Order = 1, Project = 2, Contract = 3, Milestone = 4, Investment = 5 }
    public enum DisputeStatus : byte { Open = 1, UnderReview = 2, WaitingForEvidence = 3, Decided = 4, Closed = 5, Cancelled = 6 }
    public enum DisputeReason : byte { Technical = 1, Financial = 2, Timeline = 3, Quality = 4, Scope = 5, Other = 99 }

    /// <summary>پرونده اختلاف و داوری.</summary>
    public class Dispute : BaseEntity
    {
        public DisputeContextType ContextType { get; set; }
        public long ContextId { get; set; }
        public long OpenedByUserId { get; set; }
        public long? RespondentUserId { get; set; }
        public long? ArbitratorUserId { get; set; }

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }
        public DisputeReason Reason { get; set; }
        public DisputeStatus Status { get; set; } = DisputeStatus.Open;
        public DateTime? DecidedAt { get; set; }
        public DateTime? ClosedAt { get; set; }

        public User OpenedByUser { get; set; } = default!;
        public User? RespondentUser { get; set; }
        public User? ArbitratorUser { get; set; }
        public ICollection<DisputeEvidence> EvidenceItems { get; set; } = new List<DisputeEvidence>();
        public ArbitrationDecision? Decision { get; set; }
    }
}
