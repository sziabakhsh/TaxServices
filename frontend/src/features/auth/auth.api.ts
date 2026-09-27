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

export async function login(
  request: LoginRequest
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/auth/login',
    request
  )

  return data
}

export async function register(
  request: RegisterRequest
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/clients/register',
    request
  )

  return data
}

export async function getCurrentUser():
  Promise<CurrentUser> {
  const { data } =
    await api.get<CurrentUser>('/auth/me')

  return data
}

export async function changePassword(
  request: ChangePasswordRequest
): Promise<void> {
  await api.post(
    '/auth/change-password',
    request
  )
}

export async function setPassword(
  request: SetPasswordRequest
): Promise<void> {
  await api.post(
    '/auth/set-password',
    request
  )
}