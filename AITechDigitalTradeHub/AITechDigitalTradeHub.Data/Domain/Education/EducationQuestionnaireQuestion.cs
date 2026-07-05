using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>سؤال قابل پیکربندی برای ساخت مسیر آموزشی.</summary>
    public class EducationQuestionnaireQuestion : BaseEntity
    {
        [MaxLength(80)]
        public string Code { get; set; } = string.Empty;

        [MaxLength(240)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? HelpText { get; set; }

        public EducationQuestionType QuestionType { get; set; } = EducationQuestionType.SingleChoice;
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; } = true;

        public ICollection<EducationQuestionnaireOption> Options { get; set; } = new List<EducationQuestionnaireOption>();
    }
}
