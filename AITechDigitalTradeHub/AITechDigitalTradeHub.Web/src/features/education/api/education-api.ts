import { apiEndpoints } from "@/lib/api/api-endpoints";
import { apiRequest, toQueryString } from "@/lib/api/http-client";
import type { DotNetListResult, DotNetResult, DotNetRowResult } from "@/types/api";
import type {
  CourseCreatePayload,
  CourseDetail,
  CourseEnrollment,
  CourseLessonCreatePayload,
  CourseSummary,
  TeacherSlot,
  TeacherSlotCreatePayload
} from "@/features/education/types";

export function getCourses(params: { status?: string; searchText?: string } = {}) {
  return apiRequest<DotNetListResult<CourseSummary>>(`${apiEndpoints.education.courses}${toQueryString(params)}`);
}

export function getCourse(id: number) {
  return apiRequest<DotNetRowResult<CourseDetail>>(apiEndpoints.education.course(id));
}

export function getMyCourses() {
  return apiRequest<DotNetListResult<CourseSummary>>(apiEndpoints.education.myCourses);
}

export function getMyEnrollments() {
  return apiRequest<DotNetListResult<CourseEnrollment>>(apiEndpoints.education.myEnrollments);
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

export function bookTeacherSlot(slotId: number, payload: { subject?: string; studentNotes?: string }) {
  return apiRequest<DotNetResult>(apiEndpoints.education.bookSlot(slotId), {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
