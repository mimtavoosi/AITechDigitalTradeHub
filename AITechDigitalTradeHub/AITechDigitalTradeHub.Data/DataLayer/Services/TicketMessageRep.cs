using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using Microsoft.EntityFrameworkCore;
using AITechDigitalTradeHub.Data.Tools;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class TicketMessageRep : ITicketMessageRep
    {
        private TheAppContext _context;

        public TicketMessageRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddTicketMessageAsync(TicketMessage ticketMessage)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                await _context.TicketMessages.AddAsync(ticketMessage);
                await _context.SaveChangesAsync();
                result.ID = ticketMessage.ID;
                _context.Entry(ticketMessage).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditTicketMessageAsync(TicketMessage ticketMessage)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.TicketMessages.Update(ticketMessage);
                await _context.SaveChangesAsync();
                result.ID = ticketMessage.ID;
                _context.Entry(ticketMessage).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> ExistTicketMessageAsync(long ticketMessageId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                result.Status = await _context.TicketMessages
                    .AsNoTracking()
                    .AnyAsync(x => x.ID == ticketMessageId);
                result.ID = ticketMessageId;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<TicketMessage>> GetAllTicketMessagesAsync(long userId = 0, long TicketId = 0, long ResponserRoleId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "", string sortQuery = "")
        {
            ListResultObject<TicketMessage> results = new ListResultObject<TicketMessage>();
            try
            {
                var query = _context.TicketMessages.Include(x=> x.Ticket)
                    .AsNoTracking()
                    .Where(x =>
                        (!string.IsNullOrEmpty(x.MessageContent) && x.MessageContent.Contains(searchText))
                    );
                if (userId > 0)
                {
                    query = query.Where(x=> x.UserId ==userId);
                }

                if (TicketId > 0)
                {
                    query = query.Where(x => x.TicketId == TicketId);
                }

                if (ResponserRoleId > 0)
                {
                    query = query.Where(x => x.ResponserRoleId == ResponserRoleId);
                }

                results.TotalCount = query.Count();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate)
                     .SortBy(sortQuery).ToPaging(pageIndex, pageSize)
                    .Include(x => x.Ticket)
                    .Include(x => x.User)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<TicketMessage>> GetTicketMessageByIdAsync(long ticketMessageId)
        {
            RowResultObject<TicketMessage> result = new RowResultObject<TicketMessage>();
            try
            {
                result.Result = await _context.TicketMessages
                    .AsNoTracking()
                    .Include(x => x.Ticket)
                    .Include(x => x.User)
                    .SingleOrDefaultAsync(x => x.ID == ticketMessageId);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveTicketMessageAsync(TicketMessage ticketMessage)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                _context.TicketMessages.Remove(ticketMessage);
                await _context.SaveChangesAsync();
                result.ID = ticketMessage.ID;
                _context.Entry(ticketMessage).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> RemoveTicketMessageAsync(long ticketMessageId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var ticketMessage = await GetTicketMessageByIdAsync(ticketMessageId);
                result = await RemoveTicketMessageAsync(ticketMessage.Result);
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }
    }
}