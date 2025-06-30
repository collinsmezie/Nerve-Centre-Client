import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './header'
import { Footer } from './footer'
import { Toaster } from '@/components/ui/toaster'
import { useAuth } from '@/context/auth-context'
import { cn } from '@/lib/utils'

export function Layout() {
  const { isLoading, user } = useAuth()
  const { pathname } = useLocation()
  const removeLayoutViews =
    pathname === '/live-view' ||
    pathname === '/geo-fence' ||
    pathname === '/events'
  if (isLoading) return null
  return (
    <div className='flex flex-col min-h-screen'>
      {user ? <Header /> : null}
      <main className={cn(`flex-grow`, !removeLayoutViews ? 'container' : '')}>
        <div className={cn(`mx-auto`, !removeLayoutViews ? 'py-6' : '')}>
          {/* <main className={cn(`flex-grow`)}>
        <div className={cn(`mx-auto`)}> */}
          <Outlet />
        </div>
      </main>
      {user ? <Footer /> : null}
      <Toaster />
    </div>
  )
}
