using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.Services;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Education;
using AITechDigitalTradeHub.Data.DataLayer;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.Tools;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.OutputCaching;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EducationController : ControllerBase
    {
        private readonly IEducationRep _educationRep;
        private readonly TheAppContext _context;
        private readonly IUserNotificationService _userNotificationService;

        public EducationController(IEducationRep educationRep, TheAppContext context, IUserNotificationService userNotificationService)
        {
            _educationRep = educationRep;
            _context = context;
            _userNotificationService = userNotificationService;
        }

        [HttpGet("courses")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetCourses(
            [FromQuery] CourseStatus? status,
            [FromQuery] CourseLevel? level,
            [FromQuery] CourseDeliveryMode? deliveryMode,
            [FromQuery] long categoryId = 0,
            [FromQuery] int pageIndex = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string searchText = "",
            [FromQuery] string sortQuery = "")
        {
            var result = await _educationRep.GetAllCoursesAsync(status, level, deliveryMode, categoryId, pageIndex, pageSize, searchText, sortQuery);
            return result.Status ? Ok(result.Map(CourseListItemResponse.FromEntity)) : BadRequest(result);
        }

        [HttpGet("courses/{id:long}")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetCourse(long id)
        {
            var result = await _educationRep.GetCourseByIdAsync(id);
            return result.Status && result.Result != null ? Ok(result.Map(CourseDetailResponse.FromEntity)) : NotFound(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpGet("courses/{id:long}/access")]
        public async Task<IActionResult> GetCourseAccess(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var enrollment = await _context.CourseEnrollments
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.CourseId == id && x.StudentUserId == userId && x.DeleteDate == null);

            return Ok(new CourseAccessResponse
            {
                CourseId = id,
                EnrollmentId = enrollment?.ID,
                EnrollmentStatus = enrollment?.Status,
                ProgressPercent = enrollment?.ProgressPercent ?? 0,
                CanAccessPaidLessons = enrollment?.Status == EnrollmentStatus.Active || enrollment?.Status == EnrollmentStatus.Completed,
                CanDownloadCertificate = enrollment?.Status == EnrollmentStatus.Completed
            });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpGet("enrollments/mine")]
        public async Task<IActionResult> GetMyEnrollments([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.GetUserEnrollmentsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(CourseEnrollmentResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpPatch("enrollments/{enrollmentId:long}/progress")]
        public async Task<IActionResult> UpdateProgress(long enrollmentId, [FromBody] UpdateCourseProgressRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var enrollment = await _context.CourseEnrollments
                .Include(x => x.Course)
                    .ThenInclude(x => x.Lessons)
                .SingleOrDefaultAsync(x => x.ID == enrollmentId && x.StudentUserId == userId && x.DeleteDate == null);
            if (enrollment == null)
            {
                return NotFound();
            }

            if (enrollment.Status != EnrollmentStatus.Active && enrollment.Status != EnrollmentStatus.Completed)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "برای ثبت پیشرفت باید ثبت‌نام فعال باشد" });
            }

            var lessonIds = enrollment.Course.Lessons
                .Where(x => x.DeleteDate == null && x.IsActive)
                .Select(x => x.ID)
                .ToList();
            if (lessonIds.Count == 0)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "این دوره هنوز درس فعالی برای محاسبه پیشرفت ندارد" });
            }

            var completedCount = await _context.CourseLessonProgresses.CountAsync(x =>
                x.EnrollmentId == enrollmentId &&
                lessonIds.Contains(x.CourseLessonId) &&
                x.Status == LessonProgressStatus.Completed &&
                x.DeleteDate == null);
            enrollment.ProgressPercent = EducationProgressCalculator.Calculate(lessonIds.Count, completedCount);
            enrollment.UpdateDate = DateTime.UtcNow;
            if (enrollment.ProgressPercent >= 100)
            {
                enrollment.Status = EnrollmentStatus.Completed;
                enrollment.CompletedAt ??= DateTime.UtcNow;
            }
            else
            {
                enrollment.Status = EnrollmentStatus.Active;
                enrollment.CompletedAt = null;
            }

            await _context.SaveChangesAsync();
            if (enrollment.Status == EnrollmentStatus.Completed)
            {
                await EnsureCourseCertificateAsync(enrollmentId);
            }

            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { ID = enrollment.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpGet("enrollments/{enrollmentId:long}/lessons/progress")]
        public async Task<IActionResult> GetLessonProgress(long enrollmentId, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 50)
        {
            var userId = GetCurrentUserId();
            var enrollment = await _context.CourseEnrollments
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == enrollmentId && x.StudentUserId == userId);
            if (enrollment == null)
            {
                return NotFound();
            }

            var query = _context.CourseLessonProgresses
                .AsNoTracking()
                .Include(x => x.CourseLesson)
                .Where(x => x.EnrollmentId == enrollmentId);
            var totalCount = await query.CountAsync();
            var existing = await query
                .OrderBy(x => x.CourseLesson.SortOrder)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.ListResultObject<CourseLessonProgressResponse>
            {
                TotalCount = totalCount,
                PageCount = DbTools.GetPageCount(totalCount, pageSize),
                Results = existing.Select(CourseLessonProgressResponse.FromEntity).ToList()
            });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpPatch("enrollments/{enrollmentId:long}/lessons/{lessonId:long}/progress")]
        public async Task<IActionResult> UpdateLessonProgress(long enrollmentId, long lessonId, [FromBody] UpdateLessonProgressRequest request)
        {
            var userId = GetCurrentUserId();
            var enrollment = await _context.CourseEnrollments
                .Include(x => x.Course)
                    .ThenInclude(x => x.Lessons)
                .SingleOrDefaultAsync(x => x.ID == enrollmentId && x.StudentUserId == userId);
            if (enrollment == null)
            {
                return NotFound();
            }

            if (enrollment.Status != EnrollmentStatus.Active && enrollment.Status != EnrollmentStatus.Completed)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "برای ثبت پیشرفت درس باید ثبت‌نام فعال باشد" });
            }

            var lesson = enrollment.Course.Lessons.SingleOrDefault(x => x.ID == lessonId);
            if (lesson == null)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "درس متعلق به این دوره نیست" });
            }

            var normalized = request.ProgressPercent > 100 ? (byte)100 : request.ProgressPercent;
            var progress = await _context.CourseLessonProgresses.SingleOrDefaultAsync(x => x.EnrollmentId == enrollmentId && x.CourseLessonId == lessonId);
            if (progress == null)
            {
                progress = new CourseLessonProgress
                {
                    EnrollmentId = enrollmentId,
                    CourseLessonId = lessonId,
                    StudentUserId = userId,
                    CreateDate = DateTime.UtcNow,
                    IsActive = true
                };
                await _context.CourseLessonProgresses.AddAsync(progress);
            }

            progress.ProgressPercent = normalized;
            progress.Status = normalized >= 100 ? LessonProgressStatus.Completed : normalized > 0 ? LessonProgressStatus.InProgress : LessonProgressStatus.NotStarted;
            progress.CompletedAt = normalized >= 100 ? progress.CompletedAt ?? DateTime.UtcNow : null;
            progress.UpdateDate = DateTime.UtcNow;

            var lessonIds = enrollment.Course.Lessons.Select(x => x.ID).ToList();
            await _context.SaveChangesAsync();

            var completedCount = await _context.CourseLessonProgresses.CountAsync(x => x.EnrollmentId == enrollmentId && lessonIds.Contains(x.CourseLessonId) && x.Status == LessonProgressStatus.Completed);
            enrollment.ProgressPercent = EducationProgressCalculator.Calculate(lessonIds.Count, completedCount);
            enrollment.UpdateDate = DateTime.UtcNow;
            if (enrollment.ProgressPercent >= 100)
            {
                enrollment.Status = EnrollmentStatus.Completed;
                enrollment.CompletedAt ??= DateTime.UtcNow;
            }
            else if (enrollment.Status == EnrollmentStatus.Completed)
            {
                enrollment.Status = EnrollmentStatus.Active;
                enrollment.CompletedAt = null;
            }

            await _context.SaveChangesAsync();
            if (enrollment.Status == EnrollmentStatus.Completed)
            {
                await EnsureCourseCertificateAsync(enrollment.ID);
            }

            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { ID = progress.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpGet("courses/mine")]
        public async Task<IActionResult> GetMyCourses([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.GetInstructorCoursesAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(CourseListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpGet("courses/{id:long}/students")]
        public async Task<IActionResult> GetCourseStudents(long id, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var ownsCourse = await _context.Courses
                .AsNoTracking()
                .AnyAsync(x => x.ID == id && x.InstructorUserId == userId && x.DeleteDate == null);

            if (!ownsCourse)
            {
                return NotFound();
            }

            var query = _context.CourseEnrollments
                .AsNoTracking()
                .Include(x => x.StudentUser)
                .Where(x => x.CourseId == id && x.DeleteDate == null);
            var totalCount = await query.CountAsync();
            var enrollments = await query
                .OrderByDescending(x => x.CreateDate)
                .ToPaging(pageIndex, pageSize)
                .ToListAsync();

            var enrollmentIds = enrollments.Select(x => x.ID).ToList();
            var progresses = enrollmentIds.Count == 0
                ? new List<CourseLessonProgress>()
                : await _context.CourseLessonProgresses
                    .AsNoTracking()
                    .Include(x => x.CourseLesson)
                    .Where(x => enrollmentIds.Contains(x.EnrollmentId) && x.DeleteDate == null)
                    .OrderBy(x => x.CourseLesson.SortOrder)
                    .ToListAsync();

            var result = new AITechDigitalTradeHub.Data.ResultObjects.ListResultObject<CourseStudentEnrollmentResponse>
            {
                TotalCount = totalCount,
                PageCount = DbTools.GetPageCount(totalCount, pageSize),
                Results = enrollments
                    .Select(x => CourseStudentEnrollmentResponse.FromEntity(x, progresses.Where(p => p.EnrollmentId == x.ID)))
                    .ToList()
            };

            return Ok(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpPost("courses")]
        public async Task<IActionResult> CreateCourse([FromBody] CourseUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.AddCourseAsync(request.ToEntity(userId));
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpPut("courses/{id:long}")]
        public async Task<IActionResult> UpdateCourse(long id, [FromBody] CourseUpsertRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var course = request.ToEntity(userId);
            course.ID = id;
            var result = await _educationRep.EditCourseAsync(course, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpPost("courses/{id:long}/publish")]
        public async Task<IActionResult> PublishCourse(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.PublishCourseAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpPost("courses/{id:long}/lessons")]
        public async Task<IActionResult> AddLesson(long id, [FromBody] CreateCourseLessonRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.AddLessonAsync(id, userId, request.ToEntity());
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpPost("courses/{id:long}/enroll")]
        public async Task<IActionResult> Enroll(long id)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.EnrollAsync(id, userId);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [HttpGet("instructors/{instructorUserId:long}/slots")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetInstructorSlots(long instructorUserId, [FromQuery] bool onlyAvailable = true, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _educationRep.GetInstructorSlotsAsync(instructorUserId, onlyAvailable, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(TeacherSlotResponse.FromEntity)) : BadRequest(result);
        }

        [HttpGet("instructors")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetInstructors([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] string searchText = "")
        {
            var query = _context.InstructorProfiles
                .AsNoTracking()
                .Include(x => x.User)
                .Where(x => x.IsActive && (string.IsNullOrEmpty(searchText) || x.Headline.Contains(searchText) || x.User.FirstName.Contains(searchText) || x.User.LastName.Contains(searchText)));

            var total = await query.CountAsync();
            var result = new AITechDigitalTradeHub.Data.ResultObjects.ListResultObject<InstructorProfileResponse>
            {
                TotalCount = total,
                PageCount = AITechDigitalTradeHub.Data.Tools.DbTools.GetPageCount(total, pageSize),
                Results = await query.OrderByDescending(x => x.RatingAverage).Skip((pageIndex - 1) * pageSize).Take(pageSize).Select(x => InstructorProfileResponse.FromEntity(x)).ToListAsync()
            };
            return Ok(result);
        }

        [HttpGet("instructors/{instructorUserId:long}")]
        [OutputCache(PolicyName = "PublicShort")]
        public async Task<IActionResult> GetInstructor(long instructorUserId)
        {
            var profile = await _context.InstructorProfiles
                .AsNoTracking()
                .Include(x => x.User)
                .SingleOrDefaultAsync(x => x.UserId == instructorUserId && x.IsActive);

            if (profile == null)
            {
                var user = await _context.Users.AsNoTracking().SingleOrDefaultAsync(x => x.ID == instructorUserId);
                if (user == null) return NotFound();
                profile = new InstructorProfile { UserId = user.ID, User = user, Headline = "مدرس هوش مصنوعی" };
            }

            return Ok(InstructorProfileResponse.FromEntity(profile));
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationBookingCreate)]
        [HttpGet("bookings/mine")]
        public async Task<IActionResult> GetMyBookings([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.GetStudentBookingsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(TeacherBookingResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationBookingManage)]
        [HttpGet("instructors/me/bookings")]
        public async Task<IActionResult> GetInstructorBookings([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.GetInstructorBookingsAsync(userId, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(TeacherBookingResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationInstructorManage)]
        [HttpPost("instructors/me/slots")]
        public async Task<IActionResult> AddSlot([FromBody] CreateTeacherSlotRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.AddAvailabilitySlotAsync(request.ToEntity(userId));
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationBookingCreate)]
        [HttpPost("slots/{slotId:long}/book")]
        public async Task<IActionResult> BookSlot(long slotId, [FromBody] BookTeacherSlotRequest request)
        {
            var userId = GetCurrentUserId();
            if (userId <= 0)
            {
                return Unauthorized();
            }

            var result = await _educationRep.BookSlotAsync(slotId, userId, request.Subject, request.StudentNotes);
            return result.Status ? Ok(result) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationBookingManage)]
        [HttpPatch("bookings/{bookingId:long}/status")]
        public async Task<IActionResult> UpdateBookingStatus(long bookingId, [FromBody] UpdateTeacherBookingStatusRequest request)
        {
            var userId = GetCurrentUserId();
            var booking = await _context.TeacherBookings.SingleOrDefaultAsync(x => x.ID == bookingId && x.InstructorUserId == userId);
            if (booking == null)
            {
                return NotFound();
            }

            if (request.Status == TeacherBookingStatus.Cancelled && booking.Status == TeacherBookingStatus.Confirmed && booking.PriceAmount > 0)
            {
                var refundResult = await RefundTeacherBookingAsync(booking);
                if (!refundResult.Status)
                {
                    return BadRequest(refundResult);
                }
            }

            booking.Status = request.Status;
            booking.MeetingUrl = request.MeetingUrl ?? booking.MeetingUrl;
            booking.UpdateDate = DateTime.UtcNow;
            if (request.Status == TeacherBookingStatus.Completed) booking.CompletedAt ??= DateTime.UtcNow;
            if (request.Status == TeacherBookingStatus.Cancelled)
            {
                booking.CancelledAt ??= DateTime.UtcNow;
                if (booking.PriceAmount > 0 && booking.TransactionId.HasValue) booking.Status = TeacherBookingStatus.Refunded;
            }
            await _context.SaveChangesAsync();
            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { ID = booking.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseManage)]
        [HttpGet("instructors/me/revenue")]
        public async Task<IActionResult> GetInstructorRevenue()
        {
            var userId = GetCurrentUserId();
            var courseRevenue = await _context.CourseEnrollments
                .AsNoTracking()
                .Include(x => x.Course)
                .Where(x => x.Course.InstructorUserId == userId && (x.Status == EnrollmentStatus.Active || x.Status == EnrollmentStatus.Completed))
                .SumAsync(x => x.PaidAmount);

            var bookingRevenue = await _context.TeacherBookings
                .AsNoTracking()
                .Where(x => x.InstructorUserId == userId && (x.Status == TeacherBookingStatus.Confirmed || x.Status == TeacherBookingStatus.Completed))
                .SumAsync(x => x.PriceAmount);

            return Ok(new EducationRevenueResponse
            {
                CourseRevenue = courseRevenue,
                BookingRevenue = bookingRevenue,
                TotalRevenue = courseRevenue + bookingRevenue,
                Currency = "IRR"
            });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationCourseRead)]
        [HttpGet("enrollments/{enrollmentId:long}/certificate")]
        public async Task<IActionResult> GetCertificate(long enrollmentId)
        {
            var userId = GetCurrentUserId();
            var enrollment = await _context.CourseEnrollments
                .AsNoTracking()
                .SingleOrDefaultAsync(x => x.ID == enrollmentId && x.StudentUserId == userId);

            if (enrollment == null || enrollment.Status != EnrollmentStatus.Completed)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "گواهی فقط بعد از تکمیل دوره صادر می‌شود" });
            }

            await EnsureCourseCertificateAsync(enrollmentId);
            var certificate = await _context.CourseCertificates
                .AsNoTracking()
                .Include(x => x.Course)
                .Include(x => x.StudentUser)
                .Include(x => x.InstructorUser)
                .SingleOrDefaultAsync(x => x.EnrollmentId == enrollmentId && !x.IsRevoked);

            return certificate == null ? NotFound() : Ok(new AITechDigitalTradeHub.Data.ResultObjects.RowResultObject<CourseCertificateResponse> { Result = CourseCertificateResponse.FromEntity(certificate) });
        }

        [HttpGet("certificates/{certificateNumber}/verify")]
        [OutputCache(PolicyName = "PublicReference")]
        public async Task<IActionResult> VerifyCertificate(string certificateNumber)
        {
            var normalizedNumber = certificateNumber.Trim();
            if (string.IsNullOrWhiteSpace(normalizedNumber) || normalizedNumber.Length > 100)
            {
                return BadRequest(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { Status = false, ErrorMessage = "شماره گواهی معتبر نیست" });
            }

            var certificate = await _context.CourseCertificates
                .AsNoTracking()
                .Include(x => x.Course)
                .Include(x => x.StudentUser)
                .Include(x => x.InstructorUser)
                .SingleOrDefaultAsync(x =>
                    x.CertificateNumber == normalizedNumber &&
                    !x.IsRevoked &&
                    x.IsActive &&
                    x.DeleteDate == null);

            return certificate == null
                ? NotFound()
                : Ok(new AITechDigitalTradeHub.Data.ResultObjects.RowResultObject<CourseCertificateResponse> { Result = CourseCertificateResponse.FromEntity(certificate) });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationAdminManage)]
        [HttpGet("admin/courses")]
        public async Task<IActionResult> GetAdminCourses([FromQuery] CourseStatus? status, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20, [FromQuery] string searchText = "")
        {
            var result = await _educationRep.GetAllCoursesAsync(status, null, null, 0, pageIndex, pageSize, searchText, "");
            return result.Status ? Ok(result.Map(CourseListItemResponse.FromEntity)) : BadRequest(result);
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationAdminManage)]
        [HttpPatch("admin/courses/{courseId:long}/status")]
        public async Task<IActionResult> UpdateAdminCourseStatus(long courseId, [FromBody] UpdateCourseStatusRequest request)
        {
            var course = await _context.Courses.SingleOrDefaultAsync(x => x.ID == courseId);
            if (course == null) return NotFound();
            course.Status = request.Status;
            course.UpdateDate = DateTime.UtcNow;
            if (request.Status == CourseStatus.Published) course.PublishedAt ??= DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { ID = course.ID });
        }

        [Authorize(Policy = PermissionPolicyNames.Prefix + PermissionKeys.EducationAdminManage)]
        [HttpGet("admin/bookings")]
        public async Task<IActionResult> GetAdminBookings([FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var query = _context.TeacherBookings.AsNoTracking().Include(x => x.InstructorUser).Include(x => x.StudentUser);
            var total = await query.CountAsync();
            var result = new AITechDigitalTradeHub.Data.ResultObjects.ListResultObject<TeacherBookingResponse>
            {
                TotalCount = total,
                PageCount = AITechDigitalTradeHub.Data.Tools.DbTools.GetPageCount(total, pageSize),
                Results = await query.OrderByDescending(x => x.CreateDate).Skip((pageIndex - 1) * pageSize).Take(pageSize).Select(x => TeacherBookingResponse.FromEntity(x)).ToListAsync()
            };
            return Ok(result);
        }

        [HttpGet("questionnaire")]
        [OutputCache(PolicyName = "PublicReference")]
        public async Task<IActionResult> GetQuestionnaire()
        {
            var questions = await _context.EducationQuestionnaireQuestions
                .AsNoTracking()
                .Include(x => x.Options)
                .Where(x => x.IsActive && x.DeleteDate == null)
                .OrderBy(x => x.SortOrder)
                .ToListAsync();

            return Ok(new AITechDigitalTradeHub.Data.ResultObjects.ListResultObject<EducationQuestionnaireQuestionResponse>
            {
                TotalCount = questions.Count,
                PageCount = 1,
                Results = questions.Select(EducationQuestionnaireQuestionResponse.FromEntity).ToList()
            });
        }

        [HttpPost("recommendations")]
        public async Task<IActionResult> Recommend([FromBody] EducationQuestionnaireRequest request)
        {
            var selectedOptions = request.SelectedOptionIds.Count == 0
                ? new List<EducationQuestionnaireOption>()
                : await _context.EducationQuestionnaireOptions
                    .AsNoTracking()
                    .Where(x => request.SelectedOptionIds.Contains(x.ID))
                    .ToListAsync();

            CourseDeliveryMode? deliveryMode = request.PreferredMode.ToLowerInvariant() switch
            {
                "live" or "liveonline" => CourseDeliveryMode.LiveOnline,
                "inperson" => CourseDeliveryMode.InPerson,
                "hybrid" => CourseDeliveryMode.Hybrid,
                "recorded" => CourseDeliveryMode.Recorded,
                _ => selectedOptions.FirstOrDefault(x => x.PreferredMode.HasValue)?.PreferredMode
            };

            var learningGoal = request.LearningGoal ?? selectedOptions.FirstOrDefault(x => x.LearningGoal.HasValue)?.LearningGoal;
            var targetRole = request.TargetRole ?? selectedOptions.FirstOrDefault(x => x.TargetRole.HasValue)?.TargetRole;
            var optionLevel = selectedOptions.FirstOrDefault(x => x.Level.HasValue)?.Level;
            var requestedLevel = optionLevel ?? request.Level;
            var optionSkillIds = selectedOptions.Where(x => x.SkillTagId.HasValue).Select(x => x.SkillTagId!.Value);
            var requestedSkillIds = request.SkillTagIds.Concat(optionSkillIds).Distinct().ToHashSet();
            var weeklyHours = request.WeeklyHours > 0
                ? request.WeeklyHours
                : selectedOptions.FirstOrDefault(x => x.WeeklyHoursMin.HasValue || x.WeeklyHoursMax.HasValue) is { } hoursOption
                    ? Math.Max(1, ((hoursOption.WeeklyHoursMin ?? hoursOption.WeeklyHoursMax ?? 4) + (hoursOption.WeeklyHoursMax ?? hoursOption.WeeklyHoursMin ?? 4)) / 2)
                    : 4;
            var goal = string.IsNullOrWhiteSpace(request.Goal) ? "ورود به مسیر هوش مصنوعی" : request.Goal.Trim();
            var normalizedGoal = goal.ToLowerInvariant();

            var courses = await _context.Courses
                .AsNoTracking()
                .Include(x => x.InstructorUser)
                .Include(x => x.Category)
                .Include(x => x.Lessons)
                .Include(x => x.Enrollments)
                .Include(x => x.SkillTags)
                .Include(x => x.PrerequisiteTags)
                .Include(x => x.TargetRoleTags)
                .Where(x => x.Status == CourseStatus.Published)
                .ToListAsync();

            int Score(Course course)
            {
                var score = 0;
                if (learningGoal.HasValue && course.LearningGoal == learningGoal) score += 18;
                if (targetRole.HasValue && course.TargetRole == targetRole) score += 18;
                if (course.Level == requestedLevel) score += 16;
                else if (Math.Abs((int)course.Level - (int)requestedLevel) == 1) score += 7;

                if (deliveryMode.HasValue)
                {
                    if (course.DeliveryMode == deliveryMode) score += 12;
                    else if (course.DeliveryMode == CourseDeliveryMode.Hybrid || deliveryMode == CourseDeliveryMode.Hybrid) score += 6;
                }

                if (course.WeeklyHoursMin.HasValue || course.WeeklyHoursMax.HasValue)
                {
                    var min = course.WeeklyHoursMin ?? 1;
                    var max = course.WeeklyHoursMax ?? 40;
                    score += weeklyHours >= min && weeklyHours <= max ? 10 : 3;
                }
                else
                {
                    score += 4;
                }

                var matchingSkills = course.SkillTags.Where(x => requestedSkillIds.Contains(x.TagId)).Sum(x => Math.Max(1, (int)x.Weight));
                score += matchingSkills * 10;
                var matchingRoles = course.TargetRoleTags.Where(x => requestedSkillIds.Contains(x.TagId)).Sum(x => Math.Max(1, (int)x.Weight));
                score += matchingRoles * 6;

                if (learningGoal == EducationLearningGoal.BuildProject && course.ProjectBased) score += 8;
                if (weeklyHours <= 4 && course.RequiresMentor) score += 4;
                if (!string.IsNullOrWhiteSpace(goal) &&
                    (course.Title.ToLowerInvariant().Contains(normalizedGoal) ||
                     (course.Description?.ToLowerInvariant().Contains(normalizedGoal) ?? false) ||
                     (course.LearningOutcomes?.ToLowerInvariant().Contains(normalizedGoal) ?? false)))
                {
                    score += 8;
                }

                score += Math.Max(0, 5 - (course.DifficultyScore ?? 3));
                return score;
            }

            var recommendedCourses = courses
                .Select(course => new { Course = course, Score = Score(course) })
                .OrderByDescending(x => x.Score)
                .ThenBy(x => x.Course.PriceAmount)
                .ThenByDescending(x => x.Course.PublishedAt ?? x.Course.CreateDate)
                .Select(x => x.Course)
                .Take(4)
                .ToList();

            var firstInstructorId = recommendedCourses.FirstOrDefault()?.InstructorUserId ?? 0;
            var slotsResult = firstInstructorId > 0
                ? await _educationRep.GetInstructorSlotsAsync(firstInstructorId, true, 1, 3)
                : null;

            var pace = weeklyHours >= 10 ? "فشرده" : weeklyHours >= 5 ? "منظم" : "آرام";
            var targetRoleText = targetRole switch
            {
                EducationTargetRole.AiDeveloper => "توسعه‌دهنده هوش مصنوعی",
                EducationTargetRole.DataAnalyst => "تحلیلگر داده",
                EducationTargetRole.MlEngineer => "مهندس یادگیری ماشین",
                EducationTargetRole.ProductManager => "مدیر محصول AI",
                _ => "مسیر انتخاب‌شده"
            };
            var firstStep = requestedLevel switch
            {
                CourseLevel.Advanced => $"تعریف خروجی تخصصی برای هدف «{goal}» و انتخاب یک پروژه قابل ارائه",
                CourseLevel.Intermediate => $"مرور پیش‌نیازهای هدف «{goal}» و انتخاب یک نمونه‌کار قابل تکمیل",
                _ => $"شروع از مفاهیم پایه مرتبط با هدف «{goal}»"
            };
            var practiceStep = weeklyHours >= 8
                ? "هر هفته یک تمرین عملی و یک جلسه مرور خروجی با مدرس یا منتور داشته باشید"
                : "هر هفته یک تمرین کوچک انجام دهید و سوال‌های اصلی را برای جلسه منتورینگ جمع کنید";
            var finalStep = requestedLevel == CourseLevel.Advanced
                ? "در پایان مسیر، خروجی را به رزومه و پروفایل پروژه‌ای اضافه کنید"
                : "بعد از پایان دوره اول، مسیر بعدی را با آزمون سطح و بازخورد مدرس انتخاب کنید";
            var response = new EducationRecommendationResponse
            {
                RoadmapTitle = requestedLevel switch
                {
                    CourseLevel.Advanced => $"مسیر تخصصی {targetRoleText}",
                    CourseLevel.Intermediate => $"مسیر ارتقای مهارت برای {targetRoleText}",
                    _ => $"مسیر شروع برای {targetRoleText}"
                },
                RoadmapSummary = $"برای هدف «{goal}» با سرعت {pace} و حدود {weeklyHours} ساعت در هفته، ترکیب دوره، تمرین و کلاس خصوصی پیشنهاد می‌شود.",
                Steps = new List<string>
                {
                    firstStep,
                    "گذراندن دوره پیشنهادی و ثبت پیشرفت هر هفته",
                    practiceStep,
                    finalStep
                },
                RecommendedCourses = recommendedCourses.Select(CourseListItemResponse.FromEntity).ToList(),
                RecommendedTeacherSlots = slotsResult?.Results.Select(TeacherSlotResponse.FromEntity).ToList() ?? new List<TeacherSlotResponse>()
            };

            return Ok(response);
        }

        private async Task EnsureCourseCertificateAsync(long enrollmentId)
        {
            var exists = await _context.CourseCertificates.AnyAsync(x => x.EnrollmentId == enrollmentId && !x.IsRevoked);
            if (exists) return;

            var enrollment = await _context.CourseEnrollments
                .Include(x => x.Course)
                .SingleOrDefaultAsync(x => x.ID == enrollmentId && x.Status == EnrollmentStatus.Completed);
            if (enrollment == null) return;

            var now = DateTime.UtcNow;
            var certificate = new CourseCertificate
            {
                EnrollmentId = enrollment.ID,
                CourseId = enrollment.CourseId,
                StudentUserId = enrollment.StudentUserId,
                InstructorUserId = enrollment.Course.InstructorUserId,
                CertificateNumber = $"AI-{now:yyyyMMdd}-{enrollment.CourseId}-{enrollment.ID}",
                IssuedAt = now,
                CompletedAt = enrollment.CompletedAt ?? now,
                ProgressPercent = enrollment.ProgressPercent,
                CreateDate = now,
                UpdateDate = now,
                IsActive = true
            };

            await _context.CourseCertificates.AddAsync(certificate);
            await _userNotificationService.AddInAppAsync(
                enrollment.StudentUserId,
                $"گواهی پایان دوره «{enrollment.Course.Title}» برای شما صادر شد.",
                NotificationCategory.Education,
                enrollment.Course.InstructorUserId);
            await _userNotificationService.AddInAppAsync(
                enrollment.Course.InstructorUserId,
                $"دانشجو دوره «{enrollment.Course.Title}» را کامل کرد و گواهی صادر شد.",
                NotificationCategory.Education,
                enrollment.StudentUserId);
            await _context.SaveChangesAsync();
        }

        private async Task<AITechDigitalTradeHub.Data.ResultObjects.BitResultObject> RefundTeacherBookingAsync(TeacherBooking booking)
        {
            var result = new AITechDigitalTradeHub.Data.ResultObjects.BitResultObject { ID = booking.ID };
            if (!booking.TransactionId.HasValue || booking.PriceAmount <= 0)
            {
                return result;
            }

            var alreadyRefunded = await _context.Transactions.AnyAsync(x =>
                x.TxType == TransactionType.Refund &&
                x.ReferenceType == "TeacherBooking" &&
                x.ReferenceId == booking.ID &&
                x.Amount > 0);
            if (alreadyRefunded)
            {
                return result;
            }

            var payerTx = await _context.Transactions.AsNoTracking().SingleOrDefaultAsync(x => x.ID == booking.TransactionId.Value);
            if (payerTx == null)
            {
                result.Status = false;
                result.ErrorMessage = "تراکنش پرداخت رزرو پیدا نشد";
                return result;
            }

            var payerWallet = await _context.Wallets.SingleOrDefaultAsync(x => x.ID == payerTx.WalletId);
            var instructorWallet = await _context.Wallets.SingleOrDefaultAsync(x =>
                x.OwnerType == WalletOwnerType.User &&
                x.OwnerUserId == booking.InstructorUserId &&
                x.Currency == booking.Currency);

            if (payerWallet == null || instructorWallet == null)
            {
                result.Status = false;
                result.ErrorMessage = "کیف پول پرداخت‌کننده یا مدرس پیدا نشد";
                return result;
            }

            if (instructorWallet.Balance < booking.PriceAmount)
            {
                result.Status = false;
                result.ErrorMessage = "موجودی کیف پول مدرس برای بازپرداخت کافی نیست";
                return result;
            }

            instructorWallet.Balance -= booking.PriceAmount;
            instructorWallet.UpdateDate = DateTime.UtcNow;
            payerWallet.Balance += booking.PriceAmount;
            payerWallet.UpdateDate = DateTime.UtcNow;

            await _context.Transactions.AddRangeAsync(
                new Transaction
                {
                    WalletId = instructorWallet.ID,
                    TxType = TransactionType.Refund,
                    Amount = -booking.PriceAmount,
                    ReferenceType = "TeacherBooking",
                    ReferenceId = booking.ID,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                },
                new Transaction
                {
                    WalletId = payerWallet.ID,
                    TxType = TransactionType.Refund,
                    Amount = booking.PriceAmount,
                    ReferenceType = "TeacherBooking",
                    ReferenceId = booking.ID,
                    Status = TransactionStatus.Success,
                    CreateDate = DateTime.UtcNow,
                    UpdateDate = DateTime.UtcNow,
                    IsActive = true
                });

            return result;
        }

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
