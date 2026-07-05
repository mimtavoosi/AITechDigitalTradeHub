export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    verifyMobile: "/auth/verify-mobile",
    resendMobileCode: "/auth/resend-mobile-code",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    me: "/auth/me",
    sessions: "/auth/sessions",
    revokeSession: (tokenId: number) => `/auth/sessions/${tokenId}`,
    changePassword: "/auth/change-password"
  },
  categories: {
    list: "/categories",
    detail: (id: number) => `/categories/${id}`
  },
  tags: {
    list: "/tags",
    detail: (id: number) => `/tags/${id}`
  },
  listings: {
    list: "/listings",
    detail: (id: number) => `/listings/${id}`,
    mine: "/listings/mine",
    publish: (id: number) => `/listings/${id}/publish`,
    adminList: "/listings/admin",
    adminStatus: (id: number) => `/listings/admin/${id}/status`
  },
  orders: {
    list: "/orders",
    adminList: "/orders/admin",
    purchases: "/orders/purchases",
    sales: "/orders/sales",
    detail: (id: number) => `/orders/${id}`,
    adminStatus: (id: number) => `/orders/admin/${id}/status`,
    pay: (id: number) => `/orders/${id}/pay`,
    start: (id: number) => `/orders/${id}/start`,
    deliver: (id: number) => `/orders/${id}/deliver`,
    complete: (id: number) => `/orders/${id}/complete`,
    cancel: (id: number) => `/orders/${id}/cancel`
  },
  projects: {
    list: "/projects",
    adminList: "/projects/admin",
    adminDisputes: "/projects/admin/disputes",
    adminStatus: (id: number) => `/projects/admin/${id}/status`,
    adminBlock: (id: number) => `/projects/admin/${id}/block`,
    adminTerminateContract: (id: number) => `/projects/admin/${id}/contract/terminate`,
    detail: (id: number) => `/projects/${id}`,
    mine: "/projects/mine",
    myProposals: "/projects/my-proposals",
    organizationProjects: (organizationId: number) => `/projects/organizations/${organizationId}`,
    publish: (id: number) => `/projects/${id}/publish`,
    proposals: (projectId: number) => `/projects/${projectId}/proposals`,
    proposalStatus: (proposalId: number) => `/projects/proposals/${proposalId}/status`,
    acceptProposal: (proposalId: number) => `/projects/proposals/${proposalId}/accept`,
    proposalCounterOffer: (proposalId: number) => `/projects/proposals/${proposalId}/counter-offer`,
    proposalCounterOfferResponse: (proposalId: number) => `/projects/proposals/${proposalId}/counter-offer/respond`,
    contractMilestones: (contractId: number) => `/projects/contracts/${contractId}/milestones`,
    milestoneStatus: (milestoneId: number) => `/projects/milestones/${milestoneId}/status`,
    holdMilestoneEscrow: (milestoneId: number) => `/projects/milestones/${milestoneId}/escrow/hold`,
    releaseMilestoneEscrow: (milestoneId: number, escrowId: number) => `/projects/milestones/${milestoneId}/escrow/${escrowId}/release`,
    refundMilestoneEscrow: (milestoneId: number, escrowId: number) => `/projects/milestones/${milestoneId}/escrow/${escrowId}/refund`,
    submitDeliverable: (milestoneId: number) => `/projects/milestones/${milestoneId}/deliverables`,
    approveDeliverable: (deliverableId: number) => `/projects/deliverables/${deliverableId}/approve`,
    requestDeliverableRevision: (deliverableId: number) => `/projects/deliverables/${deliverableId}/request-revision`,
    timesheets: (contractId: number) => `/projects/contracts/${contractId}/timesheets`,
    timesheetStatus: (timesheetId: number) => `/projects/timesheets/${timesheetId}/status`,
    completeContract: (contractId: number) => `/projects/contracts/${contractId}/complete`,
    activity: (id: number) => `/projects/${id}/activity`,
    documents: (id: number) => `/projects/${id}/documents`,
    conversation: (id: number) => `/projects/${id}/conversation`,
    messages: (id: number) => `/projects/${id}/messages`,
    disputes: (id: number) => `/projects/${id}/disputes`,
    disputeEvidence: (disputeId: number) => `/projects/disputes/${disputeId}/evidence`,
    disputeDecision: (disputeId: number) => `/projects/disputes/${disputeId}/decision`
  },
  organizations: {
    list: "/organizations",
    mine: "/organizations/mine",
    detail: (id: number) => `/organizations/${id}`,
    members: (id: number) => `/organizations/${id}/members`,
    adminList: "/organizations/admin",
    adminStatus: (id: number) => `/organizations/admin/${id}/status`
  },
  files: {
    upload: "/files"
  },
  tickets: {
    list: "/tickets",
    detail: (id: number) => `/tickets/${id}`,
    messages: (id: number) => `/tickets/${id}/messages`,
    attachments: (id: number) => `/tickets/${id}/attachments`,
    resolve: (id: number) => `/tickets/${id}/resolve`,
    close: (id: number) => `/tickets/${id}/close`,
    satisfaction: (id: number) => `/tickets/${id}/satisfaction`,
    adminList: "/tickets/admin",
    adminSummary: "/tickets/admin/summary",
    adminDetail: (id: number) => `/tickets/admin/${id}`,
    adminMessages: (id: number) => `/tickets/admin/${id}/messages`,
    adminAssign: (id: number) => `/tickets/admin/${id}/assign`,
    adminStatus: (id: number) => `/tickets/admin/${id}/status`,
    adminEscalate: (id: number) => `/tickets/admin/${id}/escalate`
  },
  conversations: {
    list: "/conversations",
    detail: (id: number) => `/conversations/${id}`,
    messages: (id: number) => `/conversations/${id}/messages`,
    read: (id: number) => `/conversations/${id}/read`
  },
  notifications: {
    list: "/notifications",
    unreadCount: "/notifications/unread-count",
    preferences: "/notifications/preferences",
    read: (id: number) => `/notifications/${id}/read`,
    readAll: "/notifications/read-all",
    delete: (id: number) => `/notifications/${id}`
  },
  reviews: {
    list: "/reviews",
    target: (targetType: string, targetId: number) => `/reviews/targets/${targetType}/${targetId}`,
    aggregate: (targetType: string, targetId: number) => `/reviews/targets/${targetType}/${targetId}/aggregate`,
    mine: "/reviews/mine"
  },
  education: {
    courses: "/education/courses",
    course: (id: number) => `/education/courses/${id}`,
    courseAccess: (id: number) => `/education/courses/${id}/access`,
    myCourses: "/education/courses/mine",
    courseStudents: (id: number) => `/education/courses/${id}/students`,
    publishCourse: (id: number) => `/education/courses/${id}/publish`,
    lessons: (courseId: number) => `/education/courses/${courseId}/lessons`,
    enroll: (courseId: number) => `/education/courses/${courseId}/enroll`,
    myEnrollments: "/education/enrollments/mine",
    enrollmentProgress: (enrollmentId: number) => `/education/enrollments/${enrollmentId}/progress`,
    lessonProgress: (enrollmentId: number) => `/education/enrollments/${enrollmentId}/lessons/progress`,
    updateLessonProgress: (enrollmentId: number, lessonId: number) => `/education/enrollments/${enrollmentId}/lessons/${lessonId}/progress`,
    instructorSlots: (instructorUserId: number) => `/education/instructors/${instructorUserId}/slots`,
    myInstructorSlots: "/education/instructors/me/slots",
    myBookings: "/education/bookings/mine",
    myInstructorBookings: "/education/instructors/me/bookings",
    instructorRevenue: "/education/instructors/me/revenue",
    bookingStatus: (bookingId: number) => `/education/bookings/${bookingId}/status`,
    certificate: (enrollmentId: number) => `/education/enrollments/${enrollmentId}/certificate`,
    instructors: "/education/instructors",
    instructor: (instructorUserId: number) => `/education/instructors/${instructorUserId}`,
    adminCourses: "/education/admin/courses",
    adminCourseStatus: (courseId: number) => `/education/admin/courses/${courseId}/status`,
    adminBookings: "/education/admin/bookings",
    bookSlot: (slotId: number) => `/education/slots/${slotId}/book`,
    questionnaire: "/education/questionnaire",
    recommendations: "/education/recommendations"
  },
  users: {
    roles: "/users/roles",
    myCapabilities: "/users/me/capabilities",
    requestCapability: "/users/me/capabilities",
    myProjectProfile: "/users/me/project-profile",
    panelPreference: (panelKey: string) => `/users/me/panel-preferences/${panelKey}`,
    projectProfile: (id: number) => `/users/project-profiles/${id}`,
    adminList: "/users/admin",
    adminDetail: (id: number) => `/users/admin/${id}`,
    capabilityRequests: "/users/admin/capability-requests",
    updateCapabilityRequest: (id: number) => `/users/admin/capability-requests/${id}`,
    updateStatus: (id: number) => `/users/admin/${id}/status`,
    updateVerification: (id: number) => `/users/admin/${id}/verification`
  },
  finance: {
    wallet: (id: number) => `/finance/wallets/${id}`,
    walletByOwner: "/finance/wallets/by-owner",
    myWallet: "/finance/wallets/me",
    createWallet: "/finance/wallets",
    walletTransactions: (id: number) => `/finance/wallets/${id}/transactions`,
    deposit: (id: number) => `/finance/wallets/${id}/deposit`,
    payCourse: (courseId: number) => `/finance/course-enrollments/${courseId}/pay`,
    payTeacherBooking: (bookingId: number) => `/finance/teacher-bookings/${bookingId}/pay`,
    escrows: "/finance/escrows",
    releaseEscrow: (id: number) => `/finance/escrows/${id}/release`,
    refundEscrow: (id: number) => `/finance/escrows/${id}/refund`,
    payoutRequests: "/finance/payout-requests"
  },
  investments: {
    list: "/investments",
    detail: (id: number) => `/investments/${id}`,
    adminList: "/investments/admin",
    adminDetail: (id: number) => `/investments/admin/${id}`,
    adminStatus: (id: number) => `/investments/admin/${id}/status`
  },
  adminReports: {
    biDashboard: "/admin/reports/bi-dashboard",
    activeUsers: "/admin/reports/active-users",
    finance: "/admin/reports/finance",
    projects: "/admin/reports/projects",
    services: "/admin/reports/services",
    education: "/admin/reports/education",
    investments: "/admin/reports/investments"
  },
  adminFinance: {
    dashboard: "/admin/finance/dashboard",
    wallets: "/admin/finance/wallets",
    transactions: "/admin/finance/transactions",
    escrows: "/admin/finance/escrows",
    payoutRequests: "/admin/finance/payout-requests"
  },
  adminAccess: {
    roles: "/admin/access/roles",
    role: (id: number) => `/admin/access/roles/${id}`,
    rolePermissions: (id: number) => `/admin/access/roles/${id}/permissions`,
    permissions: "/admin/access/permissions",
    permission: (id: number) => `/admin/access/permissions/${id}`,
    userPermissions: (userId: number) => `/admin/access/users/${userId}/permissions`,
    activityLogs: "/admin/access/activity-logs"
  },
  feeRules: {
    list: "/FeeRules",
    detail: (id: number) => `/FeeRules/${id}`,
    activate: (id: number) => `/FeeRules/${id}/activate`,
    deactivate: (id: number) => `/FeeRules/${id}/deactivate`,
    calculate: "/FeeRules/calculate"
  },
  badges: {
    list: "/Badges",
    forTarget: (targetType: string, targetId: number) => `/Badges/targets/${targetType}/${targetId}`,
    assignments: "/Badges/assignments",
    revoke: (assignmentId: number) => `/Badges/assignments/${assignmentId}/revoke`
  }
} as const;

export type ApiEndpointKey = keyof typeof apiEndpoints;
