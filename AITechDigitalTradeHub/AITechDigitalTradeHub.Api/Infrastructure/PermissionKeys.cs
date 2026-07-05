namespace AITechDigitalTradeHub.Api.Infrastructure
{
    public static class PermissionKeys
    {
        public const string ManageUsers = "users.manage";
        public const string ManageCategories = "categories.manage";
        public const string CreateListing = "listings.create";
        public const string ManageOwnListing = "listings.manage-own";
        public const string CreateProject = "projects.create";
        public const string ManageOwnProject = "projects.manage-own";
        public const string SubmitProposal = "projects.proposals.submit";
        public const string ManageProjectProposal = "projects.proposals.manage";
        public const string UseWallet = "finance.wallet.use";
        public const string ManageTickets = "tickets.manage";
        public const string ReviewCreate = "reviews.create";

        public const string EducationCourseRead = "education.courses.read";
        public const string EducationCourseManage = "education.courses.manage";
        public const string EducationInstructorManage = "education.instructors.manage";
        public const string EducationBookingCreate = "education.bookings.create";
        public const string EducationBookingManage = "education.bookings.manage";
        public const string EducationAdminManage = "education.admin.manage";
        public const string OrganizationManage = "organizations.manage";
        public const string OrganizationAdminManage = "organizations.admin.manage";
    }
}
