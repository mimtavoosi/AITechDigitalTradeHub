using AITechDigitalTradeHub.Data.Tools;

namespace AITechDigitalTradeHub.Data.Domain
{
    public class Log : BaseEntity
    {
        public Log()
        {
            LogTime = DateTime.Now.ToShamsi();
        }

        public DateTime LogTime { get; set; }
        public string ActionName { get; set; }
    }
}