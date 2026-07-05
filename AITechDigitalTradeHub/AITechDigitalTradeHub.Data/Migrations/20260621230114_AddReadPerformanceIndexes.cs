using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReadPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Projects_EmployerUserId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OrganizationId",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_ProjectActivityLogs_ProjectId",
                table: "ProjectActivityLogs");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Listings_OwnerUserId",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Courses_InstructorUserId",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_CourseEnrollments_StudentUserId",
                table: "CourseEnrollments");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_EmployerUserId_DeleteDate_CreateDate",
                table: "Projects",
                columns: new[] { "EmployerUserId", "DeleteDate", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OrganizationId_DeleteDate_CreateDate",
                table: "Projects",
                columns: new[] { "OrganizationId", "DeleteDate", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Status_IsActive_DeleteDate_PublishedAt",
                table: "Projects",
                columns: new[] { "Status", "IsActive", "DeleteDate", "PublishedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectActivityLogs_ProjectId_CreateDate",
                table: "ProjectActivityLogs",
                columns: new[] { "ProjectId", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_DeleteDate_CreateDate",
                table: "Notifications",
                columns: new[] { "UserId", "DeleteDate", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead_DeleteDate",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead", "DeleteDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Messages_ConversationId_CreateDate",
                table: "Messages",
                columns: new[] { "ConversationId", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_OwnerUserId_CreateDate",
                table: "Listings",
                columns: new[] { "OwnerUserId", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_Listings_Status_ListingType_PublishedAt",
                table: "Listings",
                columns: new[] { "Status", "ListingType", "PublishedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Courses_InstructorUserId_CreateDate",
                table: "Courses",
                columns: new[] { "InstructorUserId", "CreateDate" });

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_StudentUserId_CreateDate",
                table: "CourseEnrollments",
                columns: new[] { "StudentUserId", "CreateDate" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Projects_EmployerUserId_DeleteDate_CreateDate",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_OrganizationId_DeleteDate_CreateDate",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_Projects_Status_IsActive_DeleteDate_PublishedAt",
                table: "Projects");

            migrationBuilder.DropIndex(
                name: "IX_ProjectActivityLogs_ProjectId_CreateDate",
                table: "ProjectActivityLogs");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_DeleteDate_CreateDate",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_IsRead_DeleteDate",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Messages_ConversationId_CreateDate",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Listings_OwnerUserId_CreateDate",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Listings_Status_ListingType_PublishedAt",
                table: "Listings");

            migrationBuilder.DropIndex(
                name: "IX_Courses_InstructorUserId_CreateDate",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_CourseEnrollments_StudentUserId_CreateDate",
                table: "CourseEnrollments");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_EmployerUserId",
                table: "Projects",
                column: "EmployerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_OrganizationId",
                table: "Projects",
                column: "OrganizationId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectActivityLogs_ProjectId",
                table: "ProjectActivityLogs",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Listings_OwnerUserId",
                table: "Listings",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Courses_InstructorUserId",
                table: "Courses",
                column: "InstructorUserId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseEnrollments_StudentUserId",
                table: "CourseEnrollments",
                column: "StudentUserId");
        }
    }
}
