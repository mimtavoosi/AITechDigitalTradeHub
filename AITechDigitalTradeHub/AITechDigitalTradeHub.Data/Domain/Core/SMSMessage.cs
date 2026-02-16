using AITechDigitalTradeHub.Data.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace NobatPlusDATA.Domain
{
    public class SMSMessage : BaseEntity
    {
        public string PhoneNumber { get; set; }
        public long? UserID { get; set; }
        public string Message { get; set; }
        public DateTime SentDate { get; set; }
        public bool SentStatus { get; set; }

        public User? User { get; set; }

    }
}