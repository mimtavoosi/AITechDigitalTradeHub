using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ITicketMessageRep
    {
        Task<ListResultObject<TicketMessage>> GetAllTicketMessagesAsync(long userId = 0, long TicketId = 0, long ResponserRoleId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "");

        Task<RowResultObject<TicketMessage>> GetTicketMessageByIdAsync(long ticketMessageId);

        Task<BitResultObject> AddTicketMessageAsync(TicketMessage ticketMessage);

        Task<BitResultObject> EditTicketMessageAsync(TicketMessage ticketMessage);

        Task<BitResultObject> RemoveTicketMessageAsync(TicketMessage ticketMessage);

        Task<BitResultObject> RemoveTicketMessageAsync(long ticketMessageId);

        Task<BitResultObject> ExistTicketMessageAsync(long ticketMessageId);
    }
}