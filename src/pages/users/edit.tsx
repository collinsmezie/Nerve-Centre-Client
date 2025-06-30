import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchUser, updateUser } from '@/api/users'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { UserForm, type UserFormValues } from './user-form'
import { Skeleton } from '@/components/ui/skeleton'

export function EditUserPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    data: user,
    isLoading,
    error
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id!),
    enabled: !!id
  })

  const mutation = useMutation({
    mutationFn: (data: UserFormValues) => updateUser(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['user', id] })
      toast({
        title: 'User updated',
        description: 'The user has been updated successfully.',
        variant: 'success'
      })
      navigate('/users')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update user. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: UserFormValues) => {
    mutation.mutate({ ...data, email: data.email.toLowerCase() })
  }

  if (isLoading) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/users')}
            className='h-8 w-8 p-0'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <Skeleton className='h-8 w-64' />
        </div>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
          <Skeleton className='h-8 w-full' />
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className='space-y-6'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/users')}
            className='h-8 w-8 p-0'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='sr-only'>Back</span>
          </Button>
          <h1 className='text-2xl font-bold tracking-tight'>Error</h1>
        </div>
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>
              Error loading user. Please try again later.
            </div>
          </div>
        </div>
        <Button onClick={() => navigate('/users')}>Back to Users</Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate('/users')}
          className='h-8 w-8 p-0'
        >
          <ArrowLeft className='h-4 w-4' />
          <span className='sr-only'>Back</span>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>
          Edit User: {user.firstName} {user.lastName}
        </h1>
      </div>

      <div className='rounded-md border p-6'>
        <UserForm
          defaultValues={user}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  )
}
