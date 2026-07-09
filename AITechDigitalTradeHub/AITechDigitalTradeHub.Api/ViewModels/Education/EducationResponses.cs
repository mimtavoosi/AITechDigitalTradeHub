using AITechDigitalTradeHub.Data.Domain;

namespace AITechDigitalTradeHub.Api.ViewModels.Education
{
    public class CourseListItemResponse
    {
        public long Id { get; set; }
        public string Slug { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public CourseLevel Level { get; set; }
        public CourseDeliveryMode DeliveryMode { get; set; }
        public CourseStatus Status { get; set; }
        public decimal PriceAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public int? DurationMinutes { get; set; }
        public DateTime? StartsAt { get; set; }
        public DateTime? PublishedAt { get; set; }
        public string? CategoryName { get; set; }
        public long InstructorUserId { get; set; }
        public string? InstructorName { get; set; }
        public int LessonsCount { get; set; }
        public int EnrollmentsCount { get; set; }
        public EducationLearningGoal? LearningGoal { get; set; }
        public EducationTargetRole? TargetRole { get; set; }
        public int? EstimatedWeeks { get; set; }
        public int? WeeklyHoursMin { get; set; }
        public int? WeeklyHoursMax { get; set; }
        public byte? DifficultyScore { get; set; }
        public bool ProjectBased { get; set; }
        public bool RequiresMentor { get; set; }
        public string? LearningOutcomes { get; set; }
        public string? PrerequisitesSummary { get; set; }

        public static CourseListItemResponse FromEntity(Course course)
        {
            return new CourseListItemResponse
            {
                Id = course.ID,
                Slug = string.IsNullOrWhiteSpace(course.Slug) ? course.ID.ToString() : course.Slug,
                Title = course.Title,
                Description = course.Description,
                Level = course.Level,
                DeliveryMode = course.DeliveryMode,
                Status = course.Status,
                PriceAmount = course.PriceAmount,
                Currency = course.Currency,
                DurationMinutes = course.DurationMinutes,
                StartsAt = course.StartsAt,
                PublishedAt = course.PublishedAt,
                CategoryName = course.Category?.CategoryName,
                InstructorUserId = course.InstructorUserId,
                InstructorName = course.InstructorUser == null ? null : $"{course.InstructorUser.FirstName} {course.InstructorUser.LastName}".Trim(),
                LessonsCount = course.Lessons?.Count ?? 0,
                EnrollmentsCount = course.Enrollments?.Count ?? 0,
                LearningGoal = course.LearningGoal,
                TargetRole = course.TargetRole,
                EstimatedWeeks = course.EstimatedWeeks,
                WeeklyHoursMin = course.WeeklyHoursMin,
                WeeklyHoursMax = course.WeeklyHoursMax,
                DifficultyScore = course.DifficultyScore,
                ProjectBased = course.ProjectBased,
                RequiresMentor = course.RequiresMentor,
                LearningOutcomes = course.LearningOutcomes,
                PrerequisitesSummary = course.PrerequisitesSummary
            };
        }
    }

    public class CourseSectionResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LearningObjective { get; set; }
        public int SortOrder { get; set; }
        public int? DurationMinutes { get; set; }
        public List<CourseLessonResponse> Lessons { get; set; } = new();

        public static CourseSectionResponse FromEntity(CourseSection section)
        {
            return new CourseSectionResponse
            {
                Id = section.ID,
                CourseId = section.CourseId,
                Title = section.Title,
                Description = section.Description,
                LearningObjective = section.LearningObjective,
                SortOrder = section.SortOrder,
                DurationMinutes = section.DurationMinutes,
                Lessons = section.Lessons?.OrderBy(x => x.SortOrder).Select(CourseLessonResponse.FromEntity).ToList() ?? new List<CourseLessonResponse>()
            };
        }
    }

    public class CourseDetailResponse : CourseListItemResponse
    {
        public long? OrganizationId { get; set; }
        public List<CourseSectionResponse> Sections { get; set; } = new();
        public List<CourseLessonResponse> Lessons { get; set; } = new();

