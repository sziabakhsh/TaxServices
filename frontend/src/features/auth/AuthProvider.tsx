import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import {
  getCurrentUser,
  login,
  register,
  verifyTwoFactor,
} from './auth.api'

import { authStorage } from './auth.storage'

import type {
  CurrentUser,
  LoginRequest,
  LoginResult,
  RegisterRequest,
  TwoFactorCodeRequest,
} from './auth.types'

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (
    request: LoginRequest
  ) => Promise<LoginResult>

  verifyTwoFactor: (
    request: TwoFactorCodeRequest
  ) => Promise<CurrentUser>

  register: (
    request: RegisterRequest
  ) => Promise<CurrentUser>

  logout: () => void
}

export const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined
  )

export function AuthProvider({
  children,
}: {
  children: ReactNode
}) {
  const [user, setUser] =
    useState<CurrentUser | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const loadUser = useCallback(async () => {
    const token = authStorage.getToken()

    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const currentUser =
        await getCurrentUser()

      setUser(currentUser)
    } catch {
      authStorage.clear()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUser()
  }, [loadUser])

  const signIn = useCallback(
    async (
      request: LoginRequest
    ): Promise<LoginResult> => {
      const response = await login(request)

      if (response.requiresTwoFactor) {
        return {
          requiresTwoFactor: true,
        }
      }

      if (
        !response.accessToken ||
        !response.expiresAt
      ) {
        throw new Error(
          'Authentication response did not contain an access token.'
        )
      }

      authStorage.setToken(
        response.accessToken,
        response.expiresAt
      )

      const currentUser =
        await getCurrentUser()

      setUser(currentUser)

      return {
        requiresTwoFactor: false,
        user: currentUser,
      }
    },
    []
  )

  const confirmTwoFactor = useCallback(
    async (
      request: TwoFactorCodeRequest
    ): Promise<CurrentUser> => {
      const response =
        await verifyTwoFactor(request)

      if (
        !response.accessToken ||
        !response.expiresAt
      ) {
        throw new Error(
          'Two-factor authentication did not return an access token.'
        )
      }

      authStorage.setToken(
        response.accessToken,
        response.expiresAt
      )

      const currentUser =
        await getCurrentUser()

      setUser(currentUser)

      return currentUser
    },
    []
  )

  const signUp = useCallback(
    async (
      request: RegisterRequest
    ): Promise<CurrentUser> => {
      const response = await register(request)

      if (
        !response.accessToken ||
        !response.expiresAt
      ) {
        throw new Error(
          'Registration did not return an access token.'
        )
      }

      authStorage.setToken(
        response.accessToken,
        response.expiresAt
      )

      const currentUser =
        await getCurrentUser()

      setUser(currentUser)

      return currentUser
    },
    []
  )

  const signOut = useCallback(() => {
    authStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login: signIn,
      verifyTwoFactor: confirmTwoFactor,
      register: signUp,
      logout: signOut,
    }),
    [
      user,
      isLoading,
      signIn,
      confirmTwoFactor,
      signUp,
      signOut,
    ]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}