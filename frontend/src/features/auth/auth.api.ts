import { api } from '../../services/http/api'

import type {
  AuthResponse,
  ChangePasswordRequest,
  CreateClientResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  SetPasswordRequest,
} from './auth.types'

export async function login(request: LoginRequest) {
  const { data } = await api.post<AuthResponse>('/auth/login', request)
  return data
}

/**
 * Public registration uses the Client creation endpoint.
 * The API creates the Identity user with a temporary password and
 * returns it so the frontend can immediately exchange it for a JWT.
 */
export async function register(request: RegisterRequest) {
  const { data } = await api.post<CreateClientResponse>('/clients', {
    firstName: request.firstName,
    lastName: request.lastName,
    email: request.email,
    phoneNumber: request.phoneNumber,
    isActive: true,
  })
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get<CurrentUser>('/auth/me')
  return data
}

export async function changePassword(request: ChangePasswordRequest) {
  await api.post('/auth/change-password', request)
}

export async function setPassword(
  request: SetPasswordRequest
): Promise<void> {
  await api.post('/Auth/set-password', request)
}