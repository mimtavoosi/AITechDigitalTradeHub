
  using System.ComponentModel.DataAnnotations;
using AiTech.Domains;
using Microsoft.AspNetCore.Identity;
using MTPermissionCenter.Abstractions;

namespace AITechDigitalTradeHub.Data.Domain
{

    /// <summary>
    /// کاربر سیستم (خریدار/فروشنده/خدمت‌دهنده/فریلنسر/کارفرما)؛ همه می‌توانند چند نقش عملیاتی داشته باشند.
    /// </summary>
    public class User : BaseEntity,IHasPermissionVersion
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string NationalCode { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; } // هش رمز عبور
        public long PermissionsVersion { get; set; } = 1;
        public long? AddressId { get; set; } // کلید خارجی به Address
        public Address? Address { get; set; } // ارتباط با Address

        /// <summary>امتیاز اعتماد (Cache شده برای سریع‌بودن نمایش/مرتب‌سازی).</summary>
        public decimal TrustScore { get; set; }

        /// <summary>آیا احراز هویت شده؟</summary>
        public bool IsVerified { get; set; }

        /// <summary>سطح احراز: 0..3 (مثلاً موبایل، مدارک، سلفی، تایید نهایی).</summary>
        public byte VerificationLevel { get; set; }

        /// <summary>وضعیت حساب.</summary>
        public UserStatus Status { get; set; } = UserStatus.Active;

        [MaxLength(180)]
        public string? ResumeHeadline { get; set; }

        [MaxLength(2000)]
        public string? ResumeSummary { get; set; }

        [MaxLength(4000)]
        public string? ResumeExperience { get; set; }

        [MaxLength(1000)]
        public string? ResumeEducation { get; set; }

        public ICollection<PaymentHistory> PaymentHistories { get; set; } // ارتباط یک به چند با PaymentHistory
        public ICollection<LoginMethod> LoginMethods { get; set; } 
        public ICollection<Notification> Notifications { get; set; } // اعلان ‌های ارسال شده توسط کاربر
        public ICollection<TicketMessage> TicketMessages { get; set; } // پاسخ تیکت‌های ثبت شده توسط مدیر
        public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    }

    public enum UserStatus : byte
    {
        Active = 1,
        Suspended = 2,
        Banned = 3
    }
}
