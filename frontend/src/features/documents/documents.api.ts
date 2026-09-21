import { api } from '../../services/http/api'

import type {
  DocumentItem,
  DocumentQueryParameters,
  PagedDocuments,
  UploadDocumentRequest,
} from './documents.types'

export async function uploadDocument(
  request: UploadDocumentRequest
): Promise<DocumentItem> {
  const formData = new FormData()

  if (request.taxCaseId) {
    formData.append('taxCaseId', request.taxCaseId)
  }

  formData.append('file', request.file)

  const response = await api.post<DocumentItem>(
    '/documents/mine/upload',
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    }
  )

  return response.data
}

export async function getMyDocuments(): Promise<DocumentItem[]> {
  const response = await api.get<DocumentItem[]>(
    '/documents/mine'
  )

  return response.data
}

export async function downloadMyDocument(
  id: string,
  fileName: string
): Promise<void> {
  const response = await api.get(
    `/documents/mine/${id}/download`,
    {
      responseType: 'blob',
    }
  )

  const url = window.URL.createObjectURL(response.data)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function getClientDocuments(
  clientId: string
): Promise<DocumentItem[]> {
  const response = await api.get<DocumentItem[]>(
    `/documents/client/${clientId}`
  )

  return response.data
}

export async function getTaxCaseDocuments(
  taxCaseId: string
): Promise<DocumentItem[]> {
  const response = await api.get<DocumentItem[]>(
    `/documents/case/${taxCaseId}`
  )

  return response.data
}

export async function downloadClientDocument(
  documentId: string,
  fileName: string
) {
  const response = await api.get(
    `/documents/${documentId}/download`,
    {
      responseType: 'blob',
    }
  )

  const url = window.URL.createObjectURL(response.data)

  const link = document.createElement('a')
  link.href = url
  link.download = fileName

  document.body.appendChild(link)
  link.click()
  link.remove()

  window.URL.revokeObjectURL(url)
}

export async function deleteClientDocument(
  documentId: string
): Promise<void> {
  await api.delete(
    `/documents/${documentId}`
  )
}

export async function uploadClientDocument(
  clientId: string,
  file: File,
  taxCaseId?: string
) {
  const formData = new FormData()

  formData.append('file', file)

  const params = new URLSearchParams()

  params.append('clientId', clientId)

  if (taxCaseId) {
    params.append('taxCaseId', taxCaseId)
  }

  const response = await api.post(
    `/documents/upload?${params.toString()}`,
    formData,
    {
      headers: {
        'Content-Type': undefined,
      },
    }
  )

  return response.data
}

export async function getDocuments(
  parameters: DocumentQueryParameters
): Promise<PagedDocuments> {
  const response = await api.get<PagedDocuments>(
    '/documents',
    {
      params: {
        pageNumber: parameters.pageNumber,
        pageSize: parameters.pageSize,
        search: parameters.search || undefined,
        clientId: parameters.clientId || undefined,
        taxCaseId: parameters.taxCaseId || undefined,
        taxYear: parameters.taxYear || undefined,
      },
    }
  )

  return response.data
}
