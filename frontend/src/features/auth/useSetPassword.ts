import { useMutation } from '@tanstack/react-query'
import { type SetPasswordRequest } from './auth.types'
import {  setPassword } from './auth.api'

export function useSetPassword() {
  return useMutation({
    mutationFn: (request: SetPasswordRequest) =>
      setPassword(request),
  })
}