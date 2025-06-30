import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MultiSelect } from '@/components/ui/multi-select'
import { PROVINCES } from '@/lib/constants'
import { useNavigate } from 'react-router-dom'

const companySchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  // companyIdNo: z
  //   .string()
  //   .min(2, 'Company ID number must be at least 2 characters'),
  // companyAbbreviation: z
  //   .string()
  //   .min(1, 'Company abbreviation must be at least 1 character'),
  legalPerson: z
    .string()
    .min(2, 'Legal representative name must be at least 2 characters'),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 characters'),
  vatNumber: z
    .string()
    .min(2, 'VAT number must be at least 2 characters')
    .optional()
    .or(z.literal('')),
  businessLicenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters'),
  accountDepartmentPerson: z
    .string()
    .min(2, 'Account department person name must be at least 2 characters'),
  accountDepartmentEmail: z
    .string()
    .email('Please enter a valid account department email address'),
  accountDepartmentName: z
    .string()
    .min(2, 'Please enter a valid account department name'),
  regions: z.array(z.string()).min(1, 'Please select at least one region'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  registeredCapital: z
    .string()
    .min(2, 'Registered capital must be at least 2 characters')
})

export type CompanyFormValues = z.infer<typeof companySchema>

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>
  onSubmit: (data: CompanyFormValues) => void
  isSubmitting: boolean
}

export function CompanyForm({
  defaultValues,
  onSubmit,
  isSubmitting
}: CompanyFormProps) {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: defaultValues || {
      companyName: '',
      // companyIdNo: '',
      // companyAbbreviation: '',
      accountDepartmentPerson: '',
      legalPerson: '',
      industry: '',
      accountDepartmentEmail: '',
      accountDepartmentName: '',
      email: '',
      phone: '',
      vatNumber: '',
      businessLicenseNumber: '',
      regions: [],
      address: '',
      registeredCapital: ''
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Company Information</h3>
          <p className='text-sm text-gray-500'>
            Basic information about the company
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='companyName'>Company Name</Label>
            <Input
              id='companyName'
              {...register('companyName')}
              className={errors.companyName ? 'border-red-500' : ''}
            />
            {errors.companyName && (
              <p className='text-sm text-red-500'>
                {errors.companyName.message}
              </p>
            )}
          </div>

          {/* <div className='space-y-2'>
            <Label htmlFor='companyIdNo'>Company ID Number</Label>
            <Input
              id='companyIdNo'
              {...register('companyIdNo')}
              className={errors.companyIdNo ? 'border-red-500' : ''}
            />
            {errors.companyIdNo && (
              <p className='text-sm text-red-500'>
                {errors.companyIdNo.message}
              </p>
            )}
          </div> */}

          {/* <div className='space-y-2'>
            <Label htmlFor='companyAbbreviation'>Company Abbreviation</Label>
            <Input
              id='companyAbbreviation'
              {...register('companyAbbreviation')}
              className={errors.companyAbbreviation ? 'border-red-500' : ''}
            />
            {errors.companyAbbreviation && (
              <p className='text-sm text-red-500'>
                {errors.companyAbbreviation.message}
              </p>
            )}
          </div> */}
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Contact Information</h3>
          <p className='text-sm text-gray-500'>
            Contact details for the company
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='legalPerson'>Legal Person/Representative</Label>
            <Input
              id='legalPerson'
              {...register('legalPerson')}
              className={errors.legalPerson ? 'border-red-500' : ''}
            />
            {errors.legalPerson && (
              <p className='text-sm text-red-500'>
                {errors.legalPerson.message}
              </p>
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

          <div className='space-y-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input
              id='phone'
              {...register('phone')}
              className={errors.phone ? 'border-red-500' : ''}
            />
            {errors.phone && (
              <p className='text-sm text-red-500'>{errors.phone.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='accountDepartmentPerson'>
              Account Department Person
            </Label>
            <Input
              id='accountDepartmentPerson'
              {...register('accountDepartmentPerson')}
              className={errors.accountDepartmentPerson ? 'border-red-500' : ''}
            />
            {errors.accountDepartmentPerson && (
              <p className='text-sm text-red-500'>
                {errors.accountDepartmentPerson.message}
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
              {...register('accountDepartmentEmail')}
              className={errors.accountDepartmentEmail ? 'border-red-500' : ''}
            />
            {errors.accountDepartmentEmail && (
              <p className='text-sm text-red-500'>
                {errors.accountDepartmentEmail.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='accountDepartmentName'>
              Account Department Name
            </Label>
            <Input
              id='accountDepartmentName'
              {...register('accountDepartmentName')}
              className={errors.accountDepartmentName ? 'border-red-500' : ''}
            />
            {errors.accountDepartmentName && (
              <p className='text-sm text-red-500'>
                {errors.accountDepartmentName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Business Information</h3>
          <p className='text-sm text-gray-500'>
            Business details for the company
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2'>
            <Label htmlFor='vatNumber'>VAT Number (Optional)</Label>
            <Input
              id='vatNumber'
              {...register('vatNumber')}
              className={errors.vatNumber ? 'border-red-500' : ''}
            />
            {errors.vatNumber && (
              <p className='text-sm text-red-500'>{errors.vatNumber.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='businessLicenseNumber'>
              Business License Number
            </Label>
            <Input
              id='businessLicenseNumber'
              {...register('businessLicenseNumber')}
              className={errors.businessLicenseNumber ? 'border-red-500' : ''}
            />
            {errors.businessLicenseNumber && (
              <p className='text-sm text-red-500'>
                {errors.businessLicenseNumber.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='industry'>Industry</Label>
            <Input
              id='industry'
              {...register('industry')}
              className={errors.industry ? 'border-red-500' : ''}
            />
            {errors.industry && (
              <p className='text-sm text-red-500'>{errors.industry.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='regions'>Regions</Label>
            <Controller
              name='regions'
              control={control}
              render={({ field }) => (
                <MultiSelect
                  id='company-region'
                  options={PROVINCES}
                  value={field.value.map((value) => ({
                    label:
                      PROVINCES.find((p) => p.value === value)?.label || value,
                    value
                  }))}
                  onChange={(selected) =>
                    field.onChange(selected.map((item) => item.value))
                  }
                  className={errors.regions ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.regions && (
              <p className='text-sm text-red-500'>{errors.regions.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-medium'>Address Information</h3>
          <p className='text-sm text-gray-500'>
            Physical address of the company
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
          <div className='space-y-2 sm:col-span-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              rows={3}
              {...register('address')}
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className='text-sm text-red-500'>{errors.address.message}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='registeredCapital'>Registered Capital</Label>
            <Input
              id='registeredCapital'
              {...register('registeredCapital')}
              className={errors.registeredCapital ? 'border-red-500' : ''}
            />
            {errors.registeredCapital && (
              <p className='text-sm text-red-500'>
                {errors.registeredCapital.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          onClick={() => navigate('/companies')}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          className='bg-primary hover:bg-primary/90'
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Company'}
        </Button>
      </div>
    </form>
  )
}
