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
    detail: (id: number) => `/projects/${id}`,
    mine: "/projects/mine",
    myProposals: "/projects/my-proposals",
    publish: (id: number) => `/projects/${id}/publish`,
    proposals: (projectId: number) => `/projects/${projectId}/proposals`,
    proposalStatus: (proposalId: number) => `/projects/proposals/${proposalId}/status`,
    acceptProposal: (proposalId: number) => `/projects/proposals/${proposalId}/accept`,
    contractMilestones: (contractId: number) => `/projects/contracts/${contractId}/milestones`,
    milestoneStatus: (milestoneId: number) => `/projects/milestones/${milestoneId}/status`,
    holdMilestoneEscrow: (milestoneId: number) => `/projects/milestones/${milestoneId}/escrow/hold`,
    releaseMilestoneEscrow: (milestoneId: number, escrowId: number) => `/projects/milestones/${milestoneId}/escrow/${escrowId}/release`,
    refundMilestoneEscrow: (milestoneId: number, escrowId: number) => `/projects/milestones/${milestoneId}/escrow/${escrowId}/refund`
  },
  education: {
    courses: "/education/courses",
    course: (id: number) => `/education/courses/${id}`,
    myCourses: "/education/courses/mine",
    publishCourse: (id: number) => `/education/courses/${id}/publish`,
    lessons: (courseId: number) => `/education/courses/${courseId}/lessons`,
    enroll: (courseId: number) => `/education/courses/${courseId}/enroll`,
    myEnrollments: "/education/enrollments/mine",
    instructorSlots: (instructorUserId: number) => `/education/instructors/${instructorUserId}/slots`,
    myInstructorSlots: "/education/instructors/me/slots",
    bookSlot: (slotId: number) => `/education/slots/${slotId}/book`
  },
  users: {
    roles: "/users/roles",
    myCapabilities: "/users/me/capabilities",
    requestCapability: "/users/me/capabilities",
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
  }
} as const;

export type ApiEndpointKey = keyof typeof apiEndpoints;
