using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxServices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceAndDiscountToInvoiceItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                table: "InvoiceItems",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "ServiceId",
                table: "InvoiceItems",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_ServiceId",
                table: "InvoiceItems",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_InvoiceItems_TenantId_ServiceId",
                table: "InvoiceItems",
                columns: new[] { "TenantId", "ServiceId" });

            migrationBuilder.AddForeignKey(
                name: "FK_InvoiceItems_Services_ServiceId",
                table: "InvoiceItems",
                column: "ServiceId",
                principalTable: "Services",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvoiceItems_Services_ServiceId",
                table: "InvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceItems_ServiceId",
                table: "InvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_InvoiceItems_TenantId_ServiceId",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                table: "InvoiceItems");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "InvoiceItems");
        }
    }
}
