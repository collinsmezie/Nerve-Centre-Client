import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/auth-context'
import { ProtectedRoute } from './components/protected-route'
import { Layout } from './components/layout/layout'
import { LoginPage } from './pages/login'
import { CompaniesPage } from './pages/companies/index'
import { NewCompanyPage } from './pages/companies/new'
import { EditCompanyPage } from './pages/companies/edit'
import { CompanyDetailPage } from './pages/companies/detail'
import { UnauthorizedPage } from './pages/unauthorized'
import { NotFoundPage } from './pages/not-found'
import { ToastProvider } from './hooks/use-toast'
import { UsersPage } from './pages/users'
import { NewUserPage } from './pages/users/new'
import { EditUserPage } from './pages/users/edit'
import { LiveViewPage } from './pages/liveview'
import { GeofencePage } from './pages/geofence'
import { EventsPage } from './pages/events'
import { EventDetailPage } from './pages/events/event/[id]'
import { AcknowledgeEventPage } from './pages/events/event/acknowledge'
import { ReallocateEventPage } from './pages/events/event/reallocate'
import { SuspendEventPage } from './pages/events/event/suspend'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <Routes>
              <Route path='/login' element={<LoginPage />} />
              <Route path='/unauthorized' element={<UnauthorizedPage />} />

              <Route element={<Layout />}>
                <Route
                  path='/'
                  element={<Navigate to='/companies' replace />}
                />

                <Route
                  path='/companies'
                  element={
                    <ProtectedRoute>
                      <CompaniesPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/companies/new'
                  element={
                    <ProtectedRoute requireAdmin>
                      <NewCompanyPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/companies/:id'
                  element={
                    <ProtectedRoute>
                      <CompanyDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/companies/:id/edit'
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditCompanyPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/users'
                  element={
                    <ProtectedRoute>
                      <UsersPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/users/new'
                  element={
                    <ProtectedRoute requireAdmin>
                      <NewUserPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/users/:id/edit'
                  element={
                    <ProtectedRoute requireAdmin>
                      <EditUserPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/live-view'
                  element={
                    <ProtectedRoute>
                      <LiveViewPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/geo-fence'
                  element={
                    <ProtectedRoute>
                      <GeofencePage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/events'
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/events/event/:id'
                  element={
                    <ProtectedRoute>
                      <EventDetailPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/events/event/:id/acknowledge'
                  element={
                    <ProtectedRoute>
                      <AcknowledgeEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/events/event/:id/reallocate'
                  element={
                    <ProtectedRoute>
                      <ReallocateEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path='/events/event/:id/suspend'
                  element={
                    <ProtectedRoute>
                      <SuspendEventPage />
                    </ProtectedRoute>
                  }
                />

                <Route path='*' element={<NotFoundPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
