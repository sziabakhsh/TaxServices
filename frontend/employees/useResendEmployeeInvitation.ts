import { useMutation } from '@tanstack/react-query'

import { resendEmployeeInvitation } from './employee.api'

export function useResendEmployeeInvitation() {
  return useMutation({
    mutationFn: (employeeId: string) =>
      resendEmployeeInvitation(employeeId),
  })
}