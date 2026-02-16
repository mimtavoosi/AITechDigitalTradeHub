using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>پیام‌ها.</summary>
    public class Message : BaseEntity
    {
        public long ConversationId { get; set; }
        public long SenderUserId { get; set; }

        public MessageType MessageType { get; set; }

        /// <summary>متن پیام (اگر Text).</summary>
        public string? Text { get; set; }

        /// <summary>فایل پیوست (اگر File).</summary>
        public long? FileUploadId { get; set; }

        /// <summary>تصویر پیوست (اگر Image).</summary>
        public long? ImageId { get; set; }

        public Conversation Conversation { get; set; } = default!;
        public User SenderUser { get; set; } = default!;
        public FileUpload? FileUpload { get; set; }
        public Image? Image { get; set; }
    }
}