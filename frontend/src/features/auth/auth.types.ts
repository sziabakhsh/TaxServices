export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  password: string
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
}

export interface AuthResponse {
  accessToken: string | null
  expiresAt: string | null
  requiresTwoFactor: boolean
}

export interface TwoFactorCodeRequest {
  email: string
  code: string
}

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

export interface LoginResult {
  requiresTwoFactor: boolean
  user?: CurrentUser
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export type SetPasswordRequest = {
  email: string
  token: string
  password: string
  confirmPassword: string
}

export interface TwoFactorStatusResponse {
  isEnabled: boolean
}

export interface ConfirmTwoFactorRequest {
  code: string
}