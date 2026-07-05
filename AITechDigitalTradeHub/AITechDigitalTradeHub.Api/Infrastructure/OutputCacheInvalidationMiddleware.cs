using Microsoft.AspNetCore.OutputCaching;

namespace AITechDigitalTradeHub.Api.Infrastructure;

public sealed class OutputCacheInvalidationMiddleware
{
    private readonly RequestDelegate _next;

    public OutputCacheInvalidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IOutputCacheStore cacheStore)
    {
        await _next(context);

        if (HttpMethods.IsGet(context.Request.Method) ||
            HttpMethods.IsHead(context.Request.Method) ||
            context.Response.StatusCode >= StatusCodes.Status400BadRequest)
        {
            return;
        }

        await cacheStore.EvictByTagAsync("public-read", context.RequestAborted);
        await cacheStore.EvictByTagAsync("public-reference", context.RequestAborted);
    }
}
