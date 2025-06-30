import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createUser } from '@/api/users'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { UserForm, type UserFormValues } from './user-form'

export function NewUserPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({
        title: 'User created',
        description: 'The user has been created successfully.',
        variant: 'success'
      })
      navigate('/users')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create user. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: UserFormValues) => {
    mutation.mutate({ ...data, email: data.email.toLowerCase() } as any)
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
        <h1 className='text-2xl font-bold tracking-tight'>Add New User</h1>
      </div>

      <div className='rounded-md border p-6'>
        <UserForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
      </div>
    </div>
  )
}
