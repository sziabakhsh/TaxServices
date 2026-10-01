using System.ComponentModel.DataAnnotations;
namespace TaxServices.Application.DTOs.Signatures;
public class DeclineSignatureRequest { [Required, MaxLength(1000)] public string Reason { get; set; } = string.Empty; }
