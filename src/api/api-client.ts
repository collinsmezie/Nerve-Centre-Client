import axios from 'axios'
import { API_URL } from '@/lib/constants'

// Create a dedicated API client instance
const apiClient = axios.create({
  baseURL: API_URL
})

/**
 * Sets or removes the authentication token for all future API requests
 * @param token JWT token to set, or null to remove
 */
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete apiClient.defaults.headers.common['Authorization']
  }
}

// Initialize token from localStorage if it exists (for page refreshes)
const token =
  typeof window !== 'undefined' ? localStorage.getItem('token') : null
if (token) {
  setAuthToken(token)
}

export default apiClient
