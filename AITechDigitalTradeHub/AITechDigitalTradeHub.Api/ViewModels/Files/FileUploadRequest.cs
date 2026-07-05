namespace AITechDigitalTradeHub.Api.ViewModels.Files
{
    public class FileUploadRequest
    {
        public IFormFile File { get; set; } = default!;

        public string EntityType { get; set; } = "Project";

        public long ForeignKeyId { get; set; } = 0;

        public string? Tag { get; set; }

        public string? Note { get; set; }
    }
}
