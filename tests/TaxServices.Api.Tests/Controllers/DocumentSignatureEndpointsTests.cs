using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using TaxServices.Api.Tests.Infrastructure;
using TaxServices.Application.DTOs.Signatures;
using TaxServices.Domain.Clients;
using TaxServices.Domain.Documents;
using TaxServices.Infrastructure;

namespace TaxServices.Api.Tests.Controllers;

/// <summary>
/// Integration tests for the document signature endpoints, covering the full signature workflow from request to signing and verification.
/// </summary>
public class DocumentSignatureEndpointsTests
    : IClassFixture<SignatureWebApplicationFactory>
{
    private readonly SignatureWebApplicationFactory _factory;

    public DocumentSignatureEndpointsTests(
        SignatureWebApplicationFactory factory)
    {
        _factory = factory;
    }

    /// <summary>
    /// Verifies the complete successful digital signature workflow:
    /// staff requests a signature, the client views and signs it,
    /// audit events are persisted in order, and the signed request
    /// cannot be signed a second time.
    /// Sign: Request → View → Sign → Audit Events → Sign Again = 409
    /// </summary>
    [Fact]
    public async Task Request_View_Sign_Should_Complete_Signature_Workflow()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var documentId = Guid.NewGuid();

        var staffUserId = Guid.NewGuid().ToString();
        var clientUserId = Guid.NewGuid().ToString();

        await SeedClientAndDocumentAsync(
            tenantId,
            clientId,
            clientUserId,
            documentId);

        // -------------------------------------------------
        // 1. Staff requests signature
        // -------------------------------------------------

        var staffClient = CreateAuthenticatedClient(
            staffUserId,
            tenantId,
            "Employee");

        var requestResponse =
            await staffClient.PostAsJsonAsync(
                "/api/document-signatures",
                new CreateSignatureRequest
                {
                    DocumentId = documentId
                });

        Assert.Equal(
            HttpStatusCode.Created,
            requestResponse.StatusCode);

        var requestedSignature =
            await requestResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(requestedSignature);

        Assert.Equal(
            SignatureStatus.Pending,
            requestedSignature.Status);

        Assert.Equal(
            documentId,
            requestedSignature.DocumentId);

        Assert.Equal(
            clientId,
            requestedSignature.ClientId);

        Assert.Single(requestedSignature.Events);

        Assert.Equal(
            SignatureEventType.Requested,
            requestedSignature.Events.First().EventType);

        var signatureId = requestedSignature.Id;

        // -------------------------------------------------
        // 2. Client views signature
        // -------------------------------------------------

        var client = CreateAuthenticatedClient(
            clientUserId,
            tenantId,
            "Client");

        var viewResponse =
            await client.PostAsync(
                $"/api/document-signatures/mine/{signatureId}/view",
                null);

        Assert.Equal(
            HttpStatusCode.OK,
            viewResponse.StatusCode);

        var viewedSignature =
            await viewResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(viewedSignature);
        Assert.NotNull(viewedSignature.ViewedAt);

        Assert.Equal(
            SignatureStatus.Pending,
            viewedSignature.Status);

        Assert.Equal(
            2,
            viewedSignature.Events.Count);

        Assert.Equal(
            new[]
            {
                SignatureEventType.Requested,
                SignatureEventType.Viewed
            },
            viewedSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 3. Client signs document
        // -------------------------------------------------

        var signResponse =
            await client.PostAsJsonAsync(
                $"/api/document-signatures/mine/{signatureId}/sign",
                new SignDocumentRequest
                {
                    SignerName = "Integration Test Client",
                    SignatureText = "Integration Test Client",
                    ConsentAccepted = true
                });

        Assert.Equal(
            HttpStatusCode.OK,
            signResponse.StatusCode);

        var signedSignature =
            await signResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(signedSignature);

        Assert.Equal(
            SignatureStatus.Signed,
            signedSignature.Status);

        Assert.NotNull(signedSignature.SignedAt);

        Assert.Equal(
            "Integration Test Client",
            signedSignature.SignerName);

        Assert.Equal(
            "Integration Test Client",
            signedSignature.SignatureText);

        Assert.True(
            signedSignature.ConsentAccepted);

        Assert.Equal(
            new[]
            {
                SignatureEventType.Requested,
                SignatureEventType.Viewed,
                SignatureEventType.Signed
            },
            signedSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 4. Staff verifies persisted signature + audit events
        // -------------------------------------------------

        var getResponse =
            await staffClient.GetAsync(
                $"/api/document-signatures/document/{documentId}");

        Assert.Equal(
            HttpStatusCode.OK,
            getResponse.StatusCode);

        var signatures =
            await getResponse.Content
                .ReadFromJsonAsync<List<DocumentSignatureResponse>>();

        Assert.NotNull(signatures);

        var persistedSignature =
            Assert.Single(signatures);

        Assert.Equal(
            SignatureStatus.Signed,
            persistedSignature.Status);

        Assert.Equal(
            new[]
            {
                SignatureEventType.Requested,
                SignatureEventType.Viewed,
                SignatureEventType.Signed
            },
            persistedSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 5. Client cannot sign the same request again
        // -------------------------------------------------

        var secondSignResponse =
            await client.PostAsJsonAsync(
                $"/api/document-signatures/mine/{signatureId}/sign",
                new SignDocumentRequest
                {
                    SignerName = "Integration Test Client",
                    SignatureText = "Integration Test Client",
                    ConsentAccepted = true
                });

        Assert.Equal(
            HttpStatusCode.Conflict,
            secondSignResponse.StatusCode);
    }

    /// <summary>
    /// Verifies that a client can view and decline a pending
    /// signature request, that the decline reason and audit events
    /// are persisted, and that a declined request cannot later be signed.
    /// Decline: Request → View → Decline → Audit Events → Sign = 409
    /// </summary>
    [Fact]
    public async Task Request_View_Decline_Should_Decline_And_Prevent_Signing()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var documentId = Guid.NewGuid();

        var staffUserId = Guid.NewGuid().ToString();
        var clientUserId = Guid.NewGuid().ToString();

        await SeedClientAndDocumentAsync(
            tenantId,
            clientId,
            clientUserId,
            documentId);

        var staffClient = CreateAuthenticatedClient(
            staffUserId,
            tenantId,
            "Employee");

        var client = CreateAuthenticatedClient(
            clientUserId,
            tenantId,
            "Client");

        // -------------------------------------------------
        // 1. Staff requests signature
        // -------------------------------------------------

        var requestResponse =
            await staffClient.PostAsJsonAsync(
                "/api/document-signatures",
                new CreateSignatureRequest
                {
                    DocumentId = documentId
                });

        Assert.Equal(
            HttpStatusCode.Created,
            requestResponse.StatusCode);

        var requestedSignature =
            await requestResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(requestedSignature);

        var signatureId = requestedSignature.Id;

        // -------------------------------------------------
        // 2. Client views signature
        // -------------------------------------------------

        var viewResponse =
            await client.PostAsync(
                $"/api/document-signatures/mine/{signatureId}/view",
                null);

        Assert.Equal(
            HttpStatusCode.OK,
            viewResponse.StatusCode);

        // -------------------------------------------------
        // 3. Client declines signature
        // -------------------------------------------------

        const string declineReason =
            "I need the document to be corrected.";

        var declineResponse =
            await client.PostAsJsonAsync(
                $"/api/document-signatures/mine/{signatureId}/decline",
                new DeclineSignatureRequest
                {
                    Reason = declineReason
                });

        Assert.Equal(
            HttpStatusCode.OK,
            declineResponse.StatusCode);

        var declinedSignature =
            await declineResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(declinedSignature);

        Assert.Equal(
            SignatureStatus.Declined,
            declinedSignature.Status);

        Assert.NotNull(
            declinedSignature.DeclinedAt);

        Assert.Equal(
            declineReason,
            declinedSignature.DeclineReason);

        Assert.Equal(
            new[]
            {
            SignatureEventType.Requested,
            SignatureEventType.Viewed,
            SignatureEventType.Declined
            },
            declinedSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 4. Staff verifies persisted state
        // -------------------------------------------------

        var getResponse =
            await staffClient.GetAsync(
                $"/api/document-signatures/document/{documentId}");

        Assert.Equal(
            HttpStatusCode.OK,
            getResponse.StatusCode);

        var signatures =
            await getResponse.Content
                .ReadFromJsonAsync<List<DocumentSignatureResponse>>();

        Assert.NotNull(signatures);

        var persistedSignature =
            Assert.Single(signatures);

        Assert.Equal(
            SignatureStatus.Declined,
            persistedSignature.Status);

        Assert.Equal(
            declineReason,
            persistedSignature.DeclineReason);

        Assert.Equal(
            new[]
            {
            SignatureEventType.Requested,
            SignatureEventType.Viewed,
            SignatureEventType.Declined
            },
            persistedSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 5. Declined signature cannot be signed
        // -------------------------------------------------

        var signResponse =
            await client.PostAsJsonAsync(
                $"/api/document-signatures/mine/{signatureId}/sign",
                new SignDocumentRequest
                {
                    SignerName = "Integration Test Client",
                    SignatureText = "Integration Test Client",
                    ConsentAccepted = true
                });

        Assert.Equal(
            HttpStatusCode.Conflict,
            signResponse.StatusCode);
    }

    /// <summary>
    /// Verifies that staff can cancel a pending signature request,
    /// that a cancelled request cannot be signed by the client,
    /// and that staff can create a new signature request for the
    /// same document after cancellation.
    /// Cancel: Request → Cancel → Sign = 409 → Request Again = 201
    /// </summary>
    [Fact]
    public async Task Request_Cancel_Should_Prevent_Signing_And_Allow_Request_Again()
    {
        // Arrange
        var tenantId = Guid.NewGuid();
        var clientId = Guid.NewGuid();
        var documentId = Guid.NewGuid();

        var staffUserId = Guid.NewGuid().ToString();
        var clientUserId = Guid.NewGuid().ToString();

        await SeedClientAndDocumentAsync(
            tenantId,
            clientId,
            clientUserId,
            documentId);

        var staffClient = CreateAuthenticatedClient(
            staffUserId,
            tenantId,
            "Employee");

        var client = CreateAuthenticatedClient(
            clientUserId,
            tenantId,
            "Client");

        // -------------------------------------------------
        // 1. Staff requests signature
        // -------------------------------------------------

        var requestResponse =
            await staffClient.PostAsJsonAsync(
                "/api/document-signatures",
                new CreateSignatureRequest
                {
                    DocumentId = documentId
                });

        Assert.Equal(
            HttpStatusCode.Created,
            requestResponse.StatusCode);

        var requestedSignature =
            await requestResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(requestedSignature);

        var signatureId = requestedSignature.Id;

        // -------------------------------------------------
        // 2. Staff cancels pending request
        // -------------------------------------------------

        var cancelResponse =
            await staffClient.PostAsync(
                $"/api/document-signatures/{signatureId}/cancel",
                null);

        Assert.Equal(
            HttpStatusCode.OK,
            cancelResponse.StatusCode);

        var cancelledSignature =
            await cancelResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(cancelledSignature);

        Assert.Equal(
            SignatureStatus.Cancelled,
            cancelledSignature.Status);

        Assert.NotNull(
            cancelledSignature.CancelledAt);

        Assert.Equal(
            new[]
            {
            SignatureEventType.Requested,
            SignatureEventType.Cancelled
            },
            cancelledSignature.Events
                .Select(x => x.EventType)
                .ToArray());

        // -------------------------------------------------
        // 3. Client cannot sign cancelled request
        // -------------------------------------------------

        var signResponse =
            await client.PostAsJsonAsync(
                $"/api/document-signatures/mine/{signatureId}/sign",
                new SignDocumentRequest
                {
                    SignerName = "Integration Test Client",
                    SignatureText = "Integration Test Client",
                    ConsentAccepted = true
                });

        Assert.Equal(
            HttpStatusCode.Conflict,
            signResponse.StatusCode);

        // -------------------------------------------------
        // 4. Staff can request signature again
        // -------------------------------------------------

        var requestAgainResponse =
            await staffClient.PostAsJsonAsync(
                "/api/document-signatures",
                new CreateSignatureRequest
                {
                    DocumentId = documentId
                });

        Assert.Equal(
            HttpStatusCode.Created,
            requestAgainResponse.StatusCode);

        var newSignature =
            await requestAgainResponse.Content
                .ReadFromJsonAsync<DocumentSignatureResponse>();

        Assert.NotNull(newSignature);

        Assert.NotEqual(
            signatureId,
            newSignature.Id);

        Assert.Equal(
            SignatureStatus.Pending,
            newSignature.Status);

        Assert.Equal(
            documentId,
            newSignature.DocumentId);

        Assert.Single(
            newSignature.Events);

        Assert.Equal(
            SignatureEventType.Requested,
            newSignature.Events.First().EventType);

        // -------------------------------------------------
        // 5. Staff sees both signature requests
        // -------------------------------------------------

        var getResponse =
            await staffClient.GetAsync(
                $"/api/document-signatures/document/{documentId}");

        Assert.Equal(
            HttpStatusCode.OK,
            getResponse.StatusCode);

        var signatures =
            await getResponse.Content
                .ReadFromJsonAsync<List<DocumentSignatureResponse>>();

        Assert.NotNull(signatures);
        Assert.Equal(2, signatures.Count);

        Assert.Contains(
            signatures,
            x =>
                x.Id == signatureId &&
                x.Status == SignatureStatus.Cancelled);

        Assert.Contains(
            signatures,
            x =>
                x.Id == newSignature.Id &&
                x.Status == SignatureStatus.Pending);
    }

    private HttpClient CreateAuthenticatedClient(
        string userId,
        Guid tenantId,
        string role)
    {
        var client = _factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            "X-Test-UserId",
            userId);

        client.DefaultRequestHeaders.Add(
            "X-Test-TenantId",
            tenantId.ToString());

        client.DefaultRequestHeaders.Add(
            "X-Test-Role",
            role);

        return client;
    }

    private async Task SeedClientAndDocumentAsync(
        Guid tenantId,
        Guid clientId,
        string clientUserId,
        Guid documentId)
    {
        using var scope =
            _factory.Services.CreateScope();

        var dbContext =
            scope.ServiceProvider
                .GetRequiredService<TaxServicesDbContext>();

        var client = new Client
        {
            Id = clientId,
            TenantId = tenantId,
            UserId = clientUserId,

            FirstName = "Integration",
            LastName = "Client",
            Email = $"client-{clientId}@example.com",
            PhoneNumber = "6045550100",
            IsActive = true
        };

        var document = new Document
        {
            Id = documentId,
            TenantId = tenantId,
            ClientId = clientId,

            OriginalFileName = "signature-test.pdf",
            StoredFileName = $"{documentId}.pdf",
            ContentType = "application/pdf",
            FileSize = 100,
            StoragePath =
                $"{tenantId}/{clientId}/{documentId}.pdf",

            UploadedAt = DateTime.UtcNow,
            EncryptionVersion = 1
        };

        dbContext.Clients.Add(client);
        dbContext.Documents.Add(document);

        await dbContext.SaveChangesAsync();
    }
}