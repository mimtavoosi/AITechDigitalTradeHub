using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeUserRolesAsCapabilities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                INSERT INTO UserRoles
                    (UserId, RoleId, Status, RequestedAt, ApprovedAt, ApprovedByUserId, RejectedAt, AdminNote,
                     CreateDate, UpdateDate, DeleteDate, IsActive, CreatorId, OtherLangs)
                SELECT
                    u.ID, u.RoleId, 2, COALESCE(u.CreateDate, SYSUTCDATETIME()), SYSUTCDATETIME(), NULL, NULL, NULL,
                    SYSUTCDATETIME(), SYSUTCDATETIME(), NULL, 1, NULL, NULL
                FROM Users u
                WHERE u.RoleId IS NOT NULL
                  AND EXISTS (SELECT 1 FROM Roles r WHERE r.ID = u.RoleId)
                  AND NOT EXISTS (
                      SELECT 1
                      FROM UserRoles ur
                      WHERE ur.UserId = u.ID AND ur.RoleId = u.RoleId
                  );
                """);

            migrationBuilder.Sql("""
                DELETE pr
                FROM PermissionRoles pr
                INNER JOIN Roles r ON r.ID = pr.RoleId
                INNER JOIN Permissions p ON p.ID = pr.PermissionId
                WHERE r.Name = N'User'
                  AND p.[Key] IN (N'listings.create', N'listings.manage-own');
                """);

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_RoleId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RoleId",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "RoleId",
                table: "Users",
                type: "bigint",
                nullable: true);

            migrationBuilder.Sql("""
                UPDATE u
                SET RoleId = selected.RoleId
                FROM Users u
                OUTER APPLY (
                    SELECT TOP 1 ur.RoleId
                    FROM UserRoles ur
                    WHERE ur.UserId = u.ID
                      AND ur.IsActive = 1
                      AND ur.Status = 2
                    ORDER BY ur.RoleId
                ) selected
                WHERE selected.RoleId IS NOT NULL;
                """);

            migrationBuilder.Sql("""
                INSERT INTO PermissionRoles
                    (RoleId, PermissionId, OwnerOnly, CreateDate, UpdateDate, DeleteDate, IsActive, CreatorId, OtherLangs)
                SELECT
                    r.ID, p.ID, 0, SYSUTCDATETIME(), SYSUTCDATETIME(), NULL, 1, NULL, NULL
                FROM Roles r
                CROSS JOIN Permissions p
                WHERE r.Name = N'User'
                  AND p.[Key] IN (N'listings.create', N'listings.manage-own')
                  AND NOT EXISTS (
                      SELECT 1
                      FROM PermissionRoles pr
                      WHERE pr.RoleId = r.ID AND pr.PermissionId = p.ID
                  );
                """);

            migrationBuilder.CreateIndex(
                name: "IX_Users_RoleId",
                table: "Users",
                column: "RoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Roles_RoleId",
                table: "Users",
                column: "RoleId",
                principalTable: "Roles",
                principalColumn: "ID");
        }
    }
}
