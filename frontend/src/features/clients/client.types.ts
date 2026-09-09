export interface IndividualProfile {
  id: string
  dateOfBirth?: string | null
  address?: string | null
}

export interface ClientProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string | null
  isActive: boolean
  individualProfile?: IndividualProfile | null
}

export interface UpdateIndividualProfileRequest {
  sin?: string | null
  dateOfBirth?: string | null
  address: string
}

export interface UpdateClientProfileRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  individualProfile?: UpdateIndividualProfileRequest | null
}