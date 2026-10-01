export enum SignatureStatus {
  Pending = 1,
  Signed = 2,
  Declined = 3,
  Cancelled = 4,
}

export interface SignatureEvent {
  id: string
  eventType: number
  occurredAt: string
  ipAddress?: string | null
  userAgent?: string | null
  details?: string | null
}

export interface DocumentSignature {
  id: string
  documentId: string
  clientId: string
  fileName: string
  status: SignatureStatus
  requestedAt: string
  viewedAt?: string | null
  signedAt?: string | null
  declinedAt?: string | null
  cancelledAt?: string | null
  documentHash: string
  signerName?: string | null
  signatureText?: string | null
  consentAccepted: boolean
  declineReason?: string | null
  events: SignatureEvent[]
}

export interface CreateSignatureRequest {
  documentId: string
}

export interface SignDocumentRequest {
  signerName: string
  signatureText: string
  consentAccepted: boolean
}

export interface DeclineDocumentSignatureRequest {
  reason?: string | null
}