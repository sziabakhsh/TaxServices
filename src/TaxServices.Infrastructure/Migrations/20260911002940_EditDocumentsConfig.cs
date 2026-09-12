using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxServices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EditDocumentsConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Documents_Clients_ClientId1",
                table: "Documents");

            migrationBuilder.DropIndex(
                name: "IX_Documents_ClientId1",
                table: "Documents");

            migrationBuilder.DropColumn(
                name: "ClientId1",
                table: "Documents");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ClientId1",
                table: "Documents",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Documents_ClientId1",
                table: "Documents",
                column: "ClientId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Documents_Clients_ClientId1",
                table: "Documents",
                column: "ClientId1",
                principalTable: "Clients",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
