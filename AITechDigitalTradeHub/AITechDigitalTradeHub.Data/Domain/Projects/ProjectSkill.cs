using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>مهارت‌های پروژه (Tag محور).</summary>
    public class ProjectSkill
    {
        public long ProjectId { get; set; }
        public long TagId { get; set; }

        public Project Project { get; set; } = default!;
        public Tag Tag { get; set; } = default!;
    }
}