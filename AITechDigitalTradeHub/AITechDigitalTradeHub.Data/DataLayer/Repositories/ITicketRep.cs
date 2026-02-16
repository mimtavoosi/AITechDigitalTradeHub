using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using AITechDigitalTradeHub.Data.CustomResponses;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ITicketRep
    {
        Task<TicketListCustomResponse<Ticket>> GetAllTicketsAsync(long UserId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "");

        Task<TicketRowCustomResponse<Ticket>> GetTicketByIdAsync(long ticketId);

        Task<BitResultObject> AddTicketAsync(Ticket ticket);

        Task<BitResultObject> EditTicketAsync(Ticket ticket);

        Task<BitResultObject> RemoveTicketAsync(Ticket ticket);

        Task<BitResultObject> RemoveTicketAsync(long ticketId);

        Task<BitResultObject> ExistTicketAsync(long ticketId);
    }
}