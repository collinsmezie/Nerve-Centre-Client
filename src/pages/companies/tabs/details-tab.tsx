import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit, Save, X } from 'lucide-react'
import { fetchCompany, updateCompany } from '@/api/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/ui/multi-select'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { PROVINCES } from '@/lib/constants'
import { useAuth } from '@/context/auth-context'

const companyDetailsSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyIdNo: z
    .string()
    .min(2, 'Company ID number must be at least 2 characters'),
  companyAbbreviation: z
    .string()
    .min(1, 'Company abbreviation must be at least 1 character'),
  legalPerson: z
    .string()
    .min(2, 'Legal person name must be at least 2 characters'),
  accountDepartmentPerson: z
    .string()
    .min(2, 'Account department person name must be at least 2 characters'),
  accountDepartmentEmail: z
    .string()
    .email('Please enter a valid email address'),
  accountDepartmentName: z
    .string()
    .min(2, 'Please enter a valid account department name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  vatNumber: z.string().optional(),
  businessLicenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters'),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  regions: z.array(z.string()).min(1, 'Please select at least one region'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  registeredCapital: z
    .string()
    .min(2, 'Registered capital must be at least 2 characters')
})

type CompanyDetailsFormValues = z.infer<typeof companyDetailsSchema>

interface DetailsTabProps {
  companyId: string
}

