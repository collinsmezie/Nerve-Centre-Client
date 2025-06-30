import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { createCompany } from '@/api/companies'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CompanyForm, type CompanyFormValues } from './company-form'

export function NewCompanyPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const mutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast({
        title: 'Company created',
        description: 'The company has been created successfully.',
        variant: 'success'
      })
      navigate('/companies')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create company. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: CompanyFormValues) => {
    mutation.mutate(data as any)
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-2'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => navigate('/companies')}
          className='h-8 w-8 p-0'
        >
          <ArrowLeft className='h-4 w-4' />
          <span className='sr-only'>Back</span>
        </Button>
        <h1 className='text-2xl font-bold tracking-tight'>Add New Company</h1>
      </div>

      <div className='rounded-md border p-6'>
        <CompanyForm
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  )
}
