using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    // Comment: جدول نظرات
    public class Comment : BaseEntity
    {
        public string Title { get; set; }
        public long ForeignKeyId { get; set; } // کلید خارجی به رکورد اصلی
        public string EntityType { get; set; } // نوع جدول مرتبط (مثلاً "User", "Course", "Event")
        public string Description { get; set; } = ""; 
        public long CreatorId { get; set; } = 0; // کاربر ایجاد کننده
        public long ParentId { get; set; } = 0; // کد کامنت والد
    }
}