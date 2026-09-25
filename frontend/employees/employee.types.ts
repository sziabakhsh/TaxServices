export interface Employee {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  jobTitle: string
  isActive: boolean
}

export interface CreateEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  jobTitle: string
}

export interface EmployeeCreatedResponse {
  employee: Employee
  temporaryPassword: string
}

export interface UpdateEmployeeRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  jobTitle: string
}

export interface EmployeeQueryParameters {
  pageNumber: number
  pageSize: number
  search?: string
  isActive?: boolean
}

export interface PagedEmployees {
  items: Employee[]
  pageNumber: number
  pageSize: number
  totalCount: number
  totalPages: number
}