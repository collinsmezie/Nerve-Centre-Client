import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Edit, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/auth-context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const navigation = [
  { name: 'Events', href: '/events' },
  { name: 'Live View', href: '/live-view' },
  { name: 'Geo-fence', href: '/geo-fence' },
  { name: 'Companies', href: '/companies' },
  { name: 'Risk Parameters', href: '/risk-parameters' },
  { name: 'Actions', href: '/actions' }
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  return (
    <header className='bg-white shadow-sm sticky top-0 z-50'>
      <nav
        className='mx-auto flex items-center justify-between p-4 lg:px-8'
        aria-label='Global'
      >
        <div className='flex lg:flex-1'>
          <Link to='/' className='-m-1.5'>
            <span className='sr-only'>Cybele Fleet</span>
            <img
              className='h-12 w-auto'
              src='/cybele-logo.svg'
              alt='Cybele Fleet'
            />
          </Link>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <Menu className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-6'>
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'text-sm font-semibold leading-6',
                location.pathname.startsWith(item.href)
                  ? 'text-primary'
                  : 'text-gray-900 hover:text-primary'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end'>
          {user ? (
            <div className='flex items-center gap-4'>
              {isAdmin ? (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant='outline' className='border-primary'>
                      <span>{user.firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/users`)
                      }}
                    >
                      <Edit className='mr-2 h-4 w-4' />
                      Manage Users
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className='text-sm text-gray-700'>{user.firstName}</span>
              )}

              <Button
                variant='ghost'
                onClick={logout}
                className='text-sm font-semibold leading-6'
              >
                Logout
              </Button>
            </div>
          ) : (
            <Link
              to='/login'
              className='text-sm font-semibold leading-6 text-gray-900'
            >
              Log in <span aria-hidden='true'>&rarr;</span>
            </Link>
          )}
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden'>
          <div className='fixed inset-0 z-50' />
          <div className='fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-4 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between sm:justify-end'>
              <Link to='/' className='-m-1.5 sm:hidden block'>
                <span className='sr-only'>Cybele Fleet</span>
                <img
                  className='h-12 w-auto'
                  src='/cybele-logo.svg'
                  alt='Cybele Fleet'
                />
              </Link>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='sr-only'>Close menu</span>
                <X className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        '-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7',
                        location.pathname === item.href
                          ? 'bg-gray-50 text-primary'
                          : 'text-gray-900 hover:bg-gray-50'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className='py-6'>
                  {user ? (
                    <div className='space-y-3'>
                      {isAdmin ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button
                              variant='outline'
                              className='w-full border-primary'
                            >
                              <span>{user.firstName}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                navigate(`/users`)
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Manage Users
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : null}
                      <Button
                        variant='ghost'
                        onClick={() => {
                          logout()
                          setMobileMenuOpen(false)
                        }}
                        className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                      >
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Link
                      to='/login'
                      className='-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
