using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.CustomResponses
{
    public class TicketListCustomResponse<T>:ListResultObject<T>
    {
        public Dictionary<T, List<Image>?>? ResultImages { get; set; }

    }

    public class TicketRowCustomResponse<T> : RowResultObject<T>
    {
        public Dictionary<T, List<Image>?>? ResultImages { get; set; }

    }
}
