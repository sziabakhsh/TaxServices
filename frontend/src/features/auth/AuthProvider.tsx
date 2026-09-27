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
} from './auth.api'

import { authStorage } from './auth.storage'

import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from './auth.types'

interface AuthContextValue {
  user: CurrentUser | null
  isLoading: boolean
  isAuthenticated: boolean

  login: (
    request: LoginRequest
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
    ): Promise<CurrentUser> => {
      const response = await login(request)

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
      register: signUp,
      logout: signOut,
    }),
    [
      user,
      isLoading,
      signIn,
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