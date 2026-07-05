using AiTech.Domains;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مهارت‌های قابل نمایش در پروفایل پروژه‌ای کاربر.</summary>
    public class UserSkill : BaseEntity
    {
        public long UserId { get; set; }
        public User User { get; set; }

        public long TagId { get; set; }
        public Tag Tag { get; set; }
    }
}
