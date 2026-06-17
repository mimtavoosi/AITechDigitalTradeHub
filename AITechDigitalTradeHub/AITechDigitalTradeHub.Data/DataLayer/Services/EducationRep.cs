using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.EntityFrameworkCore;

namespace AITechDigitalTradeHub.Data.DataLayer.Services
{
    public class EducationRep : IEducationRep
    {
        private readonly TheAppContext _context;

        public EducationRep(TheAppContext context)
        {
            _context = context;
        }

        public async Task<BitResultObject> AddCourseAsync(Course course)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                course.Status = CourseStatus.Draft;
                course.CreateDate = DateTime.UtcNow;
                course.UpdateDate = DateTime.UtcNow;
                course.IsActive = true;

                await _context.Courses.AddAsync(course);
                await _context.SaveChangesAsync();
                result.ID = course.ID;
                _context.Entry(course).State = EntityState.Detached;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EditCourseAsync(Course course, long instructorUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var current = await _context.Courses.SingleOrDefaultAsync(x => x.ID == course.ID && x.InstructorUserId == instructorUserId);
                if (current == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "دوره پیدا نشد یا شما دسترسی ویرایش ندارید";
                    return result;
                }

                current.OrganizationId = course.OrganizationId;
                current.CategoryId = course.CategoryId;
                current.Title = course.Title;
                current.Slug = course.Slug;
                current.Description = course.Description;
                current.Level = course.Level;
                current.DeliveryMode = course.DeliveryMode;
                current.PriceAmount = course.PriceAmount;
                current.Currency = course.Currency;
                current.DurationMinutes = course.DurationMinutes;
                current.StartsAt = course.StartsAt;
                current.CoverFileId = course.CoverFileId;
                current.UpdateDate = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                result.ID = current.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Course>> GetAllCoursesAsync(
            CourseStatus? status = null,
            CourseLevel? level = null,
            CourseDeliveryMode? deliveryMode = null,
            long categoryId = 0,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "")
        {
            ListResultObject<Course> results = new ListResultObject<Course>();
            try
            {
                var query = _context.Courses
                    .AsNoTracking()
                    .Include(x => x.InstructorUser)
                    .Include(x => x.Category)
                    .Include(x => x.Lessons)
                    .Include(x => x.Enrollments)
                    .Where(x =>
                        (status == null || x.Status == status) &&
                        (level == null || x.Level == level) &&
                        (deliveryMode == null || x.DeliveryMode == deliveryMode) &&
                        (categoryId <= 0 || x.CategoryId == categoryId) &&
                        (string.IsNullOrEmpty(searchText) ||
                         x.Title.Contains(searchText) ||
                         (x.Description != null && x.Description.Contains(searchText))));

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query
                    .OrderByDescending(x => x.PublishedAt ?? x.CreateDate)
                    .SortBy(sortQuery)
                    .ToPaging(pageIndex, pageSize)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<RowResultObject<Course>> GetCourseByIdAsync(long courseId)
        {
            RowResultObject<Course> result = new RowResultObject<Course>();
            try
            {
                result.Result = await _context.Courses
                    .AsNoTracking()
                    .Include(x => x.InstructorUser)
                    .Include(x => x.Organization)
                    .Include(x => x.Category)
                    .Include(x => x.Lessons)
                    .Include(x => x.Enrollments)
                    .SingleOrDefaultAsync(x => x.ID == courseId);
                result.Status = result.Result != null;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<Course>> GetInstructorCoursesAsync(long instructorUserId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<Course> results = new ListResultObject<Course>();
            try
            {
                var query = _context.Courses
                    .AsNoTracking()
                    .Include(x => x.Category)
                    .Include(x => x.Lessons)
                    .Include(x => x.Enrollments)
                    .Where(x => x.InstructorUserId == instructorUserId);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<ListResultObject<CourseEnrollment>> GetUserEnrollmentsAsync(long studentUserId, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<CourseEnrollment> results = new ListResultObject<CourseEnrollment>();
            try
            {
                var query = _context.CourseEnrollments
                    .AsNoTracking()
                    .Include(x => x.Course)
                        .ThenInclude(x => x.InstructorUser)
                    .Where(x => x.StudentUserId == studentUserId);

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderByDescending(x => x.CreateDate).ToPaging(pageIndex, pageSize).ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> PublishCourseAsync(long courseId, long instructorUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var course = await _context.Courses.SingleOrDefaultAsync(x => x.ID == courseId && x.InstructorUserId == instructorUserId);
                if (course == null)
                {
                    result.Status = false;
                    result.ErrorMessage = "دوره پیدا نشد یا شما دسترسی انتشار ندارید";
                    return result;
                }

                course.Status = CourseStatus.Published;
                course.PublishedAt ??= DateTime.UtcNow;
                course.UpdateDate = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                result.ID = course.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> AddLessonAsync(long courseId, long instructorUserId, CourseLesson lesson)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                bool ownsCourse = await _context.Courses.AnyAsync(x => x.ID == courseId && x.InstructorUserId == instructorUserId);
                if (!ownsCourse)
                {
                    result.Status = false;
                    result.ErrorMessage = "دوره پیدا نشد یا شما دسترسی افزودن درس ندارید";
                    return result;
                }

                lesson.CourseId = courseId;
                lesson.CreateDate = DateTime.UtcNow;
                lesson.UpdateDate = DateTime.UtcNow;
                lesson.IsActive = true;

                await _context.CourseLessons.AddAsync(lesson);
                await _context.SaveChangesAsync();
                result.ID = lesson.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> EnrollAsync(long courseId, long studentUserId)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                var course = await _context.Courses.AsNoTracking().SingleOrDefaultAsync(x => x.ID == courseId);
                if (course == null || course.Status != CourseStatus.Published)
                {
                    result.Status = false;
                    result.ErrorMessage = "دوره منتشرشده پیدا نشد";
                    return result;
                }

                if (course.InstructorUserId == studentUserId)
                {
                    result.Status = false;
                    result.ErrorMessage = "مدرس نمی‌تواند در دوره خودش ثبت‌نام کند";
                    return result;
                }

                var existing = await _context.CourseEnrollments.SingleOrDefaultAsync(x => x.CourseId == courseId && x.StudentUserId == studentUserId);
                if (existing != null)
                {
                    result.ID = existing.ID;
                    return result;
                }

                var enrollment = new CourseEnrollment
                {
                    CourseId = courseId,
                    StudentUserId = studentUserId,
                    Status = course.PriceAmount > 0 ? EnrollmentStatus.PendingPayment : EnrollmentStatus.Active,
                    PaidAmount = 0,
                    ProgressPercent = 0,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };

                await _context.CourseEnrollments.AddAsync(enrollment);
                await _context.SaveChangesAsync();
                result.ID = enrollment.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<ListResultObject<TeacherAvailabilitySlot>> GetInstructorSlotsAsync(long instructorUserId, bool onlyAvailable = true, int pageIndex = 1, int pageSize = 20)
        {
            ListResultObject<TeacherAvailabilitySlot> results = new ListResultObject<TeacherAvailabilitySlot>();
            try
            {
                var query = _context.TeacherAvailabilitySlots
                    .AsNoTracking()
                    .Include(x => x.InstructorUser)
                    .Where(x => x.InstructorUserId == instructorUserId && x.StartsAt >= DateTime.UtcNow);

                if (onlyAvailable)
                {
                    query = query.Where(x => x.Status == TeacherAvailabilityStatus.Available);
                }

                results.TotalCount = await query.CountAsync();
                results.PageCount = DbTools.GetPageCount(results.TotalCount, pageSize);
                results.Results = await query.OrderBy(x => x.StartsAt).ToPaging(pageIndex, pageSize).ToListAsync();
            }
            catch (Exception ex)
            {
                results.Status = false;
                results.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return results;
        }

        public async Task<BitResultObject> AddAvailabilitySlotAsync(TeacherAvailabilitySlot slot)
        {
            BitResultObject result = new BitResultObject();
            try
            {
                if (slot.EndsAt <= slot.StartsAt)
                {
                    result.Status = false;
                    result.ErrorMessage = "زمان پایان باید بعد از زمان شروع باشد";
                    return result;
                }

                bool overlaps = await _context.TeacherAvailabilitySlots.AnyAsync(x =>
                    x.InstructorUserId == slot.InstructorUserId &&
                    x.Status != TeacherAvailabilityStatus.Blocked &&
                    x.StartsAt < slot.EndsAt &&
                    slot.StartsAt < x.EndsAt);

                if (overlaps)
                {
                    result.Status = false;
                    result.ErrorMessage = "این بازه زمانی با بازه دیگری تداخل دارد";
                    return result;
                }

                slot.Status = TeacherAvailabilityStatus.Available;
                slot.CreateDate = DateTime.UtcNow;
                slot.UpdateDate = DateTime.UtcNow;
                slot.IsActive = true;

                await _context.TeacherAvailabilitySlots.AddAsync(slot);
                await _context.SaveChangesAsync();
                result.ID = slot.ID;
            }
            catch (Exception ex)
            {
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }

        public async Task<BitResultObject> BookSlotAsync(long slotId, long studentUserId, string? subject, string? studentNotes)
        {
            BitResultObject result = new BitResultObject();
            await using var tx = await _context.Database.BeginTransactionAsync();
            try
            {
                var slot = await _context.TeacherAvailabilitySlots.SingleOrDefaultAsync(x => x.ID == slotId);
                if (slot == null || slot.Status != TeacherAvailabilityStatus.Available)
                {
                    result.Status = false;
                    result.ErrorMessage = "زمان قابل رزرو پیدا نشد";
                    return result;
                }

                if (slot.InstructorUserId == studentUserId)
                {
                    result.Status = false;
                    result.ErrorMessage = "مدرس نمی‌تواند زمان خودش را رزرو کند";
                    return result;
                }

                var booking = new TeacherBooking
                {
                    InstructorUserId = slot.InstructorUserId,
                    StudentUserId = studentUserId,
                    OrganizationId = slot.OrganizationId,
                    AvailabilitySlotId = slot.ID,
                    StartsAt = slot.StartsAt,
                    EndsAt = slot.EndsAt,
                    Mode = slot.Mode,
                    Status = slot.PriceAmount > 0 ? TeacherBookingStatus.PendingPayment : TeacherBookingStatus.Confirmed,
                    PriceAmount = slot.PriceAmount,
                    Currency = slot.Currency,
                    Subject = subject,
                    StudentNotes = studentNotes,
                    ConfirmedAt = slot.PriceAmount > 0 ? null : DateTime.UtcNow,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                };

                slot.Status = TeacherAvailabilityStatus.Reserved;
                slot.UpdateDate = DateTime.UtcNow;

                await _context.TeacherBookings.AddAsync(booking);
                await _context.SaveChangesAsync();
                await tx.CommitAsync();
                result.ID = booking.ID;
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                result.Status = false;
                result.ErrorMessage = $"{ex.Message} - {ex.InnerException?.Message}";
            }
            return result;
        }
    }
}
