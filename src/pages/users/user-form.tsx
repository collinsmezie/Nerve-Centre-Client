import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiSelect } from '@/components/ui/multi-select'
import { ROLES } from '@/lib/constants'
import { useNavigate } from 'react-router-dom'

const userSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roles: z.array(z.string()).min(1, 'Please select at least one role')
})

export type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
  defaultValues?: Partial<UserFormValues>
  onSubmit: (data: UserFormValues) => void
  isSubmitting: boolean
}

export function UserForm({
  defaultValues,
  onSubmit,
  isSubmitting
}: UserFormProps) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: defaultValues || {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      roles: []
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>User Information</h3>
          <p className='text-sm text-gray-500'>
            Basic information about the user
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='firstName'>First Name</Label>
            <Input
              id='firstName'
              {...register('firstName')}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && (
              <p className='text-sm text-red-500'>{errors.firstName.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='lastName'>Last Name</Label>
            <Input
              id='lastName'
              {...register('lastName')}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && (
              <p className='text-sm text-red-500'>{errors.lastName.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              {...register('email')}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className='text-sm text-red-500'>{errors.email.message}</p>
            )}
          </div>
        </div>

        {!defaultValues?.password ? (
          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <Input
              id='password'
              type='password'
              {...register('password')}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && (
              <p className='text-sm text-red-500'>{errors.password.message}</p>
            )}
          </div>
        ) : null}

        <div className='space-y-2'>
          <Label htmlFor='roles'>Roles</Label>
          <Controller
            name='roles'
            control={control}
            render={({ field }) => (
              <MultiSelect
                id='user-roles'
                options={ROLES}
                value={field.value.map((value) => ({
                  label: ROLES.find((r) => r.value === value)?.label || value,
                  value
                }))}
                onChange={(selected) =>
                  field.onChange(selected.map((item) => item.value))
                }
                className={errors.roles ? 'border-red-500' : ''}
              />
            )}
          />
          {errors.roles && (
            <p className='text-sm text-red-500'>{errors.roles.message}</p>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => navigate('/users')}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          className='bg-primary hover:bg-primary/90'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save User'}
        </Button>
      </div>
    </form>
  )
}
