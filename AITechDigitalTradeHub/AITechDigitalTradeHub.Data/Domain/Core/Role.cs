using MTPermissionCenter.EFCore.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // Role: جدول نقش‌ها
    public class Role : BaseEntity
    {
        public string Name { get; set; } // نام نقش (مثلاً Student, Teacher, Admin)
        public string? Description { get; set; } // توضیحات نقش
        public ICollection<User> Users { get; set; } // کاربران مرتبط با نقش
        public ICollection<MTPermissionCenter_PermissionRole> PermissionRoles { get; set; } // دسترسی‌های مرتبط با نقش
         }
}