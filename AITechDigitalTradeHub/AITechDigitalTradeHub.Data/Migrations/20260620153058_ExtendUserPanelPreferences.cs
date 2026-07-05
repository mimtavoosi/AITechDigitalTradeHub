using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class ExtendUserPanelPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF COL_LENGTH('UserPanelPreferences', 'FontFamily') IS NULL
    ALTER TABLE [UserPanelPreferences] ADD [FontFamily] nvarchar(24) NOT NULL CONSTRAINT [DF_UserPanelPreferences_FontFamily] DEFAULT (N'');

IF COL_LENGTH('UserPanelPreferences', 'HiddenItemsJson') IS NULL
    ALTER TABLE [UserPanelPreferences] ADD [HiddenItemsJson] nvarchar(max) NULL;
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FontFamily",
                table: "UserPanelPreferences");

            migrationBuilder.DropColumn(
                name: "HiddenItemsJson",
                table: "UserPanelPreferences");
        }
    }
}
