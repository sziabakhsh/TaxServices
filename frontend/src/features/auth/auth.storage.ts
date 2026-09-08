const TOKEN_KEY = 'taxservices_access_token'
const EXPIRES_KEY = 'taxservices_access_token_expires_at'

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  setToken(token: string, expiresAt?: string) {
    localStorage.setItem(TOKEN_KEY, token)
    if (expiresAt) localStorage.setItem(EXPIRES_KEY, expiresAt)
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EXPIRES_KEY)
  },
}
