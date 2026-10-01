import { api } from '../../services/http/api'

import type {
  CreateSignatureRequest,
  DeclineDocumentSignatureRequest,
  DocumentSignature,
  SignDocumentRequest,
} from './signature.types'

export async function requestDocumentSignature(
  request: CreateSignatureRequest
): Promise<DocumentSignature> {
  const response = await api.post<DocumentSignature>(
    '/document-signatures',
    request
  )

  return response.data
}

export async function getDocumentSignatures(
  documentId: string
): Promise<DocumentSignature[]> {
  const response = await api.get<DocumentSignature[]>(
    `/document-signatures/document/${documentId}`
  )

  return response.data
}

export async function cancelDocumentSignature(
  signatureId: string
): Promise<DocumentSignature> {
  const response = await api.post<DocumentSignature>(
    `/document-signatures/${signatureId}/cancel`
  )

  return response.data
}

export async function getMyDocumentSignatures(): Promise<
  DocumentSignature[]
> {
  const response = await api.get<DocumentSignature[]>(
    '/document-signatures/mine'
  )

  return response.data
}

export async function getMyDocumentSignature(
  signatureId: string
): Promise<DocumentSignature> {
  const response = await api.get<DocumentSignature>(
    `/document-signatures/mine/${signatureId}`
  )

  return response.data
}

export async function markSignatureAsViewed(
  signatureId: string
): Promise<DocumentSignature> {
  const response = await api.post<DocumentSignature>(
    `/document-signatures/mine/${signatureId}/view`
  )

  return response.data
}

export async function signDocumentSignature(
  signatureId: string,
  request: SignDocumentRequest
): Promise<DocumentSignature> {
  const response = await api.post<DocumentSignature>(
    `/document-signatures/mine/${signatureId}/sign`,
    request
  )

  return response.data
}

export async function declineDocumentSignature(
  signatureId: string,
  request: DeclineDocumentSignatureRequest
): Promise<DocumentSignature> {
  const response = await api.post<DocumentSignature>(
    `/document-signatures/mine/${signatureId}/decline`,
    request
  )

  return response.data
}