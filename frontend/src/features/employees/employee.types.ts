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
