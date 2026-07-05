using AITechDigitalTradeHub.Data.Domain;
using AITechDigitalTradeHub.Data.ResultObjects;

namespace AITechDigitalTradeHub.Data.DataLayer.Repositories
{
    public interface IEducationRep
    {
        Task<ListResultObject<Course>> GetAllCoursesAsync(
            CourseStatus? status = null,
            CourseLevel? level = null,
            CourseDeliveryMode? deliveryMode = null,
            long categoryId = 0,
            int pageIndex = 1,
            int pageSize = 20,
            string searchText = "",
            string sortQuery = "");

        Task<RowResultObject<Course>> GetCourseByIdAsync(long courseId);
        Task<ListResultObject<Course>> GetInstructorCoursesAsync(long instructorUserId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<CourseEnrollment>> GetUserEnrollmentsAsync(long studentUserId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<TeacherBooking>> GetStudentBookingsAsync(long studentUserId, int pageIndex = 1, int pageSize = 20);
        Task<ListResultObject<TeacherBooking>> GetInstructorBookingsAsync(long instructorUserId, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddCourseAsync(Course course);
        Task<BitResultObject> EditCourseAsync(Course course, long instructorUserId);
        Task<BitResultObject> PublishCourseAsync(long courseId, long instructorUserId);
        Task<BitResultObject> AddLessonAsync(long courseId, long instructorUserId, CourseLesson lesson);
        Task<BitResultObject> EnrollAsync(long courseId, long studentUserId);
        Task<BitResultObject> UpdateEnrollmentProgressAsync(long enrollmentId, long studentUserId, byte progressPercent);
        Task<ListResultObject<TeacherAvailabilitySlot>> GetInstructorSlotsAsync(long instructorUserId, bool onlyAvailable = true, int pageIndex = 1, int pageSize = 20);
        Task<BitResultObject> AddAvailabilitySlotAsync(TeacherAvailabilitySlot slot);
        Task<BitResultObject> BookSlotAsync(long slotId, long studentUserId, string? subject, string? studentNotes);
    }
}
