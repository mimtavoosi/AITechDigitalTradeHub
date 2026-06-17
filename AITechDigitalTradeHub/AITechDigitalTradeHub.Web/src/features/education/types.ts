import type { EntityId } from "@/types/domain";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | number;
export type CourseDeliveryMode = "Recorded" | "LiveOnline" | "InPerson" | "Hybrid" | number;
export type CourseStatus = "Draft" | "PendingReview" | "Published" | "Archived" | number;

export type CourseSummary = {
  id: EntityId;
  slug: string;
  title: string;
  description?: string | null;
  level: CourseLevel;
  deliveryMode: CourseDeliveryMode;
  status: CourseStatus;
  priceAmount: number;
  currency: string;
  durationMinutes?: number | null;
  startsAt?: string | null;
  publishedAt?: string | null;
  categoryName?: string | null;
  instructorUserId: EntityId;
  instructorName?: string | null;
  lessonsCount: number;
  enrollmentsCount: number;
};

export type CourseLesson = {
  id: EntityId;
  courseId: EntityId;
  title: string;
  description?: string | null;
  contentType: string | number;
  sortOrder: number;
  durationMinutes?: number | null;
  externalUrl?: string | null;
  isPreview: boolean;
};

export type CourseDetail = CourseSummary & {
  organizationId?: EntityId | null;
  lessons: CourseLesson[];
};

export type CourseEnrollment = {
  id: EntityId;
  courseId: EntityId;
  courseTitle?: string | null;
  instructorName?: string | null;
  status: string | number;
  paidAmount: number;
  progressPercent: number;
  completedAt?: string | null;
};

export type TeacherSlot = {
  id: EntityId;
  instructorUserId: EntityId;
  instructorName?: string | null;
  startsAt: string;
  endsAt: string;
  mode: string | number;
  status: string | number;
  priceAmount: number;
  currency: string;
  locationTitle?: string | null;
  notes?: string | null;
};

export type CourseCreatePayload = {
  title: string;
  slug?: string;
  description?: string;
  categoryId: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  deliveryMode: "Recorded" | "LiveOnline" | "InPerson" | "Hybrid";
  priceAmount: number;
  currency: string;
  durationMinutes?: number;
  startsAt?: string;
};

export type CourseLessonCreatePayload = {
  title: string;
  description?: string;
  contentType: "Video" | "Text" | "File" | "LiveSession" | "Quiz";
  sortOrder: number;
  durationMinutes?: number;
  externalUrl?: string;
  isPreview: boolean;
};

export type TeacherSlotCreatePayload = {
  startsAt: string;
  endsAt: string;
  mode: "Online" | "InPerson" | "Hybrid";
  priceAmount: number;
  currency: string;
  locationTitle?: string;
  notes?: string;
};
