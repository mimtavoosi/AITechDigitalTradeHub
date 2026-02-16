using AITechDigitalTradeHub.Data.ResultObjects;
using NobatPlusDATA.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface ISMSMessageRep
    {
        public Task<ListResultObject<SMSMessage>> GetAllSMSMessagesAsync(long userId = 0, int pageIndex = 1, int pageSize = 20, string searchText = "",string sortQuery ="");
        public Task<RowResultObject<SMSMessage>> GetSMSMessageByIdAsync(long SMSMessageId);
        public Task<BitResultObject> AddSMSMessageAsync(SMSMessage SMSMessage);
        public Task<BitResultObject> EditSMSMessageAsync(SMSMessage SMSMessage);
        public Task<BitResultObject> RemoveSMSMessageAsync(SMSMessage SMSMessage);
        public Task<BitResultObject> RemoveSMSMessageAsync(long SMSMessageId);
        public Task<BitResultObject> ExistSMSMessageAsync(long SMSMessageId);
    }
}
