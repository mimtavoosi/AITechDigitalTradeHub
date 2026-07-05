using System.ComponentModel.DataAnnotations;

namespace AITechDigitalTradeHub.Data.Domain
{
    /// <summary>گزینه سؤال و اثر آن روی امتیازدهی مسیر آموزشی.</summary>
    public class EducationQuestionnaireOption : BaseEntity
    {
        public long QuestionId { get; set; }

        [MaxLength(100)]
        public string Value { get; set; } = string.Empty;

        [MaxLength(220)]
        public string Label { get; set; } = string.Empty;

        public int SortOrder { get; set; }
        public EducationLearningGoal? LearningGoal { get; set; }
        public EducationTargetRole? TargetRole { get; set; }
        public CourseLevel? Level { get; set; }
        public CourseDeliveryMode? PreferredMode { get; set; }
        public int? WeeklyHoursMin { get; set; }
        public int? WeeklyHoursMax { get; set; }
        public long? SkillTagId { get; set; }
        public byte Weight { get; set; } = 1;

        public EducationQuestionnaireQuestion Question { get; set; } = default!;
        public Tag? SkillTag { get; set; }
    }
}
