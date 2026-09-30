import { api } from '../../services/http/api'

import type {
  AuthResponse,
  ChangePasswordRequest,
  CreateClientResponse,
  CurrentUser,
  LoginRequest,
  RegisterRequest,
  SetPasswordRequest,
  TwoFactorCodeRequest,
  ConfirmTwoFactorRequest,
  TwoFactorStatusResponse,
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

export async function verifyTwoFactor(
  request: TwoFactorCodeRequest
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>(
    '/auth/verify-2fa',
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

export async function getTwoFactorStatus():
  Promise<TwoFactorStatusResponse> {
  const { data } =
    await api.get<TwoFactorStatusResponse>(
      '/auth/2fa/status'
    )

  return data
}

export async function requestEnableTwoFactor():
  Promise<void> {
  await api.post('/auth/2fa/enable/request')
}

export async function confirmEnableTwoFactor(
  request: ConfirmTwoFactorRequest
): Promise<void> {
  await api.post(
    '/auth/2fa/enable/confirm',
    request
  )
}

export async function requestDisableTwoFactor():
  Promise<void> {
  await api.post('/auth/2fa/disable/request')
}

export async function confirmDisableTwoFactor(
  request: ConfirmTwoFactorRequest
): Promise<void> {
  await api.post(
    '/auth/2fa/disable/confirm',
    request
  )
}
