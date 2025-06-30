import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, user, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setError(null)
      await login(data.email, data.password)
      navigate('/companies')
    } catch (err) {
      setError('Invalid email or password. Please try again.')
    }
  }

  // If user is already logged in, redirect to companies page
  if (user) {
    return <Navigate to='/companies' replace />
  }

  return (
    <div className='flex min-h-[calc(100vh)] items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <img className='w-full' src='/cybele-logo.png' alt='Cybele Fleet' />
          <CardTitle className='text-2xl font-bold tracking-tight !mt-4'>
            Sign in to your account
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the Cybele Fleet admin portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant='destructive' className='mb-4'>
              <AlertCircle className='h-4 w-4 flex-shrink-0' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                type='email'
                placeholder='name@company.com'
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className='text-sm text-red-500'>{errors.email.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                {/* <Button
                  variant='link'
                  className='px-0 font-normal h-auto'
                  type='button'
                >
                  Forgot password?
                </Button> */}
              </div>
              <Input
                id='password'
                type='password'
                {...register('password')}
                className={errors.password ? 'border-red-500' : ''}
              />
              {errors.password && (
                <p className='text-sm text-red-500'>
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type='submit'
              className='w-full bg-primary hover:bg-primary/90'
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className='flex justify-center'>
          <p className='text-sm text-gray-500'>
            Contact your administrator if you need access
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
