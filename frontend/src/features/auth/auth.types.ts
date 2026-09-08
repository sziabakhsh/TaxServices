export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
}

export interface CreateClientResponse {
  client: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    isActive: boolean
  }
  temporaryPassword: string
}

export interface AuthResponse {
  accessToken: string
  expiresAt: string
}

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}
