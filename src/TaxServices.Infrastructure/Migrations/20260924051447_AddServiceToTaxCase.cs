using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxServices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceToTaxCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ServiceId",
                table: "TaxCases",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_TaxCases_ServiceId",
                table: "TaxCases",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_TaxCases_Services_ServiceId",
                table: "TaxCases",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_TaxCases_Services_ServiceId",
                table: "TaxCases");

            migrationBuilder.DropIndex(
                name: "IX_TaxCases_ServiceId",
                table: "TaxCases");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "TaxCases");
        }
    }
}