        public static new CourseDetailResponse FromEntity(Course course)
        {
            return new CourseDetailResponse
            {
                Id = course.ID,
                Slug = string.IsNullOrWhiteSpace(course.Slug) ? course.ID.ToString() : course.Slug,
                Title = course.Title,
                Description = course.Description,
                Level = course.Level,
                DeliveryMode = course.DeliveryMode,
                Status = course.Status,
                PriceAmount = course.PriceAmount,
                Currency = course.Currency,
                DurationMinutes = course.DurationMinutes,
                StartsAt = course.StartsAt,
                PublishedAt = course.PublishedAt,
                CategoryName = course.Category?.CategoryName,
                InstructorUserId = course.InstructorUserId,
                InstructorName = course.InstructorUser == null ? null : $"{course.InstructorUser.FirstName} {course.InstructorUser.LastName}".Trim(),
                LessonsCount = course.Lessons?.Count ?? 0,
                EnrollmentsCount = course.Enrollments?.Count ?? 0,
                OrganizationId = course.OrganizationId,
                LearningGoal = course.LearningGoal,
                TargetRole = course.TargetRole,
                EstimatedWeeks = course.EstimatedWeeks,
                WeeklyHoursMin = course.WeeklyHoursMin,
                WeeklyHoursMax = course.WeeklyHoursMax,
                DifficultyScore = course.DifficultyScore,
                ProjectBased = course.ProjectBased,
                RequiresMentor = course.RequiresMentor,
                LearningOutcomes = course.LearningOutcomes,
                PrerequisitesSummary = course.PrerequisitesSummary,
                Sections = course.Sections?.OrderBy(x => x.SortOrder).Select(CourseSectionResponse.FromEntity).ToList() ?? new List<CourseSectionResponse>(),
                Lessons = course.Lessons?.OrderBy(x => x.SortOrder).Select(CourseLessonResponse.FromEntity).ToList() ?? new List<CourseLessonResponse>()
            };
        }
    }

    public class CourseLessonResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public long? SectionId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public LessonContentType ContentType { get; set; }
        public int SortOrder { get; set; }
        public int? DurationMinutes { get; set; }
        public string? ExternalUrl { get; set; }
        public bool IsPreview { get; set; }

