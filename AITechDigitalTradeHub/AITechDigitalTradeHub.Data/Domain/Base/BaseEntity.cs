using AITechDigitalTradeHub.Data.Tools;
using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class BaseEntity:IHasOtherLangs
    {
        [Key]
        [Display(Name = "آیدی")]
        public long ID { get; set; }

        [Display(Name = "تاریخ ساخت")]
        public DateTime? CreateDate { get; set; }

        [Display(Name = "تاریخ بروزرسانی")]
        public DateTime? UpdateDate { get; set; } = DateTime.Now.ToShamsi();

        [Display(Name = "تاریخ حذف")]
        public DateTime? DeleteDate { get; set; }

        [Display(Name = "وضعیت فعال")]
        public bool IsActive { get; set; } = true;
        public long? CreatorId { get; set; }
        public string? OtherLangs { get; set; }
    }

    public class BaseVM
    {
        [Display(Name = "آیدی")]
        public long ID { get; set; }

        [Display(Name = "تاریخ ساخت")]
        public DateTime? CreateDate { get; set; }

        [Display(Name = "تاریخ بروزرسانی")]
        public DateTime? UpdateDate { get; set; } = DateTime.Now.ToShamsi();

        [Display(Name = "تاریخ حذف")]
        public DateTime? DeleteDate { get; set; }
        public long? CreatorId { get; set; }

        [Display(Name = "وضعیت فعال")]
        public bool IsActive { get; set; }

    }
}