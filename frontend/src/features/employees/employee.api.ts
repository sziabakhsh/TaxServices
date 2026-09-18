import { api } from '../../services/http/api'

import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeCreatedResponse,
  UpdateEmployeeRequest,
} from './employee.types'

export async function getEmployees(): Promise<Employee[]> {
  const response = await api.get<Employee[]>('/Employees')

  return response.data
}

export async function getEmployeeById(
  employeeId: string
): Promise<Employee> {
  const response = await api.get<Employee>(
    `/Employees/${employeeId}`
  )

  return response.data
}

export async function createEmployee(
  request: CreateEmployeeRequest
): Promise<EmployeeCreatedResponse> {
  const response = await api.post<EmployeeCreatedResponse>(
    '/Employees',
    request
  )

  return response.data
}

export async function updateEmployee(
  employeeId: string,
  request: UpdateEmployeeRequest
): Promise<Employee> {
  const response = await api.put<Employee>(
    `/Employees/${employeeId}`,
    request
  )

  return response.data
}

export async function activateEmployee(
  employeeId: string
): Promise<void> {
  await api.patch(`/Employees/${employeeId}/activate`)
}

export async function deactivateEmployee(
  employeeId: string
): Promise<void> {
  await api.patch(`/Employees/${employeeId}/deactivate`)
}

export async function resendEmployeeInvitation(
  employeeId: string
): Promise<void> {
  await api.post(
    `/employees/${employeeId}/resend-invitation`
  )
}