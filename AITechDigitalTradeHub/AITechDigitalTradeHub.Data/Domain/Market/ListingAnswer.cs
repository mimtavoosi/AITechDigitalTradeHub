using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{

    /// <summary>پاسخ به سوال آگهی.</summary>
    public class ListingAnswer : BaseEntity
    {
        public long ListingQuestionId { get; set; }
        public long ResponderUserId { get; set; }

        /// <summary>متن پاسخ.</summary>
        [MaxLength(1000)]
        public string AnswerText { get; set; } = string.Empty;

        public ListingQuestion ListingQuestion { get; set; } = default!;
        public User ResponderUser { get; set; } = default!;
    }

}