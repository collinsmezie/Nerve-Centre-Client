import type React from 'react'

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({
  children,
  requireAdmin = false
}: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    // Redirect to unauthorized page if admin access is required but user is not an admin
    return <Navigate to='/unauthorized' replace />
  }

  return <>{children}</>
}
