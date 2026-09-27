using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TaxServices.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SecureIndividualProfileSIN : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IndividualProfiles_TenantId_SIN",
                table: "IndividualProfiles");

            migrationBuilder.DropColumn(
                name: "SIN",
                table: "IndividualProfiles");

            migrationBuilder.AddColumn<string>(
                name: "EncryptedSIN",
                table: "IndividualProfiles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SINHash",
                table: "IndividualProfiles",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_IndividualProfiles_TenantId_SINHash",
                table: "IndividualProfiles",
                columns: new[] { "TenantId", "SINHash" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_IndividualProfiles_TenantId_SINHash",
                table: "IndividualProfiles");

            migrationBuilder.DropColumn(
                name: "EncryptedSIN",
                table: "IndividualProfiles");

            migrationBuilder.DropColumn(
                name: "SINHash",
                table: "IndividualProfiles");

            migrationBuilder.AddColumn<string>(
                name: "SIN",
                table: "IndividualProfiles",
                type: "nvarchar(9)",
                maxLength: 9,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_IndividualProfiles_TenantId_SIN",
                table: "IndividualProfiles",
                columns: new[] { "TenantId", "SIN" },
                unique: true);
        }
    }
}
