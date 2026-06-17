using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Api.ViewModels
{
    public static class ResultObjectExtensions
    {
        public static ListResultObject<TOut> Map<TIn, TOut>(
            this ListResultObject<TIn> result,
            Func<TIn, TOut> map)
        {
            return new ListResultObject<TOut>
            {
                Status = result.Status,
                ErrorMessage = result.ErrorMessage,
                TotalCount = result.TotalCount,
                PageCount = result.PageCount,
                Results = result.Results?.Select(map).ToList() ?? new List<TOut>()
            };
        }

        public static RowResultObject<TOut> Map<TIn, TOut>(
            this RowResultObject<TIn> result,
            Func<TIn, TOut> map)
            where TIn : class
        {
            return new RowResultObject<TOut>
            {
                Status = result.Status,
                ErrorMessage = result.ErrorMessage,
                Result = result.Result == null ? default! : map(result.Result)
            };
        }
    }
}
