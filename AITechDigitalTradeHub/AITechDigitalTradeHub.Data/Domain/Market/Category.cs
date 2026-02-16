using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>دسته‌بندی چندسطحی (درختی).</summary>

    public class Category : BaseEntity
    {
        /// <summary>والد دسته (برای ساخت درخت).</summary>
        public long? ParentId { get; set; }

        [Display(Name = "نام دسته بندی")]
        public string CategoryName { get; set; }

        [Display(Name = "توضیحات")]
        public string? CategoryDescription { get; set; }

        /// <summary>این دسته برای کالا/خدمت/پروژه قابل استفاده است.</summary>
        public CategoryTypeMask TypeMask { get; set; }

        public Category? Parent { get; set; }
        public ICollection<Category> Children { get; set; } = new List<Category>();
    }

    [Flags]
    public enum CategoryTypeMask : byte
    {
        None = 0,
        Product = 1,
        Service = 2,
        Project = 4
    }

}