using AITechDigitalTradeHub.Data.DataLayer;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Globalization;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AITechDigitalTradeHub.Data.Tools
{

    public static class SqlServerJsonFunctions
    {
        // JSON_VALUE(expression, path)  -> برمی‌گرداند string (یا null)
        [DbFunction(name: "JSON_VALUE", IsBuiltIn = true)]
        public static string? JsonValue(string? expression, string path)
            => throw new NotSupportedException();

        // JSON_QUERY(expression, path) -> برمی‌گرداند string JSON (یا null)
        [DbFunction(name: "JSON_QUERY", IsBuiltIn = true)]
        public static string? JsonQuery(string? expression, string path)
            => throw new NotSupportedException();
    }

    public static class DbTools
    {

        public static List<T> ToPaging<T>(this List<T> list, int pageIndex = 1, int pageSize = 20)
        {
            if (pageSize > 0)
            {
                int skipSize = (pageIndex - 1) * pageSize;
                list = list.Skip(skipSize).Take(pageSize).ToList();
            }
            return list;
        }

        public static IQueryable<T> ToPaging<T>(this IQueryable<T>? list, int pageIndex = 1, int pageSize = 20)
        {
            if (pageSize > 0)
            {
                int skipSize = (pageIndex - 1) * pageSize;
                list = list.Skip(skipSize).Take(pageSize);
            }
            return list;
        }

        public static IQueryable<T> SortBy<T>(this IQueryable<T> query, string sorting)
        {
            if (string.IsNullOrEmpty(sorting))
            {
                return query;
            }

            // تجزیه رشته مرتب سازی به ترتیب‌های جداگانه
            var sortingOptions = sorting.Split(',');

            // ساختن دستور مرتب سازی
            var sortingString = new StringBuilder();
            foreach (var sortOption in sortingOptions)
            {
                var sortParts = sortOption.Trim().Split('-');

                if (sortParts.Length == 2)
                {
                    var field = sortParts[0];
                    var direction = sortParts[1].ToLower();

                    // اضافه کردن به رشته دستور مرتب سازی
                    if (sortingString.Length > 0)
                    {
                        sortingString.Append(", ");
                    }

                    sortingString.Append($"{field} {direction}");
                }
            }

            // اعمال مرتب سازی به صورت پویا با استفاده از System.Linq.Dynamic.Core
            return query.OrderBy(sortingString.ToString());
        }

       

        public static string FixPrice(this decimal value)
        {
            return value.ToString("#,0");
        }

        public static string ToHash(this string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(value));
        }

        public static string ToUnHash(this string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return Encoding.UTF8.GetString(Convert.FromBase64String(value));
        }

        public static void SaveLog(object log)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine($"{log.ToString()}");
            sb.AppendLine(DateTime.Now.ToShortTimeString());
            sb.AppendLine($"--------------------------------");
            System.IO.File.AppendAllText(Path.Combine(Directory.GetCurrentDirectory(),
                      "wwwroot",
                      "log.txt"), sb.ToString());
        }

        public static string GenerateToken()
        {
            byte[] randomBytes = new byte[10]; // اندازه توکن را می‌توانید تغییر دهید
            using (var rngCryptoServiceProvider = new RNGCryptoServiceProvider())
            {
                rngCryptoServiceProvider.GetBytes(randomBytes);
            }
            return $"{Convert.ToBase64String(randomBytes)}{Convert.ToBase64String(Encoding.UTF8.GetBytes(DateTime.Now.ToShamsiString()))}";
        }

        public static decimal RetreivePrice(this string finalPrice)
        {
            finalPrice = finalPrice.ToEnglishNumbers();
            for (int i = 0; i < finalPrice.Length; i++)
            {
                if (finalPrice[i] == ',') finalPrice.Remove(i, 1);
            }
            return decimal.Parse(finalPrice);
        }

        public static string ToEnglishNumbers(this string persianStr)
        {
            string[] persianDigits = { "۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹" };
            string[] englishDigits = { "0", "1", "2", "3", "4", "5", "6", "7", "8", "9" };

            for (int i = 0; i < persianDigits.Length; i++)
            {
                persianStr = persianStr.Replace(persianDigits[i], englishDigits[i]);
            }

            return persianStr;
        }

        public static int GetPageCount(int totalItemsCount, int pageItemsCount)
        {
            if (totalItemsCount == 0 || pageItemsCount == 0) return 1;
            int pageCount = totalItemsCount / pageItemsCount;
            if (totalItemsCount % pageItemsCount != 0)
            {
                pageCount++;
            }
            return pageCount;
        }

        public static string ToSummary(this string? value)
        {
            string summary = value ?? "";
            if (value != null && value.Length > 70)
                summary = value.Substring(0, 70) + "...";
            return summary;
        }

        public static string ToShamsiString(this DateTime miladiDate)
        {
            PersianCalendar pc = new PersianCalendar();
            int year = pc.GetYear(miladiDate);
            int month = pc.GetMonth(miladiDate);
            int day = pc.GetDayOfMonth(miladiDate);
            int hour = pc.GetHour(miladiDate);
            int min = pc.GetMinute(miladiDate);
            int sec = pc.GetSecond(miladiDate);

            return $"{year:0000}/{month:00}/{day:00} {hour:00}:{min:00}:{sec:00}";
        }

        public static DateTime ToShamsi(this DateTime miladiDate)
        {
            PersianCalendar pc = new PersianCalendar();
            int year = pc.GetYear(miladiDate);
            int month = pc.GetMonth(miladiDate);
            int day = pc.GetDayOfMonth(miladiDate);
            int hour = pc.GetHour(miladiDate);
            int minute = pc.GetMinute(miladiDate);
            int second = pc.GetSecond(miladiDate);

            // ساخت یک DateTime با تاریخ شمسی (اما همچنان نوع آن Gregorian خواهد بود)
            return new DateTime(year, month, day, hour, minute, second, pc);
        }

        public static DateTime? StringToDate(this string stringDateTime)
        {
            if (string.IsNullOrWhiteSpace(stringDateTime))
                return  null;

            string[] stringTimeArr = { "00", "00", "00" };
            var arr = stringDateTime.Split(' ');

            if (arr.Length > 1)
                stringTimeArr = arr[1].Split(':');

            var stringDateArr = arr[0].Split('/');

            if (stringDateArr.Length != 3)
                throw new FormatException("Invalid date format.");

            int year = int.Parse(stringDateArr[0]);
            int month = int.Parse(stringDateArr[1]);
            int day = int.Parse(stringDateArr[2]);

            int hour = int.Parse(stringTimeArr[0]);
            int minute = int.Parse(stringTimeArr[1]);
            int second = int.Parse(stringTimeArr[2]);

            PersianCalendar pc = new PersianCalendar();
            DateTime result = pc.ToDateTime(year, month, day, hour, minute, second, 0);

            return result;
        }

        public static string DateToString(this DateTime date)
        {
            string stringDate = $"{date.Year}/{date.Month}/{date.Day} {date.Hour}:{date.Minute}";
            return stringDate;
        }

        public static TimeSpan StringToTimeSpan(this string time)
        {
            while (time.Split(':').Length < 3)
            {
                time += ":00";
            }
            return TimeSpan.ParseExact(time, @"hh\:mm\:ss", CultureInfo.InvariantCulture);
        }

        public static string TimeSpanToString(this TimeSpan timeSpan)
        {
            return timeSpan.ToString(@"hh\:mm\:ss");
        }

        public static async Task<DataTable> ToDataTableAsync(
     this DbContext context,
     string sql,
     IEnumerable<SqlParameter>? parameters = null,
     CancellationToken ct = default)
        {
            var dt = new DataTable();

            await using var conn = (SqlConnection)context.Database.GetDbConnection();
            if (conn.State != ConnectionState.Open)
                await conn.OpenAsync(ct);

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = sql;
            cmd.CommandType = CommandType.Text;

            if (parameters != null)
                cmd.Parameters.AddRange(parameters.ToArray());

            await using var reader = await cmd.ExecuteReaderAsync(ct);
            dt.Load(reader); // ✅ DataTable پر میشه

            return dt;
        }

        public static string ConvertDtToJson(this DataTable dt, bool indented = false)
        {
            var rows = new List<Dictionary<string, object?>>(dt.Rows.Count);

            foreach (DataRow row in dt.Rows)
            {
                var obj = new Dictionary<string, object?>(StringComparer.OrdinalIgnoreCase);

                foreach (DataColumn col in dt.Columns)
                {
                    var val = row[col];
                    obj[col.ColumnName] = val == DBNull.Value ? null : val;
                }

                rows.Add(obj);
            }

            var options = new JsonSerializerOptions
            {
                WriteIndented = indented
            };

            return JsonSerializer.Serialize(rows, options);
        }
    }
}