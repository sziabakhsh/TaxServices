import { useMutation } from '@tanstack/react-query'
import { downloadMyDocument } from './documents.api'

interface DownloadDocumentRequest {
  id: string
  fileName: string
}

export function useDownloadDocument() {
  return useMutation({
    mutationFn: ({
      id,
      fileName,
    }: DownloadDocumentRequest) =>
      downloadMyDocument(id, fileName),
  })
}
