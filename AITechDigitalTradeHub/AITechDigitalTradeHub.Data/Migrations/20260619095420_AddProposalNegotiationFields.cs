using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AITechDigitalTradeHub.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProposalNegotiationFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CounterAcceptedAt",
                table: "Proposals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CounterDays",
                table: "Proposals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CounterMessage",
                table: "Proposals",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CounterOfferAt",
                table: "Proposals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "CounterPrice",
                table: "Proposals",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CounterRejectedAt",
                table: "Proposals",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CounterAcceptedAt",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "CounterDays",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "CounterMessage",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "CounterOfferAt",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "CounterPrice",
                table: "Proposals");

            migrationBuilder.DropColumn(
                name: "CounterRejectedAt",
                table: "Proposals");
        }
    }
}