        public static CourseLessonResponse FromEntity(CourseLesson lesson)
        {
            return new CourseLessonResponse
            {
                Id = lesson.ID,
                CourseId = lesson.CourseId,
                SectionId = lesson.SectionId,
                Title = lesson.Title,
                Description = lesson.Description,
                ContentType = lesson.ContentType,
                SortOrder = lesson.SortOrder,
                DurationMinutes = lesson.DurationMinutes,
                ExternalUrl = lesson.ExternalUrl,
                IsPreview = lesson.IsPreview
            };
        }
    }

    public class CourseEnrollmentResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public string? CourseTitle { get; set; }
        public string? InstructorName { get; set; }
        public EnrollmentStatus Status { get; set; }
        public decimal PaidAmount { get; set; }
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }

        public static CourseEnrollmentResponse FromEntity(CourseEnrollment enrollment)
        {
            return new CourseEnrollmentResponse
            {
                Id = enrollment.ID,
                CourseId = enrollment.CourseId,
                CourseTitle = enrollment.Course?.Title,
                InstructorName = enrollment.Course?.InstructorUser == null ? null : $"{enrollment.Course.InstructorUser.FirstName} {enrollment.Course.InstructorUser.LastName}".Trim(),
                Status = enrollment.Status,
                PaidAmount = enrollment.PaidAmount,
                ProgressPercent = enrollment.ProgressPercent,
                CompletedAt = enrollment.CompletedAt
            };
        }
    }

    public class CourseStudentEnrollmentResponse
    {
        public long Id { get; set; }
        public long CourseId { get; set; }
        public long StudentUserId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string? StudentUsername { get; set; }
        public string? StudentEmail { get; set; }
        public EnrollmentStatus Status { get; set; }
        public decimal PaidAmount { get; set; }
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? EnrolledAt { get; set; }
        public List<CourseLessonProgressResponse> LessonProgresses { get; set; } = new();

        public static CourseStudentEnrollmentResponse FromEntity(CourseEnrollment enrollment, IEnumerable<CourseLessonProgress> progresses)
        {
            return new CourseStudentEnrollmentResponse
            {
                Id = enrollment.ID,
                CourseId = enrollment.CourseId,
                StudentUserId = enrollment.StudentUserId,
                StudentName = enrollment.StudentUser == null ? $"کاربر {enrollment.StudentUserId}" : $"{enrollment.StudentUser.FirstName} {enrollment.StudentUser.LastName}".Trim(),
                StudentUsername = enrollment.StudentUser?.Username,
                StudentEmail = enrollment.StudentUser?.Email,
                Status = enrollment.Status,
                PaidAmount = enrollment.PaidAmount,
                ProgressPercent = enrollment.ProgressPercent,
                CompletedAt = enrollment.CompletedAt,
                EnrolledAt = enrollment.CreateDate,
                LessonProgresses = progresses.Select(CourseLessonProgressResponse.FromEntity).ToList()
            };
        }
    }

    public class CourseLessonProgressResponse
    {
        public long Id { get; set; }
        public long EnrollmentId { get; set; }
        public long CourseLessonId { get; set; }
        public string? LessonTitle { get; set; }
        public LessonProgressStatus Status { get; set; }
        public byte ProgressPercent { get; set; }
        public DateTime? CompletedAt { get; set; }

        public static CourseLessonProgressResponse FromEntity(CourseLessonProgress progress)
        {
            return new CourseLessonProgressResponse
            {
                Id = progress.ID,
                EnrollmentId = progress.EnrollmentId,
                CourseLessonId = progress.CourseLessonId,
                LessonTitle = progress.CourseLesson?.Title,
                Status = progress.Status,
                ProgressPercent = progress.ProgressPercent,
                CompletedAt = progress.CompletedAt
            };
        }
    }

    public class TeacherSlotResponse
    {
        public long Id { get; set; }
        public long InstructorUserId { get; set; }
        public string? InstructorName { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public TeacherSessionMode Mode { get; set; }
        public TeacherAvailabilityStatus Status { get; set; }
        public decimal PriceAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public string? LocationTitle { get; set; }
        public string? Notes { get; set; }

        public static TeacherSlotResponse FromEntity(TeacherAvailabilitySlot slot)
        {
            return new TeacherSlotResponse
            {
                Id = slot.ID,
                InstructorUserId = slot.InstructorUserId,
                InstructorName = slot.InstructorUser == null ? null : $"{slot.InstructorUser.FirstName} {slot.InstructorUser.LastName}".Trim(),
                StartsAt = slot.StartsAt,
                EndsAt = slot.EndsAt,
                Mode = slot.Mode,
                Status = slot.Status,
                PriceAmount = slot.PriceAmount,
                Currency = slot.Currency,
                LocationTitle = slot.LocationTitle,
                Notes = slot.Notes
            };
        }
    }

    public class TeacherBookingResponse
    {
        public long Id { get; set; }
        public long InstructorUserId { get; set; }
        public string? InstructorName { get; set; }
        public long StudentUserId { get; set; }
        public string? StudentName { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public TeacherSessionMode Mode { get; set; }
        public TeacherBookingStatus Status { get; set; }
        public decimal PriceAmount { get; set; }
        public string Currency { get; set; } = "IRR";
        public string? Subject { get; set; }
        public string? StudentNotes { get; set; }
        public string? MeetingUrl { get; set; }

        public static TeacherBookingResponse FromEntity(TeacherBooking booking)
        {
            return new TeacherBookingResponse
            {
                Id = booking.ID,
                InstructorUserId = booking.InstructorUserId,
                InstructorName = booking.InstructorUser == null ? null : $"{booking.InstructorUser.FirstName} {booking.InstructorUser.LastName}".Trim(),
                StudentUserId = booking.StudentUserId,
                StudentName = booking.StudentUser == null ? null : $"{booking.StudentUser.FirstName} {booking.StudentUser.LastName}".Trim(),
                StartsAt = booking.StartsAt,
                EndsAt = booking.EndsAt,
                Mode = booking.Mode,
                Status = booking.Status,
                PriceAmount = booking.PriceAmount,
                Currency = booking.Currency,
                Subject = booking.Subject,
                StudentNotes = booking.StudentNotes,
                MeetingUrl = booking.MeetingUrl
            };
        }
    }

    public class EducationRecommendationResponse
    {
        public string RoadmapTitle { get; set; } = string.Empty;
        public string RoadmapSummary { get; set; } = string.Empty;
        public int TotalEstimatedWeeks { get; set; }
        public List<EducationRoadmapNodeResponse> Nodes { get; set; } = new();
        public List<string> Tips { get; set; } = new();
        public List<CourseListItemResponse> RecommendedCourses { get; set; } = new();
        public List<TeacherSlotResponse> RecommendedTeacherSlots { get; set; } = new();
    }

    public class EducationRoadmapNodeResponse
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<string> DependsOn { get; set; } = new();
        public List<string> Skills { get; set; } = new();
        public int EstimatedWeeks { get; set; }
        public bool IsOptional { get; set; }
        public List<EducationRoadmapNodeCourseResponse> Courses { get; set; } = new();
    }

    public class EducationRoadmapNodeCourseResponse
    {
        public CourseListItemResponse Course { get; set; } = default!;
        public string Reason { get; set; } = string.Empty;
        public int MatchScore { get; set; }
    }

    public class EducationQuestionnaireQuestionResponse
    {
        public long Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? HelpText { get; set; }
        public EducationQuestionType QuestionType { get; set; }
        public int SortOrder { get; set; }
        public bool IsRequired { get; set; }
        public List<EducationQuestionnaireOptionResponse> Options { get; set; } = new();

        public static EducationQuestionnaireQuestionResponse FromEntity(EducationQuestionnaireQuestion question)
        {
            return new EducationQuestionnaireQuestionResponse
            {
                Id = question.ID,
                Code = question.Code,
                Title = question.Title,
                HelpText = question.HelpText,
                QuestionType = question.QuestionType,
                SortOrder = question.SortOrder,
                IsRequired = question.IsRequired,
                Options = question.Options?
                    .Where(x => x.IsActive && x.DeleteDate == null)
                    .OrderBy(x => x.SortOrder)
                    .Select(EducationQuestionnaireOptionResponse.FromEntity)
                    .ToList() ?? new List<EducationQuestionnaireOptionResponse>()
            };
        }
    }

    public class EducationQuestionnaireOptionResponse
    {
        public long Id { get; set; }
        public string Value { get; set; } = string.Empty;
        public string Label { get; set; } = string.Empty;
        public int SortOrder { get; set; }
        public EducationLearningGoal? LearningGoal { get; set; }
        public EducationTargetRole? TargetRole { get; set; }
        public CourseLevel? Level { get; set; }
        public CourseDeliveryMode? PreferredMode { get; set; }
        public int? WeeklyHoursMin { get; set; }
        public int? WeeklyHoursMax { get; set; }
        public long? SkillTagId { get; set; }
        public byte Weight { get; set; }

        public static EducationQuestionnaireOptionResponse FromEntity(EducationQuestionnaireOption option)
        {
            return new EducationQuestionnaireOptionResponse
            {
                Id = option.ID,
                Value = option.Value,
                Label = option.Label,
                SortOrder = option.SortOrder,
                LearningGoal = option.LearningGoal,
                TargetRole = option.TargetRole,
                Level = option.Level,
                PreferredMode = option.PreferredMode,
                WeeklyHoursMin = option.WeeklyHoursMin,
                WeeklyHoursMax = option.WeeklyHoursMax,
                SkillTagId = option.SkillTagId,
                Weight = option.Weight
            };
        }
    }

    public class CourseAccessResponse
    {
        public long CourseId { get; set; }
        public long? EnrollmentId { get; set; }
        public EnrollmentStatus? EnrollmentStatus { get; set; }
        public byte ProgressPercent { get; set; }
        public bool CanAccessPaidLessons { get; set; }
        public bool CanDownloadCertificate { get; set; }
    }

    public class EducationRevenueResponse
    {
        public decimal CourseRevenue { get; set; }
        public decimal BookingRevenue { get; set; }
        public decimal TotalRevenue { get; set; }
        public string Currency { get; set; } = "IRR";
    }

    public class CourseCertificateResponse
    {
        public string CertificateNumber { get; set; } = string.Empty;
        public long EnrollmentId { get; set; }
        public long CourseId { get; set; }
        public string CourseTitle { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string InstructorName { get; set; } = string.Empty;
        public DateTime CompletedAt { get; set; }
        public DateTime IssuedAt { get; set; }
        public byte ProgressPercent { get; set; }

        public static CourseCertificateResponse FromEntity(CourseCertificate certificate)
        {
            return new CourseCertificateResponse
            {
                CertificateNumber = certificate.CertificateNumber,
                EnrollmentId = certificate.EnrollmentId,
                CourseId = certificate.CourseId,
                CourseTitle = certificate.Course.Title,
                StudentName = $"{certificate.StudentUser.FirstName} {certificate.StudentUser.LastName}".Trim(),
                InstructorName = certificate.InstructorUser == null ? string.Empty : $"{certificate.InstructorUser.FirstName} {certificate.InstructorUser.LastName}".Trim(),
                CompletedAt = certificate.CompletedAt,
                IssuedAt = certificate.IssuedAt,
                ProgressPercent = certificate.ProgressPercent
            };
        }
    }

    public class InstructorProfileResponse
    {
        public long UserId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string Headline { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public decimal RatingAverage { get; set; }
        public int CourseCount { get; set; }
        public int StudentCount { get; set; }
        public bool IsVerified { get; set; }

        public static InstructorProfileResponse FromEntity(InstructorProfile profile)
        {
            return new InstructorProfileResponse
            {
                UserId = profile.UserId,
                DisplayName = profile.User == null ? $"مدرس {profile.UserId}" : $"{profile.User.FirstName} {profile.User.LastName}".Trim(),
                Headline = profile.Headline,
                Bio = profile.Bio,
                RatingAverage = profile.RatingAverage,
                CourseCount = profile.CourseCount,
                StudentCount = profile.StudentCount,
                IsVerified = profile.IsVerified
            };
        }
    }
}
