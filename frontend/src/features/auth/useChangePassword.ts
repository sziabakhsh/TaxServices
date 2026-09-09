import { useMutation } from '@tanstack/react-query'
import { changePassword } from './auth.api'

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
  })
}
