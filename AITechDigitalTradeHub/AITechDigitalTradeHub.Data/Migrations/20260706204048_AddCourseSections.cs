using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCourseSections : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SectionId",
                table: "CourseLessons",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "CourseSections",
                columns: table => new
                {
                    ID = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<long>(type: "bigint", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(180)", maxLength: 180, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    LearningObjective = table.Column<string>(type: "nvarchar(600)", maxLength: 600, nullable: true),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: true),
                    CreateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdateDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeleteDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatorId = table.Column<long>(type: "bigint", nullable: true),
                    OtherLangs = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CourseSections", x => x.ID);
                    table.ForeignKey(
                        name: "FK_CourseSections_Courses_CourseId",
                        column: x => x.CourseId,
                        principalTable: "Courses",
                        principalColumn: "ID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseLessons_SectionId",
                table: "CourseLessons",
                column: "SectionId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseSections_CourseId_SortOrder",
                table: "CourseSections",
                columns: new[] { "CourseId", "SortOrder" });

            migrationBuilder.AddForeignKey(
                name: "FK_CourseLessons_CourseSections_SectionId",
                table: "CourseLessons",
                column: "SectionId",
                principalTable: "CourseSections",
                principalColumn: "ID",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseLessons_CourseSections_SectionId",
                table: "CourseLessons");

            migrationBuilder.DropTable(
                name: "CourseSections");

            migrationBuilder.DropIndex(
                name: "IX_CourseLessons_SectionId",
                table: "CourseLessons");

            migrationBuilder.DropColumn(
                name: "SectionId",
                table: "CourseLessons");
        }
    }
}
