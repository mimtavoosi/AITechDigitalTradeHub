using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Api.Infrastructure
{
    /// <summary>
    /// دیتای اولیه ماژول آموزش: مدرس‌ها، دسته‌بندی‌ها، تگ‌های مهارتی،
    /// دوره‌ها همراه سرفصل و درس، و سوالات پرسشنامه مسیر یادگیری.
    /// با فلگ SeedEducationDataOnStartup اجرا می‌شود و ایدمپوتنت است (دوره تکراری نمی‌سازد).
    /// </summary>
    public static class EducationDataSeeder
    {
        private sealed record SectionSeed(string Title, string Objective, string[] Lessons);

        private sealed record CourseSeed(
            string Slug,
            string Title,
            string Category,
            string Instructor,
            CourseLevel Level,
            CourseDeliveryMode Mode,
            decimal Price,
            EducationLearningGoal Goal,
            EducationTargetRole Role,
            int EstimatedWeeks,
            int WeeklyMin,
            int WeeklyMax,
            byte Difficulty,
            bool ProjectBased,
            bool RequiresMentor,
            string Description,
            string Outcomes,
            string Prerequisites,
            string[] Skills,
            SectionSeed[] Sections);

        public static async Task SeedAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<TheAppContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("EducationDataSeeder");

            var instructors = await EnsureInstructorsAsync(context);
            var categories = await EnsureCategoriesAsync(context);
            var tags = await EnsureTagsAsync(context);
            var createdCourses = await EnsureCoursesAsync(context, instructors, categories, tags);
            var createdQuestions = await EnsureQuestionnaireAsync(context, tags);

            logger.LogInformation(
                "Education seed completed: {Courses} new courses, {Questions} new questionnaire questions.",
                createdCourses, createdQuestions);
        }

        private static async Task<Dictionary<string, User>> EnsureInstructorsAsync(TheAppContext context)
        {
            var hasher = new PasswordHasher<User>();
            var now = DateTime.UtcNow;
            var seeds = new (string Key, string FirstName, string LastName, string Username, string Email, string NationalCode, string Headline, string Bio)[]
            {
                ("ml", "زهرا", "احمدی", "zahra.ahmadi", "zahra.ahmadi@aitechac.com", "0079900011",
                    "مدرس یادگیری ماشین و علم داده", "دکترای هوش مصنوعی، ۸ سال سابقه تدریس و اجرای پروژه‌های داده‌محور صنعتی"),
                ("dl", "امیرحسین", "کریمی", "amir.karimi", "amir.karimi@aitechac.com", "0079900012",
                    "مدرس یادگیری عمیق و بینایی کامپیوتر", "مهندس ارشد بینایی کامپیوتر با تجربه استقرار مدل‌های صنعتی تشخیص تصویر"),
                ("data", "سارا", "محمدی", "sara.mohammadi", "sara.mohammadi@aitechac.com", "0079900013",
                    "مدرس تحلیل داده و SQL", "تحلیل‌گر ارشد داده در حوزه فین‌تک و مدرس دوره‌های ورود به بازار کار داده"),
                ("nlp", "نیما", "رضایی", "nima.rezaei", "nima.rezaei@aitechac.com", "0079900014",
                    "مدرس پردازش زبان طبیعی و LLM", "پژوهشگر NLP فارسی و توسعه‌دهنده سامانه‌های مبتنی بر مدل‌های زبانی بزرگ"),
            };

            var result = new Dictionary<string, User>();
            foreach (var seed in seeds)
            {
                var user = await context.Users.SingleOrDefaultAsync(x => x.Username == seed.Username);
                if (user == null)
                {
                    user = new User
                    {
                        FirstName = seed.FirstName,
                        LastName = seed.LastName,
                        Username = seed.Username,
                        Email = seed.Email,
                        NationalCode = seed.NationalCode,
                        PasswordHash = string.Empty,
                        Status = UserStatus.Active,
                        IsVerified = true,
                        VerificationLevel = 2,
                        ResumeHeadline = seed.Headline,
                        ResumeSummary = seed.Bio,
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    };
                    user.PasswordHash = hasher.HashPassword(user, "Aitech@1404");
                    await context.Users.AddAsync(user);
                    await context.SaveChangesAsync();
                }

                var instructorRole = await context.Roles.SingleOrDefaultAsync(x => x.Name == RoleNames.Instructor);
                if (instructorRole != null &&
                    !await context.UserRoles.AnyAsync(x => x.UserId == user.ID && x.RoleId == instructorRole.ID))
                {
                    await context.UserRoles.AddAsync(new UserRole
                    {
                        UserId = user.ID,
                        RoleId = instructorRole.ID,
                        Status = UserRoleAssignmentStatus.Approved,
                        RequestedAt = now,
                        ApprovedAt = now,
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    });
                }

                if (!await context.InstructorProfiles.AnyAsync(x => x.UserId == user.ID))
                {
                    await context.InstructorProfiles.AddAsync(new InstructorProfile
                    {
                        UserId = user.ID,
                        Headline = seed.Headline,
                        Bio = seed.Bio,
                        IsVerified = true,
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    });
                }

                await context.SaveChangesAsync();
                result[seed.Key] = user;
            }

            return result;
        }

        private static async Task<Dictionary<string, Category>> EnsureCategoriesAsync(TheAppContext context)
        {
            var now = DateTime.UtcNow;
            var names = new (string Name, string Description)[]
            {
                ("برنامه‌نویسی و پایتون", "مبانی برنامه‌نویسی و زبان پایتون به‌عنوان پیش‌نیاز مسیرهای هوش مصنوعی"),
                ("علم داده و تحلیل داده", "تحلیل داده، SQL، مصورسازی و آمار کاربردی"),
                ("یادگیری ماشین", "الگوریتم‌های یادگیری ماشین کلاسیک و ارزیابی مدل"),
                ("یادگیری عمیق و بینایی کامپیوتر", "شبکه‌های عصبی، CNN و کاربردهای بینایی کامپیوتر"),
                ("پردازش زبان طبیعی و LLM", "پردازش متن فارسی، ترنسفورمرها و مدل‌های زبانی بزرگ"),
                ("MLOps و هوش مصنوعی کاربردی", "استقرار مدل، MLOps و ساخت محصول مبتنی بر هوش مصنوعی"),
            };

            var result = new Dictionary<string, Category>();
            foreach (var item in names)
            {
                var category = await context.Categories.FirstOrDefaultAsync(x => x.CategoryName == item.Name);
                if (category == null)
                {
                    category = new Category
                    {
                        CategoryName = item.Name,
                        CategoryDescription = item.Description,
                        TypeMask = CategoryTypeMask.Service,
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    };
                    await context.Categories.AddAsync(category);
                    await context.SaveChangesAsync();
                }
                result[item.Name] = category;
            }

            return result;
        }

        private static async Task<Dictionary<string, Tag>> EnsureTagsAsync(TheAppContext context)
        {
            var now = DateTime.UtcNow;
            var names = new[]
            {
                "پایتون", "پانداس", "نام‌پای", "SQL", "مصورسازی داده", "آمار و احتمال",
                "یادگیری ماشین", "رگرسیون", "دسته‌بندی", "خوشه‌بندی", "ارزیابی مدل", "scikit-learn",
                "یادگیری عمیق", "PyTorch", "TensorFlow", "شبکه عصبی کانولوشنی", "بینایی کامپیوتر", "OpenCV",
                "پردازش زبان طبیعی", "ترنسفورمر", "مدل زبانی بزرگ", "مهندسی پرامپت", "RAG",
                "MLOps", "Docker", "استقرار مدل", "FastAPI", "Git", "اکسل", "Power BI"
            };

            var result = new Dictionary<string, Tag>();
            foreach (var name in names)
            {
                var tag = await context.Tags.FirstOrDefaultAsync(x => x.Name == name);
                if (tag == null)
                {
                    tag = new Tag
                    {
                        Name = name,
                        Slug = Guid.NewGuid().ToString("N")[..12],
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    };
                    await context.Tags.AddAsync(tag);
                    await context.SaveChangesAsync();
                }
                result[name] = tag;
            }

            return result;
        }

        private static async Task<int> EnsureCoursesAsync(
            TheAppContext context,
            Dictionary<string, User> instructors,
            Dictionary<string, Category> categories,
            Dictionary<string, Tag> tags)
        {
            var created = 0;
            foreach (var seed in BuildCourseSeeds())
            {
                if (await context.Courses.AnyAsync(x => x.Slug == seed.Slug))
                {
                    continue;
                }

                var now = DateTime.UtcNow;
                var totalLessons = seed.Sections.Sum(x => x.Lessons.Length);
                var course = new Course
                {
                    InstructorUserId = instructors[seed.Instructor].ID,
                    CategoryId = categories[seed.Category].ID,
                    Title = seed.Title,
                    Slug = seed.Slug,
                    Description = seed.Description,
                    Level = seed.Level,
                    DeliveryMode = seed.Mode,
                    Status = CourseStatus.Published,
                    PriceAmount = seed.Price,
                    Currency = "IRR",
                    DurationMinutes = totalLessons * 45,
                    PublishedAt = now,
                    LearningGoal = seed.Goal,
                    TargetRole = seed.Role,
                    EstimatedWeeks = seed.EstimatedWeeks,
                    WeeklyHoursMin = seed.WeeklyMin,
                    WeeklyHoursMax = seed.WeeklyMax,
                    DifficultyScore = seed.Difficulty,
                    ProjectBased = seed.ProjectBased,
                    RequiresMentor = seed.RequiresMentor,
                    LearningOutcomes = seed.Outcomes,
                    PrerequisitesSummary = seed.Prerequisites,
                    CreateDate = now,
                    UpdateDate = now,
                    IsActive = true
                };

                for (var index = 0; index < seed.Sections.Length; index++)
                {
                    var sectionSeed = seed.Sections[index];
                    course.Sections.Add(new CourseSection
                    {
                        Title = sectionSeed.Title,
                        LearningObjective = sectionSeed.Objective,
                        SortOrder = index + 1,
                        DurationMinutes = sectionSeed.Lessons.Length * 45,
                        CreateDate = now,
                        UpdateDate = now,
                        IsActive = true
                    });
                }

                await context.Courses.AddAsync(course);
                await context.SaveChangesAsync();

                var lessonSort = 1;
                var sections = course.Sections.OrderBy(x => x.SortOrder).ToList();
                for (var index = 0; index < sections.Count; index++)
                {
                    foreach (var lessonTitle in seed.Sections[index].Lessons)
                    {
                        await context.CourseLessons.AddAsync(new CourseLesson
                        {
                            CourseId = course.ID,
                            SectionId = sections[index].ID,
                            Title = lessonTitle,
                            ContentType = LessonContentType.Video,
                            SortOrder = lessonSort++,
                            DurationMinutes = 45,
                            IsPreview = lessonSort <= 3,
                            CreateDate = now,
                            UpdateDate = now,
                            IsActive = true
                        });
                    }
                }

                foreach (var skill in seed.Skills.Where(tags.ContainsKey))
                {
                    await context.CourseSkillTags.AddAsync(new CourseSkillTag
                    {
                        CourseId = course.ID,
                        TagId = tags[skill].ID,
                        Weight = 2
                    });
                }

                await context.SaveChangesAsync();
                created++;
            }

            return created;
        }

        private static async Task<int> EnsureQuestionnaireAsync(TheAppContext context, Dictionary<string, Tag> tags)
        {
            if (await context.EducationQuestionnaireQuestions.AnyAsync())
            {
                return 0;
            }

            var now = DateTime.UtcNow;
            EducationQuestionnaireOption Option(string label, int sort, Action<EducationQuestionnaireOption>? configure = null)
            {
                var option = new EducationQuestionnaireOption
                {
                    Value = $"opt-{Guid.NewGuid():N}"[..20],
                    Label = label,
                    SortOrder = sort,
                    Weight = 1,
                    CreateDate = now,
                    UpdateDate = now,
                    IsActive = true
                };
                configure?.Invoke(option);
                return option;
            }

            var questions = new List<EducationQuestionnaireQuestion>
            {
                new()
                {
                    Code = "goal", Title = "هدف شما از یادگیری هوش مصنوعی چیست؟",
                    HelpText = "این مهم‌ترین عامل برای انتخاب مسیر مناسب شماست.",
                    QuestionType = EducationQuestionType.SingleChoice, SortOrder = 1, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("شروع مسیر شغلی در هوش مصنوعی", 1, x => x.LearningGoal = EducationLearningGoal.CareerStart),
                        Option("ساخت پروژه و نمونه‌کار شخصی", 2, x => x.LearningGoal = EducationLearningGoal.BuildProject),
                        Option("ارتقای مهارت شغلی فعلی", 3, x => x.LearningGoal = EducationLearningGoal.Upskill),
                        Option("تحقیق و پژوهش دانشگاهی", 4, x => x.LearningGoal = EducationLearningGoal.Research)
                    }
                },
                new()
                {
                    Code = "role", Title = "به کدام نقش در حوزه هوش مصنوعی علاقه دارید؟",
                    QuestionType = EducationQuestionType.SingleChoice, SortOrder = 2, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("توسعه‌دهنده هوش مصنوعی", 1, x => x.TargetRole = EducationTargetRole.AiDeveloper),
                        Option("تحلیل‌گر داده", 2, x => x.TargetRole = EducationTargetRole.DataAnalyst),
                        Option("مهندس یادگیری ماشین", 3, x => x.TargetRole = EducationTargetRole.MlEngineer),
                        Option("مدیر محصول هوشمند", 4, x => x.TargetRole = EducationTargetRole.ProductManager)
                    }
                },
                new()
                {
                    Code = "level", Title = "سطح فعلی دانش شما چقدر است؟",
                    QuestionType = EducationQuestionType.SingleChoice, SortOrder = 3, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("مقدماتی، تازه شروع کرده‌ام", 1, x => x.Level = CourseLevel.Beginner),
                        Option("متوسط، پایه‌ها را می‌دانم", 2, x => x.Level = CourseLevel.Intermediate),
                        Option("پیشرفته، دنبال موضوعات تخصصی هستم", 3, x => x.Level = CourseLevel.Advanced)
                    }
                },
                new()
                {
                    Code = "mode", Title = "فرمت یادگیری مطلوب شما چیست؟",
                    QuestionType = EducationQuestionType.SingleChoice, SortOrder = 4, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("ویدیوی ضبط‌شده با ریتم خودم", 1, x => x.PreferredMode = CourseDeliveryMode.Recorded),
                        Option("کلاس آنلاین زنده", 2, x => x.PreferredMode = CourseDeliveryMode.LiveOnline),
                        Option("حضوری در آکادمی", 3, x => x.PreferredMode = CourseDeliveryMode.InPerson),
                        Option("ترکیبی همراه با منتورینگ", 4, x => x.PreferredMode = CourseDeliveryMode.Hybrid)
                    }
                },
                new()
                {
                    Code = "time", Title = "چقدر زمان در هفته برای یادگیری دارید؟",
                    QuestionType = EducationQuestionType.SingleChoice, SortOrder = 5, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("کمتر از ۳ ساعت", 1, x => { x.WeeklyHoursMin = 1; x.WeeklyHoursMax = 3; }),
                        Option("بین ۳ تا ۶ ساعت", 2, x => { x.WeeklyHoursMin = 3; x.WeeklyHoursMax = 6; }),
                        Option("بین ۶ تا ۱۰ ساعت", 3, x => { x.WeeklyHoursMin = 6; x.WeeklyHoursMax = 10; }),
                        Option("بیشتر از ۱۰ ساعت", 4, x => { x.WeeklyHoursMin = 10; x.WeeklyHoursMax = 20; })
                    }
                },
                new()
                {
                    Code = "interests", Title = "به کدام حوزه‌ها علاقه بیشتری دارید؟",
                    HelpText = "می‌توانید چند مورد را انتخاب کنید.",
                    QuestionType = EducationQuestionType.MultiChoice, SortOrder = 6, IsRequired = true,
                    CreateDate = now, UpdateDate = now, IsActive = true,
                    Options =
                    {
                        Option("تحلیل داده و مصورسازی", 1, x => x.SkillTagId = tags["مصورسازی داده"].ID),
                        Option("یادگیری ماشین", 2, x => x.SkillTagId = tags["یادگیری ماشین"].ID),
                        Option("بینایی کامپیوتر", 3, x => x.SkillTagId = tags["بینایی کامپیوتر"].ID),
                        Option("پردازش زبان و چت‌بات", 4, x => x.SkillTagId = tags["مدل زبانی بزرگ"].ID)
                    }
                }
            };

            await context.EducationQuestionnaireQuestions.AddRangeAsync(questions);
            await context.SaveChangesAsync();
            return questions.Count;
        }

        private static IEnumerable<CourseSeed> BuildCourseSeeds()
        {
            const string cProg = "برنامه‌نویسی و پایتون";
            const string cData = "علم داده و تحلیل داده";
            const string cMl = "یادگیری ماشین";
            const string cDl = "یادگیری عمیق و بینایی کامپیوتر";
            const string cNlp = "پردازش زبان طبیعی و LLM";
            const string cOps = "MLOps و هوش مصنوعی کاربردی";

            return new[]
            {
                new CourseSeed("python-basics", "پایتون از صفر: مبانی برنامه‌نویسی", cProg, "ml",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 0, EducationLearningGoal.CareerStart, EducationTargetRole.AiDeveloper,
                    6, 3, 6, 1, false, false,
                    "نقطه شروع همه مسیرهای هوش مصنوعی؛ آموزش برنامه‌نویسی پایتون بدون هیچ پیش‌نیازی با تمرین‌های تعاملی.",
                    "نوشتن برنامه‌های پایتونی، کار با ساختارهای داده، توابع و فایل‌ها",
                    "بدون پیش‌نیاز",
                    new[] { "پایتون", "Git" },
                    new[]
                    {
                        new SectionSeed("شروع کار با پایتون", "آشنایی با محیط توسعه و اجرای اولین برنامه",
                            new[] { "نصب پایتون و VS Code", "اولین برنامه: Hello World", "متغیرها و انواع داده", "ورودی و خروجی و رشته‌ها" }),
                        new SectionSeed("کنترل جریان برنامه", "تسلط بر شرط‌ها و حلقه‌ها",
                            new[] { "عبارات شرطی if/elif/else", "حلقه for و while", "الگوهای رایج حلقه‌ها", "تمرین: بازی حدس عدد" }),
                        new SectionSeed("ساختارهای داده", "کار عملی با لیست، دیکشنری و مجموعه",
                            new[] { "لیست و تاپل", "دیکشنری و مجموعه", "List Comprehension", "تمرین: دفترچه تلفن" }),
                        new SectionSeed("توابع و ماژول‌ها", "نوشتن کد قابل استفاده مجدد",
                            new[] { "تعریف تابع و آرگومان‌ها", "دامنه متغیرها و بازگشت", "ماژول‌ها و پکیج‌ها", "مدیریت خطا با try/except" }),
                        new SectionSeed("پروژه پایانی", "جمع‌بندی مهارت‌ها در یک پروژه واقعی",
                            new[] { "کار با فایل متنی و CSV", "پروژه: تحلیل‌گر هزینه شخصی", "آشنایی با Git و GitHub" })
                    }),

                new CourseSeed("python-for-data", "پایتون برای علم داده: NumPy و Pandas", cProg, "data",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 14_500_000, EducationLearningGoal.CareerStart, EducationTargetRole.DataAnalyst,
                    5, 3, 6, 2, true, false,
                    "پل ورود از برنامه‌نویسی پایه به دنیای داده؛ کار عملی با NumPy و Pandas روی دیتاست‌های واقعی فارسی.",
                    "پاک‌سازی، تبدیل و تحلیل دیتاست‌های واقعی با Pandas",
                    "آشنایی مقدماتی با پایتون",
                    new[] { "پایتون", "پانداس", "نام‌پای" },
                    new[]
                    {
                        new SectionSeed("محاسبات عددی با NumPy", "کار با آرایه‌ها و عملیات برداری",
                            new[] { "آرایه NumPy و تفاوت با لیست", "ایندکس‌گذاری و برش", "عملیات برداری و broadcasting", "توابع آماری آرایه‌ها" }),
                        new SectionSeed("مبانی Pandas", "ساختارهای Series و DataFrame",
                            new[] { "Series و DataFrame", "خواندن CSV و Excel", "انتخاب و فیلتر داده", "ستون‌های محاسباتی" }),
                        new SectionSeed("پاک‌سازی داده", "آماده‌سازی داده کثیف برای تحلیل",
                            new[] { "مقادیر گمشده و تکراری", "تبدیل نوع داده و تاریخ شمسی", "ادغام و اتصال جدول‌ها", "تمرین: پاک‌سازی داده فروشگاه" }),
                        new SectionSeed("تحلیل گروهی و پروژه", "تحلیل واقعی از ابتدا تا گزارش",
                            new[] { "groupby و جدول محوری", "پروژه: تحلیل فروش فروشگاه اینترنتی", "خروجی گرفتن و گزارش‌دهی" })
                    }),

                new CourseSeed("sql-for-analysts", "SQL کاربردی برای تحلیل‌گران داده", cData, "data",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 12_000_000, EducationLearningGoal.Upskill, EducationTargetRole.DataAnalyst,
                    4, 2, 5, 2, false, false,
                    "از SELECT ساده تا کوئری‌های تحلیلی پیشرفته روی دیتابیس واقعی؛ مهارت شماره یک آگهی‌های شغلی داده.",
                    "نوشتن کوئری‌های تحلیلی، JOIN، توابع پنجره‌ای و بهینه‌سازی",
                    "بدون پیش‌نیاز؛ آشنایی با اکسل کمک‌کننده است",
                    new[] { "SQL", "اکسل" },
                    new[]
                    {
                        new SectionSeed("مبانی SQL", "اجرای اولین کوئری‌ها",
                            new[] { "نصب SQL Server و محیط کار", "SELECT و WHERE", "مرتب‌سازی و LIMIT", "توابع متنی و تاریخ" }),
                        new SectionSeed("تجمیع و گروه‌بندی", "پاسخ به سوالات تحلیلی",
                            new[] { "GROUP BY و HAVING", "COUNT/SUM/AVG", "CASE WHEN برای دسته‌بندی", "تمرین: گزارش فروش ماهانه" }),
                        new SectionSeed("اتصال جدول‌ها", "کار با مدل داده چندجدولی",
                            new[] { "INNER و LEFT JOIN", "UNION و زیرکوئری", "CTE و کوئری خوانا", "تمرین: تحلیل سفارش و مشتری" }),
                        new SectionSeed("SQL تحلیلی پیشرفته", "توابع پنجره‌ای در تحلیل واقعی",
                            new[] { "ROW_NUMBER و RANK", "میانگین متحرک و LAG/LEAD", "پروژه: داشبورد کوئری‌های KPI" })
                    }),

                new CourseSeed("data-viz-powerbi", "مصورسازی داده و داشبورد با Power BI", cData, "data",
                    CourseLevel.Intermediate, CourseDeliveryMode.Hybrid, 18_000_000, EducationLearningGoal.Upskill, EducationTargetRole.DataAnalyst,
                    5, 3, 6, 2, true, true,
                    "طراحی داشبوردهای مدیریتی حرفه‌ای؛ از اتصال به داده تا قصه‌گویی با داده برای تصمیم‌گیران.",
                    "ساخت داشبورد تعاملی کامل با Power BI و اصول مصورسازی",
                    "آشنایی با اکسل یا SQL",
                    new[] { "Power BI", "مصورسازی داده", "SQL" },
                    new[]
                    {
                        new SectionSeed("آماده‌سازی داده در Power BI", "اتصال و مدل‌سازی داده",
                            new[] { "اتصال به اکسل و SQL", "Power Query و پاک‌سازی", "مدل داده و روابط", "مبانی DAX" }),
                        new SectionSeed("طراحی بصری", "انتخاب نمودار درست برای هر پیام",
                            new[] { "انواع نمودار و کاربردشان", "اصول رنگ و چیدمان", "فیلتر و Slicer تعاملی", "تمرین: صفحه فروش" }),
                        new SectionSeed("DAX تحلیلی", "محاسبات پیشرفته کسب‌وکاری",
                            new[] { "Measure و ستون محاسباتی", "توابع زمانی و مقایسه دوره‌ای", "متغیرها در DAX" }),
                        new SectionSeed("پروژه داشبورد مدیریتی", "تحویل یک داشبورد قابل ارائه",
                            new[] { "پروژه: داشبورد KPI فروش", "انتشار و اشتراک‌گذاری", "قصه‌گویی با داده در ارائه" })
                    }),

                new CourseSeed("statistics-for-ds", "آمار و احتمال کاربردی برای علم داده", cData, "ml",
                    CourseLevel.Intermediate, CourseDeliveryMode.Recorded, 15_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.DataAnalyst,
                    6, 3, 6, 3, false, false,
                    "آمار را با شهود و کدنویسی پایتون یاد بگیرید نه با فرمول‌های خشک؛ پایه ضروری یادگیری ماشین.",
                    "درک توزیع‌ها، آزمون فرض، فاصله اطمینان و رگرسیون آماری",
                    "پایتون مقدماتی و ریاضی دبیرستان",
                    new[] { "آمار و احتمال", "پایتون", "نام‌پای" },
                    new[]
                    {
                        new SectionSeed("آمار توصیفی", "خلاصه‌سازی و درک داده",
                            new[] { "میانگین، میانه و پراکندگی", "توزیع داده و هیستوگرام", "همبستگی و ماتریس همبستگی", "تمرین: توصیف دیتاست واقعی" }),
                        new SectionSeed("احتمال و توزیع‌ها", "شهود احتمالاتی برای مدل‌سازی",
                            new[] { "مبانی احتمال و احتمال شرطی", "توزیع نرمال و دوجمله‌ای", "قضیه حد مرکزی با شبیه‌سازی", "قضیه بیز با مثال واقعی" }),
                        new SectionSeed("استنباط آماری", "نتیجه‌گیری معتبر از داده",
                            new[] { "نمونه‌گیری و فاصله اطمینان", "آزمون فرض و p-value", "آزمون A/B در عمل", "خطاهای رایج تفسیر آماری" }),
                        new SectionSeed("رگرسیون آماری", "مدل‌سازی رابطه متغیرها",
                            new[] { "رگرسیون خطی ساده و چندگانه", "تفسیر ضرایب و R²", "پروژه: تحلیل عوامل قیمت مسکن" })
                    }),

                new CourseSeed("ml-foundations", "یادگیری ماشین جامع با scikit-learn", cMl, "ml",
                    CourseLevel.Intermediate, CourseDeliveryMode.Recorded, 24_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.MlEngineer,
                    8, 4, 8, 3, true, false,
                    "دوره مرجع یادگیری ماشین آکادمی؛ همه الگوریتم‌های کلیدی با پیاده‌سازی روی دیتاست‌های واقعی و پروژه نمونه‌کار.",
                    "آموزش، ارزیابی و بهبود مدل‌های یادگیری ماشین کلاسیک به‌صورت end-to-end",
                    "پایتون، Pandas و مبانی آمار",
                    new[] { "یادگیری ماشین", "scikit-learn", "رگرسیون", "دسته‌بندی", "ارزیابی مدل", "پایتون" },
                    new[]
                    {
                        new SectionSeed("مقدمات یادگیری ماشین", "چارچوب فکری حل مسئله با ML",
                            new[] { "انواع یادگیری: نظارت‌شده و بدون نظارت", "چرخه حیات پروژه ML", "آماده‌سازی داده و train/test split", "اولین مدل با scikit-learn" }),
                        new SectionSeed("مدل‌های رگرسیون", "پیش‌بینی مقادیر پیوسته",
                            new[] { "رگرسیون خطی و چندجمله‌ای", "Ridge و Lasso", "معیارهای MAE/MSE/R²", "تمرین: پیش‌بینی قیمت خودرو" }),
                        new SectionSeed("مدل‌های دسته‌بندی", "الگوریتم‌های کلیدی classification",
                            new[] { "رگرسیون لجستیک", "درخت تصمیم و جنگل تصادفی", "KNN و SVM", "Precision/Recall و ماتریس درهم‌ریختگی", "تمرین: تشخیص ریزش مشتری" }),
                        new SectionSeed("یادگیری بدون نظارت", "کشف ساختار پنهان داده",
                            new[] { "خوشه‌بندی K-Means", "خوشه‌بندی سلسله‌مراتبی و DBSCAN", "کاهش بعد با PCA", "تمرین: بخش‌بندی مشتریان" }),
                        new SectionSeed("بهبود و تنظیم مدل", "از مدل خوب به مدل عالی",
                            new[] { "Cross Validation", "Grid Search و تنظیم ابرپارامتر", "مهندسی ویژگی", "Overfitting و Regularization", "Pipeline در scikit-learn" }),
                        new SectionSeed("پروژه پایانی نمونه‌کار", "یک پروژه کامل قابل ارائه به کارفرما",
                            new[] { "تعریف مسئله و EDA", "ساخت و مقایسه مدل‌ها", "گزارش نهایی و ارائه در GitHub" })
                    }),

                new CourseSeed("ml-advanced-ensemble", "یادگیری ماشین پیشرفته: مدل‌های Ensemble و XGBoost", cMl, "ml",
                    CourseLevel.Advanced, CourseDeliveryMode.LiveOnline, 28_000_000, EducationLearningGoal.Upskill, EducationTargetRole.MlEngineer,
                    6, 4, 8, 4, true, true,
                    "تکنیک‌های برنده مسابقات Kaggle؛ Gradient Boosting، تفسیرپذیری مدل و کار با داده نامتوازن.",
                    "تسلط بر XGBoost/LightGBM، تفسیر مدل با SHAP و مدیریت داده نامتوازن",
                    "دوره یادگیری ماشین جامع یا معادل آن",
                    new[] { "یادگیری ماشین", "scikit-learn", "ارزیابی مدل" },
                    new[]
                    {
                        new SectionSeed("مدل‌های ترکیبی", "قدرت جمعی مدل‌های ساده",
                            new[] { "Bagging و Random Forest عمیق‌تر", "Boosting و AdaBoost", "Stacking و Voting" }),
                        new SectionSeed("Gradient Boosting حرفه‌ای", "کار با کتابخانه‌های صنعتی",
                            new[] { "XGBoost از درون", "LightGBM و CatBoost", "تنظیم ابرپارامتر با Optuna", "تمرین: مسابقه پیش‌بینی اعتبار" }),
                        new SectionSeed("چالش‌های داده واقعی", "مسائلی که در کتاب‌ها نیست",
                            new[] { "داده نامتوازن و SMOTE", "نشت داده و اعتبارسنجی زمانی", "ویژگی‌های دسته‌ای با کاردینالیتی بالا" }),
                        new SectionSeed("تفسیرپذیری و تحویل", "مدلی که کسب‌وکار به آن اعتماد کند",
                            new[] { "SHAP و اهمیت ویژگی‌ها", "پروژه: مدل امتیازدهی اعتباری تفسیرپذیر", "مستندسازی و ارائه به ذی‌نفعان" })
                    }),

                new CourseSeed("deep-learning-pytorch", "یادگیری عمیق با PyTorch", cDl, "dl",
                    CourseLevel.Intermediate, CourseDeliveryMode.Recorded, 26_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.AiDeveloper,
                    8, 4, 8, 4, true, false,
                    "از نورون تا شبکه‌های عمیق؛ ساخت و آموزش شبکه‌های عصبی با PyTorch به همراه پروژه‌های تصویری و متنی.",
                    "طراحی، آموزش و دیباگ شبکه‌های عصبی با PyTorch",
                    "یادگیری ماشین مقدماتی و پایتون",
                    new[] { "یادگیری عمیق", "PyTorch", "شبکه عصبی کانولوشنی", "پایتون" },
                    new[]
                    {
                        new SectionSeed("مبانی شبکه عصبی", "درک عمیق ساختار و آموزش شبکه",
                            new[] { "نورون، لایه و تابع فعال‌سازی", "Forward و Backpropagation", "گرادیان کاهشی و نرخ یادگیری", "تنسورها در PyTorch" }),
                        new SectionSeed("آموزش شبکه در PyTorch", "چرخه کامل training loop",
                            new[] { "Dataset و DataLoader", "تعریف مدل با nn.Module", "توابع هزینه و بهینه‌سازها", "تمرین: دسته‌بندی ارقام MNIST" }),
                        new SectionSeed("شبکه‌های کانولوشنی", "بینایی کامپیوتر با CNN",
                            new[] { "لایه کانولوشن و Pooling", "معماری‌های معروف: ResNet و VGG", "Transfer Learning", "تمرین: دسته‌بندی تصاویر محصولات" }),
                        new SectionSeed("تکنیک‌های آموزش بهتر", "جلوگیری از overfitting و آموزش پایدار",
                            new[] { "Batch Normalization و Dropout", "Data Augmentation", "زمان‌بندی نرخ یادگیری", "ذخیره و بارگذاری مدل" }),
                        new SectionSeed("پروژه پایانی", "یک سیستم بینایی کامل",
                            new[] { "پروژه: تشخیص بیماری برگ گیاه از تصویر", "ارزیابی و تحلیل خطاها", "آماده‌سازی مدل برای استقرار" })
                    }),

                new CourseSeed("computer-vision-applied", "بینایی کامپیوتر کاربردی: از OpenCV تا YOLO", cDl, "dl",
                    CourseLevel.Advanced, CourseDeliveryMode.Hybrid, 30_000_000, EducationLearningGoal.BuildProject, EducationTargetRole.AiDeveloper,
                    7, 4, 8, 4, true, true,
                    "ساخت سیستم‌های واقعی بینایی کامپیوتر: تشخیص اشیا، ردیابی و OCR فارسی با پروژه‌های صنعتی.",
                    "پیاده‌سازی تشخیص اشیا، سگمنتیشن و OCR در پروژه‌های واقعی",
                    "یادگیری عمیق با PyTorch یا معادل",
                    new[] { "بینایی کامپیوتر", "OpenCV", "PyTorch", "یادگیری عمیق" },
                    new[]
                    {
                        new SectionSeed("پردازش تصویر با OpenCV", "پایه‌های کار با تصویر و ویدیو",
                            new[] { "خواندن و تبدیل تصویر", "فیلترها و لبه‌یابی", "کار با ویدیو و وب‌کم", "تمرین: شمارنده اشیای ساده" }),
                        new SectionSeed("تشخیص اشیا", "مدل‌های Object Detection مدرن",
                            new[] { "مفاهیم IoU و NMS", "معماری YOLO", "آموزش YOLO روی دیتاست سفارشی", "تمرین: تشخیص خودرو و پلاک" }),
                        new SectionSeed("سگمنتیشن و ردیابی", "درک صحنه در سطح پیکسل",
                            new[] { "Semantic و Instance Segmentation", "ردیابی چندشیئی در ویدیو", "تمرین: تحلیل تردد فروشگاه" }),
                        new SectionSeed("OCR و پروژه صنعتی", "استخراج متن فارسی از تصویر",
                            new[] { "پیش‌پردازش برای OCR فارسی", "مدل‌های OCR آماده و fine-tune", "پروژه: سامانه ثبت خودکار پلاک", "استقرار روی دوربین لبه" })
                    }),

                new CourseSeed("nlp-persian", "پردازش زبان طبیعی فارسی", cNlp, "nlp",
                    CourseLevel.Intermediate, CourseDeliveryMode.Recorded, 22_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.AiDeveloper,
                    6, 3, 6, 3, true, false,
                    "چالش‌های خاص متن فارسی را حرفه‌ای حل کنید: نرمال‌سازی، تحلیل احساسات و دسته‌بندی متن با مدل‌های مدرن.",
                    "ساخت پایپ‌لاین کامل NLP فارسی از پیش‌پردازش تا مدل ترنسفورمری",
                    "پایتون و مبانی یادگیری ماشین",
                    new[] { "پردازش زبان طبیعی", "ترنسفورمر", "پایتون", "یادگیری عمیق" },
                    new[]
                    {
                        new SectionSeed("پیش‌پردازش متن فارسی", "آماده‌سازی درست متن فارسی",
                            new[] { "نرمال‌سازی و نیم‌فاصله", "توکنایز و ریشه‌یابی با Hazm", "حذف ایست‌واژه‌ها", "تمرین: پاک‌سازی نظرات دیجی‌کالا" }),
                        new SectionSeed("بازنمایی متن", "از Bag of Words تا Embedding",
                            new[] { "TF-IDF و کاربردهایش", "Word2Vec و FastText فارسی", "شباهت معنایی جملات", "تمرین: موتور جستجوی ساده" }),
                        new SectionSeed("مدل‌های ترنسفورمری", "کار با BERT فارسی",
                            new[] { "معماری ترنسفورمر به زبان ساده", "ParsBERT و Hugging Face", "Fine-tune برای دسته‌بندی", "تمرین: تحلیل احساسات نظرات" }),
                        new SectionSeed("پروژه کاربردی", "سیستم NLP قابل ارائه",
                            new[] { "پروژه: دسته‌بندی خودکار تیکت‌های پشتیبانی", "ارزیابی و بهبود مدل", "ارائه API ساده برای مدل" })
                    }),

                new CourseSeed("llm-engineering", "مهندسی LLM: ساخت اپلیکیشن با مدل‌های زبانی بزرگ", cNlp, "nlp",
                    CourseLevel.Advanced, CourseDeliveryMode.LiveOnline, 32_000_000, EducationLearningGoal.BuildProject, EducationTargetRole.AiDeveloper,
                    7, 4, 8, 4, true, true,
                    "داغ‌ترین مهارت بازار: طراحی پرامپت، RAG، ایجنت‌ها و استقرار چت‌بات‌های سازمانی مبتنی بر LLM.",
                    "ساخت اپلیکیشن‌های RAG و ایجنت با LLMهای متن‌باز و API",
                    "پایتون پیشرفته و آشنایی با NLP",
                    new[] { "مدل زبانی بزرگ", "مهندسی پرامپت", "RAG", "FastAPI", "پردازش زبان طبیعی" },
                    new[]
                    {
                        new SectionSeed("کار با LLMها", "درک عمیق قابلیت‌ها و محدودیت‌ها",
                            new[] { "معماری LLMها و توکن‌ها", "کار با API و مدل‌های متن‌باز", "پارامترهای تولید متن", "توهم مدل و روش‌های کنترل" }),
                        new SectionSeed("مهندسی پرامپت", "طراحی سیستماتیک پرامپت",
                            new[] { "الگوهای پرامپت‌نویسی", "Few-shot و Chain of Thought", "خروجی ساخت‌یافته JSON", "ارزیابی کیفیت پاسخ‌ها" }),
                        new SectionSeed("RAG: پاسخ از دانش سازمانی", "اتصال LLM به داده‌های خودتان",
                            new[] { "Embedding و پایگاه داده برداری", "چانک‌بندی هوشمند اسناد", "پایپ‌لاین RAG کامل", "تمرین: چت‌بات اسناد فارسی" }),
                        new SectionSeed("ایجنت‌ها و ابزارها", "LLMهایی که کار انجام می‌دهند",
                            new[] { "Function Calling", "ایجنت چندمرحله‌ای", "تمرین: دستیار رزرو و جستجو" }),
                        new SectionSeed("استقرار و پروژه نهایی", "از نوت‌بوک تا محصول",
                            new[] { "سرو مدل متن‌باز با vLLM", "پروژه: چت‌بات پشتیبانی سازمانی", "مانیتورینگ هزینه و کیفیت" })
                    }),

                new CourseSeed("mlops-deployment", "MLOps و استقرار مدل‌های یادگیری ماشین", cOps, "dl",
                    CourseLevel.Advanced, CourseDeliveryMode.Recorded, 27_000_000, EducationLearningGoal.Upskill, EducationTargetRole.MlEngineer,
                    6, 4, 8, 4, true, false,
                    "فاصله بین نوت‌بوک و محصول واقعی؛ API سازی، داکرایز، CI/CD و مانیتورینگ مدل در production.",
                    "استقرار حرفه‌ای مدل ML به‌صورت سرویس پایدار و قابل مانیتور",
                    "یادگیری ماشین و آشنایی با خط فرمان لینوکس",
                    new[] { "MLOps", "Docker", "استقرار مدل", "FastAPI", "Git" },
                    new[]
                    {
                        new SectionSeed("از مدل تا API", "سرویس‌دهی مدل با FastAPI",
                            new[] { "طراحی API برای مدل ML", "FastAPI و اعتبارسنجی ورودی", "سریالایز مدل و versioning", "تمرین: API پیش‌بینی قیمت" }),
                        new SectionSeed("کانتینر و استقرار", "اجرای قابل تکرار در هر محیط",
                            new[] { "Docker از صفر", "ایمیج بهینه برای ML", "docker-compose و سرویس‌ها", "استقرار روی سرور لینوکس" }),
                        new SectionSeed("اتوماسیون و CI/CD", "تحویل مداوم مدل",
                            new[] { "Git حرفه‌ای و GitHub Actions", "تست خودکار مدل و API", "آموزش مجدد زمان‌بندی‌شده" }),
                        new SectionSeed("مانیتورینگ در production", "مدل زنده را سالم نگه دارید",
                            new[] { "لاگ و متریک‌های سرویس", "Drift داده و کیفیت مدل", "پروژه: پایپ‌لاین کامل MLOps" })
                    }),

                new CourseSeed("ai-product-management", "مدیریت محصول هوش مصنوعی", cOps, "data",
                    CourseLevel.Intermediate, CourseDeliveryMode.LiveOnline, 20_000_000, EducationLearningGoal.Upskill, EducationTargetRole.ProductManager,
                    5, 3, 5, 2, false, true,
                    "برای مدیرانی که می‌خواهند محصول AI بسازند: امکان‌سنجی، متریک‌ها، اخلاق و همکاری موثر با تیم فنی.",
                    "تعریف، اولویت‌بندی و راهبری محصولات مبتنی بر هوش مصنوعی",
                    "آشنایی کلی با مفاهیم نرم‌افزار؛ بدون نیاز به کدنویسی",
                    new[] { "یادگیری ماشین", "مصورسازی داده" },
                    new[]
                    {
                        new SectionSeed("سواد AI برای مدیران", "درک درست از توانایی‌های واقعی AI",
                            new[] { "AI چه می‌تواند و چه نمی‌تواند", "انواع مسائل ML با مثال محصول", "هزینه واقعی پروژه‌های AI" }),
                        new SectionSeed("کشف و امکان‌سنجی", "انتخاب مسئله درست",
                            new[] { "شناسایی فرصت‌های AI در محصول", "ارزیابی داده موجود", "PoC ارزان و سریع", "تمرین: کانواس محصول AI" }),
                        new SectionSeed("متریک و ارزیابی", "سنجش موفقیت محصول AI",
                            new[] { "متریک مدل در برابر متریک محصول", "طراحی آزمون A/B برای فیچر AI", "حلقه بازخورد کاربر" }),
                        new SectionSeed("اخلاق، ریسک و اجرا", "محصول مسئولانه و قابل دفاع",
                            new[] { "سوگیری و انصاف مدل", "حریم خصوصی داده", "پروژه: PRD کامل یک فیچر AI" })
                    }),

                new CourseSeed("ai-for-teens", "هوش مصنوعی برای نوجوانان: شروع خلاقانه", cProg, "ml",
                    CourseLevel.Beginner, CourseDeliveryMode.InPerson, 9_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.AiDeveloper,
                    8, 2, 4, 1, true, true,
                    "دوره حضوری ویژه دانش‌آموزان؛ آشنایی با هوش مصنوعی از طریق بازی، پروژه‌های خلاقانه و ابزارهای بصری.",
                    "درک مفاهیم AI و ساخت اولین پروژه‌های هوشمند ساده",
                    "بدون پیش‌نیاز؛ مناسب ۱۲ تا ۱۷ سال",
                    new[] { "پایتون" },
                    new[]
                    {
                        new SectionSeed("دنیای هوش مصنوعی", "آشنایی هیجان‌انگیز با AI اطراف ما",
                            new[] { "هوش مصنوعی در زندگی روزمره", "بازی: آموزش ماشین با Teachable Machine", "ربات‌ها چگونه یاد می‌گیرند؟" }),
                        new SectionSeed("برنامه‌نویسی بازی‌گونه", "اولین قدم‌های کدنویسی",
                            new[] { "شروع پایتون با پروژه‌های کوچک", "شرط و حلقه با بازی", "ساخت چت‌بات ساده قانون‌محور" }),
                        new SectionSeed("پروژه‌های هوشمند", "ساختنی‌های واقعی با AI",
                            new[] { "تشخیص تصویر با ابزار آماده", "پروژه گروهی: دستیار مدرسه", "ارائه پروژه به خانواده‌ها" })
                    }),

                new CourseSeed("excel-to-python", "از اکسل به پایتون: مهاجرت تحلیل‌گران", cData, "data",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 10_000_000, EducationLearningGoal.Upskill, EducationTargetRole.DataAnalyst,
                    4, 2, 4, 1, false, false,
                    "برای تحلیل‌گرانی که اکسل بلدند و می‌خواهند به سطح بعدی بروند؛ هر مفهوم با معادل اکسلی‌اش آموزش داده می‌شود.",
                    "انجام تحلیل‌های اکسلی روزمره با Pandas و خودکارسازی گزارش‌ها",
                    "تسلط نسبی بر اکسل",
                    new[] { "اکسل", "پایتون", "پانداس" },
                    new[]
                    {
                        new SectionSeed("پایتون به زبان اکسل", "نگاشت مفاهیم آشنا به دنیای جدید",
                            new[] { "نصب و اولین نوت‌بوک", "DataFrame یعنی همان Sheet", "فرمول‌ها در برابر کد" }),
                        new SectionSeed("عملیات روزمره تحلیل", "کارهای همیشگی، این‌بار با کد",
                            new[] { "فیلتر و مرتب‌سازی و VLOOKUP با merge", "Pivot Table با pandas", "نمودارهای سریع", "تمرین: بازسازی گزارش اکسلی" }),
                        new SectionSeed("خودکارسازی", "جادوی واقعی پایتون",
                            new[] { "خواندن ده‌ها فایل اکسل یکجا", "گزارش خودکار هفتگی", "پروژه: خودکارسازی گزارش فروش" })
                    }),

                new CourseSeed("time-series-forecasting", "پیش‌بینی سری‌های زمانی", cMl, "ml",
                    CourseLevel.Advanced, CourseDeliveryMode.Recorded, 23_000_000, EducationLearningGoal.Upskill, EducationTargetRole.MlEngineer,
                    5, 3, 6, 4, true, false,
                    "پیش‌بینی فروش، تقاضا و قیمت؛ از مدل‌های آماری کلاسیک تا مدل‌های یادگیری ماشین و عمیق برای داده زمانی.",
                    "ساخت و ارزیابی صحیح مدل‌های پیش‌بینی سری زمانی",
                    "یادگیری ماشین و آمار مقدماتی",
                    new[] { "یادگیری ماشین", "آمار و احتمال", "پانداس" },
                    new[]
                    {
                        new SectionSeed("مبانی سری زمانی", "درک ساختار داده زمانی",
                            new[] { "روند، فصلی‌بودن و نویز", "ایستایی و تبدیل‌ها", "تجزیه سری زمانی", "اعتبارسنجی زمانی صحیح" }),
                        new SectionSeed("مدل‌های آماری", "روش‌های اثبات‌شده کلاسیک",
                            new[] { "میانگین متحرک و هموارسازی نمایی", "ARIMA و SARIMA", "Prophet در عمل", "تمرین: پیش‌بینی تقاضای محصول" }),
                        new SectionSeed("ML برای سری زمانی", "رویکرد مدرن ویژگی‌محور",
                            new[] { "مهندسی ویژگی زمانی و lag", "XGBoost برای پیش‌بینی", "پیش‌بینی چندگام و بازه اطمینان", "پروژه: پیش‌بینی فروش فروشگاه زنجیره‌ای" })
                    }),

                new CourseSeed("recommender-systems", "سیستم‌های پیشنهاددهنده", cMl, "nlp",
                    CourseLevel.Advanced, CourseDeliveryMode.Recorded, 21_000_000, EducationLearningGoal.BuildProject, EducationTargetRole.MlEngineer,
                    4, 3, 6, 4, true, false,
                    "موتور پیشنهاد مثل دیجی‌کالا و فیلیمو بسازید؛ از فیلترینگ مشارکتی تا مدل‌های مبتنی بر Embedding.",
                    "طراحی و ارزیابی سیستم پیشنهاددهنده کامل",
                    "یادگیری ماشین و پایتون",
                    new[] { "یادگیری ماشین", "پایتون", "ارزیابی مدل" },
                    new[]
                    {
                        new SectionSeed("مبانی سیستم‌های پیشنهاد", "انواع رویکردها و داده‌ها",
                            new[] { "پیشنهاد محبوب‌ترین‌ها و قواعد", "فیلترینگ مشارکتی user-based و item-based", "معیارهای ارزیابی آفلاین" }),
                        new SectionSeed("مدل‌های ماتریسی و Embedding", "روش‌های مدرن پیشنهاد",
                            new[] { "Matrix Factorization", "Embedding کاربر و آیتم", "پیشنهاد محتوامحور با متن", "مسئله شروع سرد" }),
                        new SectionSeed("پروژه موتور پیشنهاد", "پیاده‌سازی انتها به انتها",
                            new[] { "پروژه: پیشنهاددهنده فیلم فارسی", "ترکیب چند مدل", "ارائه از طریق API" })
                    }),

                new CourseSeed("genai-content", "هوش مصنوعی مولد برای تولید محتوا", cNlp, "nlp",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 8_500_000, EducationLearningGoal.Upskill, EducationTargetRole.ProductManager,
                    3, 2, 4, 1, false, false,
                    "بدون کدنویسی از ابزارهای مولد بیشترین بهره را بگیرید: متن، تصویر و ویدیو برای بازاریابی و تولید محتوا.",
                    "استفاده حرفه‌ای از ابزارهای GenAI در کار روزمره محتوا",
                    "بدون پیش‌نیاز",
                    new[] { "مهندسی پرامپت", "مدل زبانی بزرگ" },
                    new[]
                    {
                        new SectionSeed("ابزارهای متنی", "نوشتن بهتر و سریع‌تر با AI",
                            new[] { "اصول پرامپت‌نویسی موثر", "تولید مقاله و کپشن", "بازنویسی و ترجمه هوشمند", "تمرین: تقویم محتوایی یک برند" }),
                        new SectionSeed("تصویر و ویدیوی مولد", "خلق بصری بدون طراح",
                            new[] { "تولید تصویر با پرامپت", "ویرایش هوشمند تصویر", "ویدیوهای کوتاه مولد" }),
                        new SectionSeed("جریان کاری حرفه‌ای", "AI در فرایند واقعی کار",
                            new[] { "خودکارسازی تولید محتوا", "اخلاق و کپی‌رایت محتوی مولد", "پروژه: کمپین کامل با ابزارهای AI" })
                    }),

                new CourseSeed("interview-prep-ds", "آمادگی مصاحبه شغلی علم داده", cOps, "data",
                    CourseLevel.Intermediate, CourseDeliveryMode.Hybrid, 16_000_000, EducationLearningGoal.CareerStart, EducationTargetRole.DataAnalyst,
                    4, 3, 5, 3, false, true,
                    "آخرین قدم مسیر: رزومه، نمونه‌کار، سوالات فنی پرتکرار و مصاحبه آزمایشی با منتور.",
                    "آمادگی کامل برای فرایند استخدام تحلیل‌گر داده و دانشمند داده",
                    "تسلط بر SQL و پایتون و مبانی ML",
                    new[] { "SQL", "پایتون", "یادگیری ماشین", "آمار و احتمال" },
                    new[]
                    {
                        new SectionSeed("برندسازی حرفه‌ای", "دیده شدن توسط کارفرما",
                            new[] { "رزومه داده‌محور موثر", "پروفایل GitHub و LinkedIn", "ساخت نمونه‌کار متمایز" }),
                        new SectionSeed("سوالات فنی", "تمرین سوالات واقعی مصاحبه",
                            new[] { "SQL پرتکرار در مصاحبه‌ها", "آمار و احتمال مصاحبه‌ای", "سوالات ML مفهومی", "چالش‌های Case Study" }),
                        new SectionSeed("مصاحبه آزمایشی", "شبیه‌سازی واقعی با بازخورد",
                            new[] { "مصاحبه فنی آزمایشی با منتور", "مصاحبه رفتاری و مذاکره حقوق", "برنامه اقدام شخصی" })
                    }),

                new CourseSeed("math-for-ml", "ریاضیات یادگیری ماشین به زبان ساده", cMl, "ml",
                    CourseLevel.Beginner, CourseDeliveryMode.Recorded, 11_000_000, EducationLearningGoal.Research, EducationTargetRole.MlEngineer,
                    5, 3, 6, 2, false, false,
                    "جبر خطی، مشتق و بهینه‌سازی را دقیقاً به اندازه‌ای که برای فهم عمیق ML لازم است، با شهود بصری بیاموزید.",
                    "درک ریاضی پشت الگوریتم‌های ML برای مطالعه عمیق‌تر و پژوهش",
                    "ریاضی دبیرستان",
                    new[] { "آمار و احتمال", "نام‌پای" },
                    new[]
                    {
                        new SectionSeed("جبر خطی کاربردی", "بردارها و ماتریس‌ها با شهود هندسی",
                            new[] { "بردار و فضای ویژگی", "ضرب ماتریسی و تبدیل‌ها", "مقادیر ویژه و PCA", "پیاده‌سازی با NumPy" }),
                        new SectionSeed("حسابان برای ML", "مشتق در خدمت یادگیری",
                            new[] { "مشتق و گرادیان با شهود", "قاعده زنجیره‌ای و backprop", "گرادیان کاهشی از صفر" }),
                        new SectionSeed("بهینه‌سازی و احتمال", "قلب الگوریتم‌های یادگیری",
                            new[] { "توابع هزینه و تحدب", "احتمال و درست‌نمایی", "پروژه: رگرسیون خطی از صفر با ریاضیات" })
                    }),
            };
        }
    }
}
