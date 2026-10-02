# Stripe backend patch for TaxServices v7

Merge the `src` folder into the project.

## Configuration
Add this section to appsettings.json (no real secrets):

"Stripe": {
  "SecretKey": "",
  "WebhookSecret": "",
  "Currency": "cad",
  "SuccessPath": "/portal/invoices/payment-success",
  "CancelPath": "/portal/invoices/payment-cancelled"
}

For local development, store real values with user-secrets instead of committing them:

dotnet user-secrets init --project src/TaxServices.Api
dotnet user-secrets set "Stripe:SecretKey" "sk_test_..." --project src/TaxServices.Api
dotnet user-secrets set "Stripe:WebhookSecret" "whsec_..." --project src/TaxServices.Api

## Endpoints
POST /api/Payments/checkout (Client only)
POST /api/Payments/stripe/webhook (anonymous endpoint; Stripe signature is verified)

No EF migration is required for this patch because it reuses the existing Payment columns.
