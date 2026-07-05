import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type {
  CourseCreatePayload,
  CourseAccess,
  CourseDetail,
  CourseEnrollment,
  CourseCertificate,
  CourseStudentEnrollment,
  CourseLessonProgress,
  CourseLessonCreatePayload,
  EducationQuestionnaireQuestion,
  EducationQuestionnairePayload,
  EducationRecommendation,
  EducationRevenue,
  EducationReviewPayload,
  InstructorProfile,
  ReviewAggregate,
  TeacherBooking,
  CourseSummary,
  TeacherSlot,
  TeacherBookingStatus,
  TeacherSlotCreatePayload
} from "@/features/education/types";

export function getCourses(params: { status?: string; searchText?: string; level?: string; deliveryMode?: string; categoryId?: number; pageIndex?: number; pageSize?: number; sortQuery?: string } = {}) {
  return apiRequest<DotNetListResult<CourseSummary>>(`${apiEndpoints.education.courses}${toQueryString(params)}`);
}

export function getCourse(id: number) {
  return apiRequest<DotNetRowResult<CourseDetail>>(apiEndpoints.education.course(id));
}

export function getCourseAccess(id: number) {
  return apiRequest<DotNetRowResult<CourseAccess>>(apiEndpoints.education.courseAccess(id));
}

export function getMyCourses() {
  return apiRequest<DotNetListResult<CourseSummary>>(apiEndpoints.education.myCourses);
}

export function getCourseStudents(courseId: number) {
  return apiRequest<DotNetListResult<CourseStudentEnrollment>>(apiEndpoints.education.courseStudents(courseId));
}

export function getMyEnrollments() {
  return apiRequest<DotNetListResult<CourseEnrollment>>(apiEndpoints.education.myEnrollments);
}

export function updateEnrollmentProgress(enrollmentId: number, progressPercent: number) {
  return apiRequest<DotNetResult>(apiEndpoints.education.enrollmentProgress(enrollmentId), {
    method: "PATCH",
    body: JSON.stringify({ progressPercent })
  });
}

export function getLessonProgress(enrollmentId: number) {
  return apiRequest<DotNetListResult<CourseLessonProgress>>(apiEndpoints.education.lessonProgress(enrollmentId));
}

export function updateLessonProgress(enrollmentId: number, lessonId: number, progressPercent: number) {
  return apiRequest<DotNetResult>(apiEndpoints.education.updateLessonProgress(enrollmentId, lessonId), {
    method: "PATCH",
    body: JSON.stringify({ progressPercent })
  });
}

export function getCourseCertificate(enrollmentId: number) {
  return apiRequest<DotNetRowResult<CourseCertificate>>(apiEndpoints.education.certificate(enrollmentId));
}

export function createCourse(payload: CourseCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.education.courses, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function publishCourse(id: number) {
  return apiRequest<DotNetResult>(apiEndpoints.education.publishCourse(id), {
    method: "POST"
  });
}

export function createCourseLesson(courseId: number, payload: CourseLessonCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.education.lessons(courseId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function enrollCourse(courseId: number) {
  return apiRequest<DotNetResult>(apiEndpoints.education.enroll(courseId), {
    method: "POST"
  });
}

export function getInstructorSlots(instructorUserId: number) {
  return apiRequest<DotNetListResult<TeacherSlot>>(apiEndpoints.education.instructorSlots(instructorUserId));
}

export function createTeacherSlot(payload: TeacherSlotCreatePayload) {
  return apiRequest<DotNetResult>(apiEndpoints.education.myInstructorSlots, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getMyTeacherBookings() {
  return apiRequest<DotNetListResult<TeacherBooking>>(apiEndpoints.education.myBookings);
}

export function getInstructorBookings() {
  return apiRequest<DotNetListResult<TeacherBooking>>(apiEndpoints.education.myInstructorBookings);
}

export function updateTeacherBookingStatus(bookingId: number, payload: { status: TeacherBookingStatus; meetingUrl?: string }) {
  return apiRequest<DotNetResult>(apiEndpoints.education.bookingStatus(bookingId), {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function getInstructorRevenue() {
  return apiRequest<DotNetRowResult<EducationRevenue>>(apiEndpoints.education.instructorRevenue);
}

export function getInstructors() {
  return apiRequest<DotNetListResult<InstructorProfile>>(apiEndpoints.education.instructors);
}

export function getInstructor(instructorUserId: number) {
  return apiRequest<DotNetRowResult<InstructorProfile>>(apiEndpoints.education.instructor(instructorUserId));
}

export function getAdminEducationCourses() {
  return apiRequest<DotNetListResult<CourseSummary>>(apiEndpoints.education.adminCourses);
}

export function updateAdminCourseStatus(courseId: number, status: CourseSummary["status"]) {
  return apiRequest<DotNetResult>(apiEndpoints.education.adminCourseStatus(courseId), {
    method: "PATCH",
    body: JSON.stringify({ status })
  });
}

export function getAdminEducationBookings() {
  return apiRequest<DotNetListResult<TeacherBooking>>(apiEndpoints.education.adminBookings);
}

export function bookTeacherSlot(slotId: number, payload: { subject?: string; studentNotes?: string }) {
  return apiRequest<DotNetResult>(apiEndpoints.education.bookSlot(slotId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getEducationRecommendations(payload: EducationQuestionnairePayload) {
  return apiRequest<EducationRecommendation>(apiEndpoints.education.recommendations, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getEducationQuestionnaire() {
  return apiRequest<DotNetListResult<EducationQuestionnaireQuestion>>(apiEndpoints.education.questionnaire);
}

export function createEducationReview(payload: EducationReviewPayload) {
  return apiRequest<DotNetResult>(apiEndpoints.reviews.list, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getReviewAggregate(targetType: "Course" | "User", targetId: number) {
  return apiRequest<DotNetRowResult<ReviewAggregate>>(apiEndpoints.reviews.aggregate(targetType, targetId));
}
