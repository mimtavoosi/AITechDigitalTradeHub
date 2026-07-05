using Microsoft.AspNetCore.Mvc.Filters;

namespace AITechDigitalTradeHub.Api.Infrastructure;

public sealed class PaginationActionFilter : IActionFilter
{
    public const int DefaultPageSize = 20;
    public const int MaxPageSize = 100;

    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ActionArguments.ContainsKey("pageIndex"))
        {
            var pageIndex = context.ActionArguments["pageIndex"] as int? ?? 1;
            context.ActionArguments["pageIndex"] = Math.Max(1, pageIndex);
        }

        if (context.ActionArguments.ContainsKey("pageSize"))
        {
            var pageSize = context.ActionArguments["pageSize"] as int? ?? DefaultPageSize;
            context.ActionArguments["pageSize"] = Math.Clamp(
                pageSize <= 0 ? DefaultPageSize : pageSize,
                1,
                MaxPageSize);
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
