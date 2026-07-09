using System.Text;
using System.Text.Json;

namespace AITechDigitalTradeHub.Api.Services
{
    public class AiRoadmapOptions
    {
        public bool Enable { get; set; } = true;
        public string BaseUrl { get; set; } = "http://37.255.232.255:8181";
        public string ApiKey { get; set; } = string.Empty;
        public int TimeoutSeconds { get; set; } = 180;
        public int MaxNodes { get; set; } = 7;
        public int MaxCoursesPerNode { get; set; } = 3;
    }

    #region قرارداد سرویس رودمپ (camelCase مطابق roadmap_server.py)

    public class AiRoadmapProfileAnswer
    {
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
    }

    public class AiRoadmapProfile
    {
        public List<AiRoadmapProfileAnswer> Answers { get; set; } = new();
        public string FreeText { get; set; } = string.Empty;
        public string Goal { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public int WeeklyHours { get; set; }
        public string PreferredMode { get; set; } = string.Empty;
    }

    public class AiRoadmapCatalogCategory
    {
        public long Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }

    public class AiRoadmapCatalogSection
    {
        public string Title { get; set; } = string.Empty;
        public string Objective { get; set; } = string.Empty;
        public List<string> Lessons { get; set; } = new();
    }

    public class AiRoadmapCatalogCourse
    {
        public long Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Level { get; set; } = string.Empty;
        public string DeliveryMode { get; set; } = string.Empty;
        public decimal PriceAmount { get; set; }
        public int? DurationMinutes { get; set; }
        public int? EstimatedWeeks { get; set; }
        public int? WeeklyHoursMin { get; set; }
        public int? WeeklyHoursMax { get; set; }
        public bool ProjectBased { get; set; }
        public bool RequiresMentor { get; set; }
        public string Description { get; set; } = string.Empty;
        public string LearningOutcomes { get; set; } = string.Empty;
        public string PrerequisitesSummary { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = new();
        public List<string> Lessons { get; set; } = new();
        public List<AiRoadmapCatalogSection> Sections { get; set; } = new();
    }

    public class AiRoadmapCatalog
    {
        public List<AiRoadmapCatalogCategory> Categories { get; set; } = new();
        public List<AiRoadmapCatalogCourse> Courses { get; set; } = new();
    }

    public class AiRoadmapRequest
    {
        public AiRoadmapProfile Profile { get; set; } = new();
        public AiRoadmapCatalog Catalog { get; set; } = new();
        public int MaxNodes { get; set; } = 7;
        public int MaxCoursesPerNode { get; set; } = 3;
    }

    public class AiRoadmapNodeCourse
    {
        public long CourseId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int MatchScore { get; set; }
    }

    public class AiRoadmapNode
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<string> DependsOn { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public int EstimatedWeeks { get; set; }
        public bool IsOptional { get; set; }
        public List<AiRoadmapNodeCourse> Courses { get; set; } = new();
    }

    public class AiRoadmapResult
    {
        public string RoadmapTitle { get; set; } = string.Empty;
        public string RoadmapSummary { get; set; } = string.Empty;
        public int TotalEstimatedWeeks { get; set; }
        public List<AiRoadmapNode> Nodes { get; set; } = new();
        public List<string> Tips { get; set; } = new();
        public string Model { get; set; } = string.Empty;
        public int ElapsedMs { get; set; }
    }

    #endregion

    public class AiRoadmapException : Exception
    {
        public AiRoadmapException(string message, Exception? inner = null) : base(message, inner) { }
    }

    public interface IAiRoadmapService
    {
        Task<AiRoadmapResult> GenerateAsync(AiRoadmapRequest request, CancellationToken cancellationToken = default);
    }

    public class AiRoadmapService : IAiRoadmapService
    {
        private static readonly JsonSerializerOptions JsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        private readonly HttpClient _httpClient;
        private readonly AiRoadmapOptions _options;
        private readonly ILogger<AiRoadmapService> _logger;

        public AiRoadmapService(
            HttpClient httpClient,
            Microsoft.Extensions.Options.IOptions<AiRoadmapOptions> options,
            ILogger<AiRoadmapService> logger)
        {
            _options = options.Value;
            _logger = logger;
            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
            _httpClient.Timeout = TimeSpan.FromSeconds(Math.Max(30, _options.TimeoutSeconds));
        }

        public async Task<AiRoadmapResult> GenerateAsync(AiRoadmapRequest request, CancellationToken cancellationToken = default)
        {
            if (!_options.Enable)
                throw new AiRoadmapException("سرویس هوشمند پیشنهاد مسیر غیرفعال است.");

            request.MaxNodes = _options.MaxNodes;
            request.MaxCoursesPerNode = _options.MaxCoursesPerNode;

            using var message = new HttpRequestMessage(HttpMethod.Post, "v1/roadmap");
            if (!string.IsNullOrWhiteSpace(_options.ApiKey))
                message.Headers.Add("X-Api-Key", _options.ApiKey);
            message.Content = new StringContent(
                JsonSerializer.Serialize(request, JsonOptions),
                Encoding.UTF8,
                "application/json");

            try
            {
                using var response = await _httpClient.SendAsync(message, cancellationToken);
                var body = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Roadmap API returned {StatusCode}: {Body}", response.StatusCode, body);
                    throw new AiRoadmapException("سرویس هوشمند پیشنهاد مسیر پاسخ معتبری برنگرداند.");
                }

                var result = JsonSerializer.Deserialize<AiRoadmapResult>(body, JsonOptions);
                if (result == null || result.Nodes.Count == 0)
                    throw new AiRoadmapException("سرویس هوشمند نقشه راه معتبری تولید نکرد.");
                return result;
            }
            catch (AiRoadmapException)
            {
                throw;
            }
            catch (Exception exc) when (exc is HttpRequestException or TaskCanceledException or JsonException)
            {
                _logger.LogError(exc, "Roadmap API call failed");
                throw new AiRoadmapException("ارتباط با سرویس هوشمند پیشنهاد مسیر برقرار نشد.", exc);
            }
        }
    }
}
