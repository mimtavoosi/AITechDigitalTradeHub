using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Support
{
    public class CreateTicketRequest
    {
        public string Subject { get; set; } = "";
        public string Description { get; set; } = "";
        public TicketCategory Category { get; set; } = TicketCategory.General;
        public TicketPriority Priority { get; set; } = TicketPriority.Normal;
        public string? ReferenceType { get; set; }
        public long? ReferenceId { get; set; }

        public Ticket ToEntity(long userId)
        {
            return new Ticket
            {
                Subject = Subject.Trim(),
                Description = Description.Trim(),
                UserId = userId,
                Category = Category,
                Priority = Priority,
                ReferenceType = ReferenceType?.Trim(),
                ReferenceId = ReferenceId,
                Status = TicketStatus.Open,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                CreatorId = userId
            };
        }
    }

    public class CreateTicketMessageRequest
    {
        public string MessageContent { get; set; } = "";

        public TicketMessage ToEntity(long ticketId, long userId)
        {
            return new TicketMessage
            {
                TicketId = ticketId,
                UserId = userId,
                MessageContent = MessageContent.Trim(),
                IsAdminResponse = false,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                CreatorId = userId
            };
        }
    }
}
