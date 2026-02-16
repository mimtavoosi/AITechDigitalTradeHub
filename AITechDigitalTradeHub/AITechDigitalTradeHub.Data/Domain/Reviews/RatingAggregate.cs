using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>کش میانگین امتیاز برای نمایش سریع.</summary>
    public class RatingAggregate : BaseEntity
    {
        public ReviewTargetType TargetType { get; set; }
        public long TargetId { get; set; }

        public decimal AvgRating { get; set; }
        public int Count { get; set; }
    }
}