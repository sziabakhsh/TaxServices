TaxServices v6 - Payment Backend Patch
======================================

Purpose
-------
Adds provider-independent Payment backend support for:
- Card (model-ready; provider integration comes next)
- Interac e-Transfer (manual staff/admin recording)
- Cash (manual staff/admin recording)
- Apple Pay / Google Pay enum readiness
- Multiple/partial payments per invoice
- Automatic Invoice -> Paid when successful payments cover TotalAmount

Security rule
-------------
Clients cannot mark a payment successful. The manual payment endpoint is restricted to Admin/Employee.
No card number, CVV, or sensitive card data is stored by this patch.

Apply
-----
Copy the src folder over your TaxServices v6 project, preserving paths.

Then run from the solution/project environment:

  dotnet build
  dotnet ef migrations add AddPayments --project src/TaxServices.Infrastructure --startup-project src/TaxServices.Api
  dotnet ef database update --project src/TaxServices.Infrastructure --startup-project src/TaxServices.Api
  dotnet test

Swagger test
------------
1. Use an Issued invoice.
2. POST /api/Payments/manual as Admin/Employee.
3. Method enum values:
   Card = 1
   InteracETransfer = 2
   Cash = 3
   ApplePay = 4
   GooglePay = 5
4. Manual endpoint accepts only method 2 or 3.
5. Record a partial payment and verify Invoice remains Issued.
6. Record remaining balance and verify Invoice becomes Paid.
7. GET /api/Payments/invoice/{invoiceId} to inspect payments.
8. Client can GET /api/Payments/me but cannot create/confirm manual payments.

Note
----
This patch intentionally does NOT include Stripe/payment-provider integration yet.
That is the next layer after this backend/migration passes build and Swagger tests.
