using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddOrganizationTypesAndProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Organizations",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicEmail",
                table: "Organizations",
                type: "nvarchar(180)",
                maxLength: 180,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PublicPhone",
                table: "Organizations",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "Type",
                table: "Organizations",
                type: "tinyint",
                nullable: false,
                defaultValue: (byte)1);

            migrationBuilder.AddColumn<string>(
                name: "WebsiteUrl",
                table: "Organizations",
                type: "nvarchar(300)",
                maxLength: 300,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Description",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PublicEmail",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "PublicPhone",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Organizations");

            migrationBuilder.DropColumn(
                name: "WebsiteUrl",
                table: "Organizations");
        }
    }
}
