using System.Security.Claims;
using AITechDigitalTradeHub.Api.Infrastructure;
using AITechDigitalTradeHub.Api.ViewModels;
using AITechDigitalTradeHub.Api.ViewModels.Education;
using AITechDigitalTradeHub.Data.DataLayer.Repositories;
using AITechDigitalTradeHub.Data.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AITechDigitalTradeHub.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EducationController : ControllerBase
    {
        private readonly IEducationRep _educationRep;

        public EducationController(IEducationRep educationRep)
        {
            _educationRep = educationRep;
        }

        [HttpGet("courses")]
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
        public async Task<IActionResult> GetCourse(long id)
        {
            var result = await _educationRep.GetCourseByIdAsync(id);
            return result.Status && result.Result != null ? Ok(result.Map(CourseDetailResponse.FromEntity)) : NotFound(result);
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
        public async Task<IActionResult> GetInstructorSlots(long instructorUserId, [FromQuery] bool onlyAvailable = true, [FromQuery] int pageIndex = 1, [FromQuery] int pageSize = 20)
        {
            var result = await _educationRep.GetInstructorSlotsAsync(instructorUserId, onlyAvailable, pageIndex, pageSize);
            return result.Status ? Ok(result.Map(TeacherSlotResponse.FromEntity)) : BadRequest(result);
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

        private long GetCurrentUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return long.TryParse(value, out var userId) ? userId : 0;
        }
    }
}
