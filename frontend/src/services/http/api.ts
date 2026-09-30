import axios from 'axios'
import { authStorage } from '../../features/auth/auth.storage'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://localhost:7226/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = authStorage.getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      authStorage.clear()
    }

    return Promise.reject(error)
  }
)