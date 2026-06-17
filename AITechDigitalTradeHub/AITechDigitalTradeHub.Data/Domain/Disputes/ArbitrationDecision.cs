namespace AITechDigitalTradeHub.Data.Domain
{
    public enum ArbitrationDecisionType : byte { ReleasePayment = 1, RefundPayment = 2, PartialRelease = 3, ReviseWork = 4, NoAction = 5 }

    /// <summary>رأی نهایی داوری.</summary>
    public class ArbitrationDecision : BaseEntity
    {
        public long DisputeId { get; set; }
        public long DecidedByUserId { get; set; }
        public ArbitrationDecisionType DecisionType { get; set; }
        public string? DecisionText { get; set; }
        public decimal? ReleaseAmount { get; set; }
        public decimal? RefundAmount { get; set; }
        public bool IsExecuted { get; set; }
        public DateTime? ExecutedAt { get; set; }

        public Dispute Dispute { get; set; } = default!;
        public User DecidedByUser { get; set; } = default!;
    }
}
