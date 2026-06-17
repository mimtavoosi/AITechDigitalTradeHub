namespace AITechDigitalTradeHub.Data.Domain
{
    public class TicketAttachment : BaseEntity
    {
        public long TicketId { get; set; }
        public long FileUploadId { get; set; }
        public long UploadedByUserId { get; set; }

        public Ticket Ticket { get; set; } = default!;
        public FileUpload FileUpload { get; set; } = default!;
        public User UploadedByUser { get; set; } = default!;
    }
}
