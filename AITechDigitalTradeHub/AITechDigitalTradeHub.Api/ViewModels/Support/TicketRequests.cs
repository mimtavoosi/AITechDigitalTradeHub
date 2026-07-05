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
        public List<long> AttachmentFileIds { get; set; } = new();

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
        public List<long> AttachmentFileIds { get; set; } = new();

        public TicketMessage ToEntity(long ticketId, long userId, bool isAdminResponse = false)
        {
            return new TicketMessage
            {
                TicketId = ticketId,
                UserId = userId,
                MessageContent = MessageContent.Trim(),
                IsAdminResponse = isAdminResponse,
                CreateDate = DateTime.Now,
                UpdateDate = DateTime.Now,
                CreatorId = userId
            };
        }
    }

    public class AddTicketAttachmentRequest
    {
        public long FileUploadId { get; set; }
    }

    public class AssignTicketRequest
    {
        public long? AssignedToUserId { get; set; }
    }

    public class UpdateTicketStatusRequest
    {
        public TicketStatus Status { get; set; }
        public byte? SatisfactionScore { get; set; }
    }

    public class UpdateTicketSatisfactionRequest
    {
        public byte SatisfactionScore { get; set; }
    }

    public class EscalateTicketRequest
    {
        public string TargetQueue { get; set; } = "";
        public string? Note { get; set; }
    }

    public class TicketAdminSummaryResponse
    {
        public int TotalTickets { get; set; }
        public int OpenTickets { get; set; }
        public int PendingTickets { get; set; }
        public int AnsweredTickets { get; set; }
        public int ResolvedTickets { get; set; }
        public int ClosedTickets { get; set; }
        public int OverdueTickets { get; set; }
        public int SlaBreachedTickets { get; set; }
        public decimal AverageFirstResponseMinutes { get; set; }
        public decimal AverageResolutionMinutes { get; set; }
        public decimal AverageSatisfactionScore { get; set; }
        public int SatisfactionResponsesCount { get; set; }
    }

    public class TicketResponse
    {
        public long Id { get; set; }
        public string Subject { get; set; } = "";
        public string Description { get; set; } = "";
        public long UserId { get; set; }
        public string? UserName { get; set; }
        public long? AssignedToUserId { get; set; }
        public string? AssignedToName { get; set; }
        public TicketCategory Category { get; set; }
        public TicketStatus Status { get; set; }
        public TicketPriority Priority { get; set; }
        public string? ReferenceType { get; set; }
        public long? ReferenceId { get; set; }
        public DateTime? SlaDueAt { get; set; }
        public DateTime? FirstRespondedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public DateTime? ClosedAt { get; set; }
        public byte? SatisfactionScore { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int MessagesCount { get; set; }
        public int AttachmentsCount { get; set; }
        public List<TicketMessageResponse> Messages { get; set; } = new();
        public List<TicketAttachmentResponse> Attachments { get; set; } = new();

        public static TicketResponse FromEntity(Ticket ticket, bool includeDetails = true)
        {
            return new TicketResponse
            {
                Id = ticket.ID,
                Subject = ticket.Subject,
                Description = ticket.Description,
                UserId = ticket.UserId,
                UserName = FormatUserName(ticket.User),
                AssignedToUserId = ticket.AssignedToUserId,
                AssignedToName = FormatUserName(ticket.AssignedToUser),
                Category = ticket.Category,
                Status = ticket.Status,
                Priority = ticket.Priority,
                ReferenceType = ticket.ReferenceType,
                ReferenceId = ticket.ReferenceId,
                SlaDueAt = ticket.SlaDueAt,
                FirstRespondedAt = ticket.FirstRespondedAt,
                ResolvedAt = ticket.ResolvedAt,
                ClosedAt = ticket.ClosedAt,
                SatisfactionScore = ticket.SatisfactionScore,
                CreateDate = ticket.CreateDate,
                UpdateDate = ticket.UpdateDate,
                MessagesCount = ticket.Messages?.Count ?? 0,
                AttachmentsCount = ticket.Attachments?.Count ?? 0,
                Messages = includeDetails
                    ? ticket.Messages?.OrderBy(x => x.CreateDate).Select(TicketMessageResponse.FromEntity).ToList() ?? new List<TicketMessageResponse>()
                    : new List<TicketMessageResponse>(),
                Attachments = includeDetails
                    ? ticket.Attachments?.OrderByDescending(x => x.CreateDate).Select(TicketAttachmentResponse.FromEntity).ToList() ?? new List<TicketAttachmentResponse>()
                    : new List<TicketAttachmentResponse>()
            };
        }

        private static string? FormatUserName(User? user)
        {
            if (user == null) return null;
            var fullName = $"{user.FirstName} {user.LastName}".Trim();
            return string.IsNullOrWhiteSpace(fullName) ? user.Username : fullName;
        }
    }

    public class TicketMessageResponse
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public long? UserId { get; set; }
        public string? UserName { get; set; }
        public string MessageContent { get; set; } = "";
        public bool IsAdminResponse { get; set; }
        public DateTime? CreateDate { get; set; }

        public static TicketMessageResponse FromEntity(TicketMessage message)
        {
            return new TicketMessageResponse
            {
                Id = message.ID,
                TicketId = message.TicketId,
                UserId = message.UserId,
                UserName = message.User == null
                    ? null
                    : string.IsNullOrWhiteSpace($"{message.User.FirstName} {message.User.LastName}".Trim())
                        ? message.User.Username
                        : $"{message.User.FirstName} {message.User.LastName}".Trim(),
                MessageContent = message.MessageContent,
                IsAdminResponse = message.IsAdminResponse,
                CreateDate = message.CreateDate
            };
        }
    }

    public class TicketAttachmentResponse
    {
        public long Id { get; set; }
        public long TicketId { get; set; }
        public long FileUploadId { get; set; }
        public string? FileName { get; set; }
        public string? FileUrl { get; set; }
        public string? ContentType { get; set; }
        public long UploadedByUserId { get; set; }
        public DateTime? CreateDate { get; set; }

        public static TicketAttachmentResponse FromEntity(TicketAttachment attachment)
        {
            return new TicketAttachmentResponse
            {
                Id = attachment.ID,
                TicketId = attachment.TicketId,
                FileUploadId = attachment.FileUploadId,
                FileName = attachment.FileUpload?.FileName,
                FileUrl = attachment.FileUpload?.GetUrl ?? attachment.FileUpload?.FilePath,
                ContentType = attachment.FileUpload?.ContentType,
                UploadedByUserId = attachment.UploadedByUserId,
                CreateDate = attachment.CreateDate
            };
        }
    }
}
