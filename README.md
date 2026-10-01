# Digital Signature backend patch

## Scope
DocuSign-lite V1: staff requests signature; client views/signs/declines; staff cancels pending requests; SHA-256 binds the signature request to the exact decrypted document bytes; audit events record requested/viewed/signed/declined/cancelled; tenant and client ownership are enforced.

## Important design rules
- One pending request per document at a time.
- Previous declined/cancelled/signed requests remain as history.
- Signing re-hashes the current file and rejects the operation if bytes changed.
- A document with any signature history cannot be deleted or moved to another TaxCase.
- This is an electronic-signature workflow, not certificate-based PDF cryptographic signing.

## Apply
Copy the included files over the same paths in your project. New files should be added automatically by SDK-style csproj.

Then from the solution directory run:

    dotnet ef migrations add AddDocumentDigitalSignatures --project src/TaxServices.Infrastructure --startup-project src/TaxServices.Api
    dotnet ef database update --project src/TaxServices.Infrastructure --startup-project src/TaxServices.Api
    dotnet build

If `dotnet ef` is unavailable:

    dotnet tool install --global dotnet-ef

## Staff endpoints
POST   /api/document-signatures
GET    /api/document-signatures/document/{documentId}
POST   /api/document-signatures/{id}/cancel

Request body to create:
    { "documentId": "GUID" }

## Client endpoints
GET    /api/document-signatures/mine
GET    /api/document-signatures/mine/{id}
POST   /api/document-signatures/mine/{id}/view
POST   /api/document-signatures/mine/{id}/sign
POST   /api/document-signatures/mine/{id}/decline

Sign body:
    {
      "signerName": "Client Full Name",
      "signatureText": "Client Full Name",
      "consentAccepted": true
    }

Decline body:
    { "reason": "I need a correction before signing." }

## Recommended smoke test
1. Login as Admin/Employee and request signature for an existing document.
2. Repeat the request: expect HTTP 409 while the first request is Pending.
3. Login as the document's Client and GET /mine: request should appear.
4. POST /view: ViewedAt should be populated once.
5. POST /sign with consentAccepted=false: expect HTTP 400.
6. POST /sign with consentAccepted=true: expect Signed status and SignedAt.
7. Attempt to sign again: expect HTTP 409.
8. As staff, fetch history by document and confirm Requested/Viewed/Signed events.
9. Try deleting or moving the signed document: expect HTTP 409.
