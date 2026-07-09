import type { EntityId } from "@/types/domain";

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | number;
export type CourseDeliveryMode = "Recorded" | "LiveOnline" | "InPerson" | "Hybrid" | number;
export type CourseStatus = "Draft" | "PendingReview" | "Published" | "Archived" | number;
export type TeacherBookingStatus = "PendingPayment" | "PendingOrganizationApproval" | "Confirmed" | "Completed" | "Cancelled" | "Rejected" | "Refunded" | number;
export type EducationLearningGoal = "CareerStart" | "BuildProject" | "Upskill" | "Research" | number;
export type EducationTargetRole = "AiDeveloper" | "DataAnalyst" | "MlEngineer" | "ProductManager" | number;
export type EducationQuestionType = "SingleChoice" | "MultiChoice" | number;

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
  learningGoal?: EducationLearningGoal | null;
  targetRole?: EducationTargetRole | null;
  estimatedWeeks?: number | null;
  weeklyHoursMin?: number | null;
  weeklyHoursMax?: number | null;
  difficultyScore?: number | null;
  projectBased: boolean;
  requiresMentor: boolean;
  learningOutcomes?: string | null;
  prerequisitesSummary?: string | null;
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

export type TeacherBooking = {
  id: EntityId;
  instructorUserId: EntityId;
  instructorName?: string | null;
  studentUserId: EntityId;
  studentName?: string | null;
  startsAt: string;
  endsAt: string;
  mode: string | number;
  status: TeacherBookingStatus;
  priceAmount: number;
  currency: string;
  subject?: string | null;
  studentNotes?: string | null;
  meetingUrl?: string | null;
};

export type CourseAccess = {
  courseId: EntityId;
  canAccessPaidLessons: boolean;
  enrollmentId?: EntityId | null;
  enrollmentStatus?: string | number | null;
  progressPercent: number;
  canDownloadCertificate: boolean;
};

export type CourseLessonProgress = {
  id: EntityId;
  enrollmentId: EntityId;
  courseLessonId: EntityId;
  lessonTitle?: string | null;
  status: string | number;
  progressPercent: number;
  completedAt?: string | null;
};

export type CourseStudentEnrollment = {
  id: EntityId;
  courseId: EntityId;
  studentUserId: EntityId;
  studentName: string;
  studentUsername?: string | null;
  studentEmail?: string | null;
  status: string | number;
  paidAmount: number;
  progressPercent: number;
  completedAt?: string | null;
  enrolledAt?: string | null;
  lessonProgresses: CourseLessonProgress[];
};

export type EducationRevenue = {
  courseRevenue: number;
  bookingRevenue: number;
  totalRevenue: number;
  currency: string;
  activeEnrollments: number;
  completedBookings: number;
};

export type CourseCertificate = {
  certificateNumber: string;
  enrollmentId: EntityId;
  courseId: EntityId;
  courseTitle: string;
  studentName: string;
  instructorName?: string | null;
  completedAt: string;
  issuedAt: string;
  progressPercent: number;
};

export type InstructorProfile = {
  userId: EntityId;
  fullName?: string | null;
  headline?: string | null;
  bio?: string | null;
  expertise?: string | null;
  hourlyRate?: number | null;
  currency?: string | null;
  averageRating: number;
  reviewsCount: number;
  coursesCount: number;
  availableSlotsCount: number;
};

export type EducationReviewPayload = {
  targetType: "Course" | "User";
  targetId: number;
  contextType: "Course" | "TeacherBooking";
  contextId: number;
  rating: number;
  comment?: string;
};

export type ReviewAggregate = {
  targetType: string | number;
  targetId: EntityId;
  averageRating: number;
  reviewsCount: number;
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
  learningGoal?: EducationLearningGoal | null;
  targetRole?: EducationTargetRole | null;
  estimatedWeeks?: number | null;
  weeklyHoursMin?: number | null;
  weeklyHoursMax?: number | null;
  difficultyScore?: number | null;
  projectBased?: boolean;
  requiresMentor?: boolean;
  learningOutcomes?: string;
  prerequisitesSummary?: string;
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

export type EducationQuestionnairePayload = {
  goal: string;
  learningGoal?: EducationLearningGoal | null;
  targetRole?: EducationTargetRole | null;
  level: "Beginner" | "Intermediate" | "Advanced";
  weeklyHours: number;
  preferredMode: "Recorded" | "LiveOnline" | "InPerson" | "Hybrid";
  skillTagIds?: number[];
  selectedOptionIds?: number[];
  freeText?: string;
};

export type EducationQuestionnaireOption = {
  id: EntityId;
  value: string;
  label: string;
  sortOrder: number;
  learningGoal?: EducationLearningGoal | null;
  targetRole?: EducationTargetRole | null;
  level?: CourseLevel | null;
  preferredMode?: CourseDeliveryMode | null;
  weeklyHoursMin?: number | null;
  weeklyHoursMax?: number | null;
  skillTagId?: EntityId | null;
  weight: number;
};

export type EducationQuestionnaireQuestion = {
  id: EntityId;
  code: string;
  title: string;
  helpText?: string | null;
  questionType: EducationQuestionType;
  sortOrder: number;
  isRequired: boolean;
  options: EducationQuestionnaireOption[];
};

export type EducationRoadmapNodeCourse = {
  course: CourseSummary;
  reason: string;
  matchScore: number;
};

export type EducationRoadmapNode = {
  id: string;
  title: string;
  description: string;
  order: number;
  dependsOn: string[];
  skills: string[];
  estimatedWeeks: number;
  isOptional: boolean;
  courses: EducationRoadmapNodeCourse[];
};

export type EducationRecommendation = {
  roadmapTitle: string;
  roadmapSummary: string;
  totalEstimatedWeeks: number;
  nodes: EducationRoadmapNode[];
  tips: string[];
  recommendedCourses: CourseSummary[];
  recommendedTeacherSlots: TeacherSlot[];
};
