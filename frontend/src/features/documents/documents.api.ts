import { api } from '../../services/http/api'
import type {
  DocumentItem,
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