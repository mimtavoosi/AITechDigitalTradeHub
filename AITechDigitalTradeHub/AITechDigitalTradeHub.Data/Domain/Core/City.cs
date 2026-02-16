using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class City : BaseEntity
    {
        public long CityParentID { get; set; }
        public string CityName { get; set; }
        public bool DefaultCity { get; set; }
        public ICollection<Address> Addresses { get; set; }
    }
}