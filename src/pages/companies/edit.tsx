import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { fetchCompany, updateCompany } from '@/api/companies'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { CompanyForm, type CompanyFormValues } from './company-form'
import { Skeleton } from '@/components/ui/skeleton'

export function EditCompanyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    data: company,
    isLoading,
    error
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id!),
    enabled: !!id
  })

  const mutation = useMutation({
    mutationFn: (data: CompanyFormValues) => updateCompany(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['company', id] })
      toast({
        title: 'Company updated',
        description: 'The company has been updated successfully.',
        variant: 'success'
      })
      navigate('/companies')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update company. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: CompanyFormValues) => {
    mutation.mutate(data)
  }

  if (isLoading) {
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

  if (error || !company) {
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
          <h1 className='text-2xl font-bold tracking-tight'>Error</h1>
        </div>
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>
              Error loading company. Please try again later.
            </div>
          </div>
        </div>
        <Button onClick={() => navigate('/companies')}>
          Back to Companies
        </Button>
      </div>
    )
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
        <h1 className='text-2xl font-bold tracking-tight'>
          Edit Company: {company.companyName}
        </h1>
      </div>

      <div className='rounded-md border p-6'>
        <CompanyForm
          defaultValues={company}
          onSubmit={handleSubmit}
          isSubmitting={mutation.isPending}
        />
      </div>
    </div>
  )
}