export function DetailsTab({ companyId }: DetailsTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isAdmin } = useAuth()

  const {
    data: companyDetails,
    isLoading,
    isFetching,
    error
  } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId
  })

  const form = useForm<CompanyDetailsFormValues>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      companyName: '',
      companyIdNo: '',
      companyAbbreviation: '',
      accountDepartmentPerson: '',
      legalPerson: '',
      accountDepartmentEmail: '',
      accountDepartmentName: '',
      email: '',
      phone: '',
      vatNumber: '',
      businessLicenseNumber: '',
      industry: '',
      regions: [],
      address: '',
      registeredCapital: ''
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: CompanyDetailsFormValues) =>
      updateCompany(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['companies']
      })
      queryClient.invalidateQueries({
        queryKey: ['company', companyId]
      })
      toast({
        title: 'Company details updated',
        description: 'The company details have been updated successfully.',
        variant: 'success'
      })
      setIsEditing(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update company details. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: CompanyDetailsFormValues) => {
    updateMutation.mutate(data)
  }

  const startEditing = () => {
    if (companyDetails) {
      form.reset({
        companyName: companyDetails.companyName,
        companyIdNo: companyDetails.companyIdNo,
        companyAbbreviation: companyDetails.companyAbbreviation,
        accountDepartmentPerson: companyDetails.accountDepartmentPerson,
        legalPerson: companyDetails.legalPerson,
        accountDepartmentEmail: companyDetails.accountDepartmentEmail,
        accountDepartmentName: companyDetails.accountDepartmentName,
        email: companyDetails.email,
        phone: companyDetails.phone,
        vatNumber: companyDetails.vatNumber || '',
        businessLicenseNumber: companyDetails.businessLicenseNumber,
        industry: companyDetails.industry,
        regions: companyDetails.regions,
        address: companyDetails.address,
        registeredCapital: companyDetails.registeredCapital
      })
    }
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setIsEditing(false)
    form.reset()
  }

  if (isLoading || isFetching) {
    return (
      <div className='space-y-6'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-10 w-24' />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <Skeleton className='h-40' />
          <Skeleton className='h-40' />
          <Skeleton className='h-40' />
          <Skeleton className='h-40' />
        </div>
      </div>
    )
  }

  if (error || !companyDetails) {
    return (
      <div className='rounded-md bg-red-50 p-4'>
        <div className='flex'>
          <div className='text-sm text-red-700'>
            Error loading company details. Please try again later.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex sm:flex-row flex-col justify-between items-start sm:items-center sm:space-y-0 space-y-2'>
        <div>
          <h2 className='text-xl font-semibold'>Company Details</h2>
          <p className='text-sm text-gray-500'>Manage company details</p>
        </div>
        {isEditing ? (
          <div className='flex gap-2'>
            <Button variant='outline' onClick={cancelEditing}>
              <X className='mr-2 h-4 w-4' />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(handleSubmit)}
              className='bg-primary hover:bg-primary/90'
              disabled={updateMutation.isPending}
            >
              <Save className='mr-2 h-4 w-4' />
              {updateMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        ) : (
          isAdmin && (
            <Button variant='outline' onClick={startEditing}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Details
            </Button>
          )
        )}
      </div>

      {isEditing ? (
        <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium break-words'>
                Basic Information
              </h3>
              <p className='text-sm text-gray-500'>
                General information about the company
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='companyName'>Company Name</Label>
                <Input
                  id='companyName'
                  {...form.register('companyName')}
                  className={
                    form.formState.errors.companyName ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.companyName && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.companyName.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='companyIdNo'>Company ID Number</Label>
                <Input
                  id='companyIdNo'
                  {...form.register('companyIdNo')}
                  className={
                    form.formState.errors.companyIdNo ? 'border-red-500' : ''
                  }
                  disabled
                />
                {form.formState.errors.companyIdNo && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.companyIdNo.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='companyAbbreviation'>
                  Company Abbreviation
                </Label>
                <Input
                  id='companyAbbreviation'
                  {...form.register('companyAbbreviation')}
                  className={
                    form.formState.errors.companyAbbreviation
                      ? 'border-red-500'
                      : ''
                  }
                  disabled
                />
                {form.formState.errors.companyAbbreviation && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.companyAbbreviation.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input
                  id='email'
                  type='email'
                  {...form.register('email')}
                  className={
                    form.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.email && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone</Label>
                <Input id='phone' {...form.register('phone')} />
                {form.formState.errors.phone && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='vatNumber'>VAT Number (Optional)</Label>
                <Input id='vatNumber' {...form.register('vatNumber')} />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='businessLicenseNumber'>
                  Business License Number
                </Label>
                <Input
                  id='businessLicenseNumber'
                  {...form.register('businessLicenseNumber')}
                />
                {form.formState.errors.businessLicenseNumber && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.businessLicenseNumber.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='industry'>Industry</Label>
                <Input
                  id='industry'
                  {...form.register('industry')}
                  className={
                    form.formState.errors.industry ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.industry && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium break-words'>
                Contact Information
              </h3>
              <p className='text-sm text-gray-500'>
                Contact details for accounts and legal matters
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='accountDepartmentPerson'>
                  Account Department Person
                </Label>
                <Input
                  id='accountDepartmentPerson'
                  {...form.register('accountDepartmentPerson')}
                  className={
                    form.formState.errors.accountDepartmentPerson
                      ? 'border-red-500'
                      : ''
                  }
                />
                {form.formState.errors.accountDepartmentPerson && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.accountDepartmentPerson.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='legalPerson'>Legal Person/Rep</Label>
                <Input
                  id='legalPerson'
                  {...form.register('legalPerson')}
                  className={
                    form.formState.errors.legalPerson ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.legalPerson && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.legalPerson.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='accountDepartmentEmail'>
                  Account Department Email
                </Label>
                <Input
                  id='accountDepartmentEmail'
                  type='email'
                  {...form.register('accountDepartmentEmail')}
                  className={
                    form.formState.errors.accountDepartmentEmail
                      ? 'border-red-500'
                      : ''
                  }
                />
                {form.formState.errors.accountDepartmentEmail && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.accountDepartmentEmail.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='accountDepartmentName'>
                  Account Department Name
                </Label>
                <Input
                  id='accountDepartmentName'
                  {...form.register('accountDepartmentName')}
                  className={
                    form.formState.errors.accountDepartmentName
                      ? 'border-red-500'
                      : ''
                  }
                />
                {form.formState.errors.accountDepartmentName && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.accountDepartmentName.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium break-words'>
                Address & Regions
              </h3>
              <p className='text-sm text-gray-500'>
                Address information and regions
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='address'>Address</Label>
                <Textarea
                  id='address'
                  rows={3}
                  {...form.register('address')}
                  className={
                    form.formState.errors.address ? 'border-red-500' : ''
                  }
                />
                {form.formState.errors.address && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <Label htmlFor='registeredCapital'>Registered Capital</Label>
                <Input
                  id='registeredCapital'
                  {...form.register('registeredCapital')}
                  className={
                    form.formState.errors.registeredCapital
                      ? 'border-red-500'
                      : ''
                  }
                />
                {form.formState.errors.registeredCapital && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.registeredCapital.message}
                  </p>
                )}
              </div>

              <div className='space-y-2 sm:col-span-2'>
                <Label htmlFor='regions'>Regions</Label>
                <Controller
                  name='regions'
                  control={form.control}
                  render={({ field }) => (
                    <MultiSelect
                      id='company-details-regions'
                      options={PROVINCES}
                      value={field.value.map((value) => ({
                        label:
                          PROVINCES.find((p) => p.value === value)?.label ||
                          value,
                        value
                      }))}
                      onChange={(selected) =>
                        field.onChange(selected.map((item) => item.value))
                      }
                      className={
                        form.formState.errors.regions ? 'border-red-500' : ''
                      }
                    />
                  )}
                />
                {form.formState.errors.regions && (
                  <p className='text-sm text-red-500'>
                    {form.formState.errors.regions.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4 rounded-md border p-4'>
            <h3 className='font-medium text-lg'>Basic Information</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Company Name</p>
                <p className='font-medium break-words'>
                  {companyDetails.companyName}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Company ID Number</p>
                <p className='font-medium break-words'>
                  {companyDetails.companyIdNo}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Company Abbreviation</p>
                <p className='font-medium break-words'>
                  {companyDetails.companyAbbreviation}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Email</p>
                <p className='font-medium break-words'>
                  {companyDetails.email}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Phone</p>
                <p className='font-medium break-words'>
                  {companyDetails.phone}
                </p>
              </div>
              {companyDetails.vatNumber && (
                <div>
                  <p className='text-sm text-gray-500'>VAT Number</p>
                  <p className='font-medium break-words'>
                    {companyDetails.vatNumber}
                  </p>
                </div>
              )}
              {companyDetails.businessLicenseNumber && (
                <div>
                  <p className='text-sm text-gray-500'>
                    Business License Number
                  </p>
                  <p className='font-medium break-words'>
                    {companyDetails.businessLicenseNumber}
                  </p>
                </div>
              )}
              {companyDetails.industry && (
                <div>
                  <p className='text-sm text-gray-500'>Industry</p>
                  <p className='font-medium break-words'>
                    {companyDetails.industry}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className='space-y-4 rounded-md border p-4'>
            <h3 className='font-medium text-lg'>Contact Information</h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>
                  Account Department Person
                </p>
                <p className='font-medium break-words'>
                  {companyDetails.accountDepartmentPerson}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>
                  Account Department Email
                </p>
                <p className='font-medium break-words'>
                  {companyDetails.accountDepartmentEmail}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Account Department Name</p>
                <p className='font-medium break-words'>
                  {companyDetails.accountDepartmentName}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Legal Person/Rep</p>
                <p className='font-medium break-words'>
                  {companyDetails.legalPerson}
                </p>
              </div>
            </div>
          </div>

          <div className='space-y-4 rounded-md border p-4'>
            <h3 className='font-medium text-lg'>
              Address & Regions Information
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Address</p>
                <p className='font-medium break-words'>
                  {companyDetails.address}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Registered Capital</p>
                <p className='font-medium break-words'>
                  {companyDetails.registeredCapital}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Regions</p>
                <p className='font-medium break-words'>
                  {companyDetails.regions
                    .map((regionValue) => {
                      const province = PROVINCES.find(
                        (province) => province.value === regionValue
                      )
                      return province ? province.label : regionValue
                    })
                    .join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
