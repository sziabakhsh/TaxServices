import { api } from '../../services/http/api'
import type { Employee } from './employee.types'

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