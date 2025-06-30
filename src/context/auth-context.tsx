import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo
} from 'react'
import apiClient, { setAuthToken } from '@/api/api-client'

interface User {
  id: string
  email: string
  firstName: string
  lastName?: string
  roles: ('admin' | 'bureau')[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAdmin = useMemo(() => {
    return user?.roles.includes('admin') ?? false
  }, [user])

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          // Set the auth token for our API client
          setAuthToken(token)

          // Fetch current user data
          const response = await apiClient.get(`/auth/me`)

          if (response.status !== 200) {
            throw new Error('Failed to fetch user data')
          }
          setUser(response.data.user)
        }
      } catch (error) {
        // If token is invalid, clear it
        localStorage.removeItem('token')
        setAuthToken(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // For login, we use axios directly as we don't have a token yet
      const response = await apiClient.post(`/auth/login`, {
        email,
        password
      })

      const { access_token, user } = response.data

      // Save token to localStorage
      localStorage.setItem('token', access_token)

      // Set the auth token for our API client
      setAuthToken(access_token)

      setUser(user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token')

    // Remove auth token from our API client
    setAuthToken(null)

    // Clear user state
    setUser(null)
  }

  // const isAdmin = () => {
  //   return user?.roles.includes('admin') ? true : false
  // }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
