using AITechDigitalTradeHub.Data.Domain;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Tools
{
    public static class QueryableWithLanguageAllStringsExtensions
    {
        public static IQueryable<T> InLang<T>(
            this IQueryable<T> source, string? lang, bool noFallback = false)
            where T : class, IHasOtherLangs, new()
        {
            if (string.IsNullOrWhiteSpace(lang) || lang.Equals("fa", StringComparison.OrdinalIgnoreCase))
                return source.Select(BuildProjection<T>(lang: null, noFallback));

            return source.Select(BuildProjection<T>(lang, noFallback));
        }

        private static Expression<Func<T, T>> BuildProjection<T>(string? lang, bool noFallback)
    where T : class, IHasOtherLangs, new()
        {
            var p = Expression.Parameter(typeof(T), "e");
            var other = Expression.Property(p, nameof(IHasOtherLangs.OtherLangs));
            var binds = new List<MemberBinding>();

            foreach (var prop in typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance))
            {
                if (!prop.CanRead || !prop.CanWrite) continue;

                Expression valueExpr;

                // --- استثناء: ستون‌های مشترک همیشه از مقدار اصلی خوانده می‌شوند ---
                if (prop.Name == nameof(IHasOtherLangs.OtherLangs) ||
                    prop.Name == "ID" ||
                    prop.Name == "CreateDate" ||
                    prop.Name == "UpdateDate")
                {
                    // مقدار OtherLangs = null ، ولی ID/CreateDate/UpdateDate از مقدار اصلی
                    valueExpr = prop.Name == nameof(IHasOtherLangs.OtherLangs)
                        ? Expression.Constant(null, typeof(string))
                        : Expression.Property(p, prop);
                }
                else if (lang != null && prop.PropertyType == typeof(string))
                {
                    var path = $"$.{lang}.{prop.Name}";
                    var localized = Expression.Call(
                        typeof(SqlServerJsonFunctions).GetMethod(nameof(SqlServerJsonFunctions.JsonValue))!,
                        other,
                        Expression.Constant(path)
                    );

                    valueExpr = noFallback
                        ? localized
                        : Expression.Coalesce(localized, Expression.Property(p, prop));
                }
                else
                {
                    valueExpr = Expression.Property(p, prop);
                }

                binds.Add(Expression.Bind(prop, valueExpr));
            }

            var body = Expression.MemberInit(Expression.New(typeof(T)), binds);
            return Expression.Lambda<Func<T, T>>(body, p);
        }


        public static IQueryable<T> WhereHasTranslation<T>(this IQueryable<T> source, string? lang)
            where T : class, IHasOtherLangs
        {
            if (string.IsNullOrWhiteSpace(lang) || lang.Equals("fa", StringComparison.OrdinalIgnoreCase))
                return source;

            return source.Where(e => SqlServerJsonFunctions.JsonQuery(e.OtherLangs!, "$." + lang) != null);
        }
    }
}
