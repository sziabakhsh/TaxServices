using System.ComponentModel.DataAnnotations;
namespace TaxServices.Application.DTOs.Signatures;
public class SignDocumentRequest
{
    [Required, MaxLength(200)] public string SignerName { get; set; } = string.Empty;
    [Required, MaxLength(200)] public string SignatureText { get; set; } = string.Empty;
    public bool ConsentAccepted { get; set; }
}
