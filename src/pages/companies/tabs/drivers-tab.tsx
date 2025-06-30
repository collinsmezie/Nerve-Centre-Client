import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  Building2
} from 'lucide-react'
import {
  fetchDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
  reassignDriver,
  getDriverLicenseCodes,
  getVehicleRestrictions,
  getDriverRestrictions,
  getIssuingAuthorities,
  getUploadUrl,
  uploadImage,
  updateLicenseUrls
} from '@/api/drivers'
import { fetchCompanies, fetchCompany } from '@/api/companies'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import type { Driver } from '@/types/driver'
import { Checkbox } from '@/components/ui/checkbox'
import { AutoComplete } from '@/components/ui/autocomplete'
import { MultiSelect } from '@/components/ui/multi-select'
import { PROVINCES } from '@/lib/constants'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { ImageUpload } from '@/components/ui/image-upload'
import { format } from 'date-fns'

const defaultValues = {
  firstName: '',
  lastName: '',
  photoUrl: '',
  gender: undefined,
  address: '',
  phoneNumber: '',
  whatsappNumber: '',
  nationality: undefined,
  email: '',
  idNumber: '',
  dateOfBirth: '',
  licenseNumber: '',
  licenseValidFrom: undefined,
  licenseValidTo: undefined,
  licenseCode: [],
  issuingAuthority: '',
  vehicleRestrictions: undefined,
  driverRestrictions: undefined,
  licenseFrontUrl: '',
  licenseBackUrl: '',
  prDpCategories: {
    goods: false,
    passengers: false,
    dangerousGoods: false
  },
  prDpExpiryDate: undefined,
  region: undefined
}

const driverSchema = z.object({
  // Basic information
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  photoUrl: z.string().optional(),
  gender: z.enum(['male', 'female', 'other']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  nationality: z.string().min(1, 'Nationality is required'),
  email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  whatsappNumber: z
    .string()
    .min(10, 'Please enter a valid WhatsApp number')
    .optional()
    .or(z.literal('')),
  idNumber: z.string().min(6, 'ID number must be at least 6 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  region: z.string().min(1, 'Please select a region'),

  // License details
  licenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters'),
  licenseValidFrom: z.string().min(1, 'Valid from date is required'),
  licenseValidTo: z.string().min(1, 'Valid to date is required'),
  licenseCode: z
    .array(z.string())
    .min(1, 'At least one license code is required'),
  issuingAuthority: z.string().min(1, 'Issuing authority is required'),
  vehicleRestrictions: z.number().optional(),
  driverRestrictions: z.number().optional(),
  licenseFrontUrl: z.string().min(1, 'License front image is required'),
  licenseBackUrl: z.string().min(1, 'License back image is required'),

  // PrDP details
  prDpCategories: z.object({
    goods: z.boolean(),
    passengers: z.boolean(),
    dangerousGoods: z.boolean()
  }),
  prDpExpiryDate: z.string().optional()
})

type DriverFormValues = z.infer<typeof driverSchema>

// Add reassign form schema
const reassignSchema = z.object({
  companyId: z.string().min(1, 'Please select a company')
})

type ReassignFormValues = z.infer<typeof reassignSchema>

interface DriversTabProps {
  companyId: string
}

// Add type for region
interface RegionOption {
  label: string
  value: string
}

export function DriversTab({ companyId }: DriversTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<{
    url: string
    title: string
  } | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [driverToReassign, setDriverToReassign] = useState<Driver | null>(null)
  const [sameAsPhone, setSameAsPhone] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isAdmin } = useAuth()
  const [licenseFrontFile, setLicenseFrontFile] = useState<File | null>(null)
  const [licenseBackFile, setLicenseBackFile] = useState<File | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    data: drivers,
    isLoading,
    error
  } = useQuery({
    queryKey: ['drivers', companyId],
    queryFn: () => fetchDrivers(companyId),
    enabled: !!companyId
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    enabled: isAdmin
  })

  const {
    data: currentCompany,
    isLoading: isCompanyLoading,
    error: companyError
  } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId
  })

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues
  })

  const reassignForm = useForm<ReassignFormValues>({
    resolver: zodResolver(reassignSchema),
    defaultValues: {
      companyId: ''
    }
  })

  const { watch, setValue } = form
  const phoneNumber = watch('phoneNumber')

  const createMutation = useMutation({
    mutationFn: (data: DriverFormValues) => createDriver(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', companyId] })
      toast({
        title: 'Driver created',
        description: 'The driver has been created successfully.',
        variant: 'success'
      })
      setIsDialogOpen(false)
      form.reset(defaultValues)
      setSameAsPhone(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create driver. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: DriverFormValues) =>
      updateDriver(editingDriver?._id || '', data),
    onSuccess: (updatedDriver) => {
      queryClient.invalidateQueries({ queryKey: ['drivers', companyId] })
      if (selectedDriver?._id === updatedDriver._id) {
        setSelectedDriver(updatedDriver)
      }
      toast({
        title: 'Driver updated',
        description: 'The driver has been updated successfully.',
        variant: 'success'
      })
      setIsDialogOpen(false)
      setEditingDriver(null)
      form.reset(defaultValues)
      setSameAsPhone(false)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update driver. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (driverId: string) => deleteDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers', companyId] })
      toast({
        title: 'Driver deleted',
        description: 'The driver has been deleted successfully.',
        variant: 'success'
      })
      if (selectedDriver) {
        setSelectedDriver(null)
        setViewMode('list')
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete driver. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const reassignMutation = useMutation({
    mutationFn: (data: { driverId: string; newCompanyId: string }) =>
      reassignDriver(data.driverId, data.newCompanyId),
    onSuccess: (updatedDriver) => {
      queryClient.invalidateQueries({ queryKey: ['drivers', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['drivers', updatedDriver.companyId]
      })
      toast({
        title: 'Driver reassigned',
        description: 'The driver has been reassigned successfully.',
        variant: 'success'
      })
      setIsReassignDialogOpen(false)
      setDriverToReassign(null)
      setSelectedDriver(null)
      setViewMode('list')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reassign driver. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = async (data: DriverFormValues) => {
    try {
      setLoading(true)
      let driverId = editingDriver?._id
      let licenseFrontUrl = ''
      let licenseBackUrl = ''
      let photoUrl = ''

      // If creating a new driver, create it first to get the ID
      if (!driverId) {
        const newDriver = await createMutation.mutateAsync(data)
        driverId = newDriver._id
      }

      // Upload photo if file is selected
      if (photoFile && driverId) {
        const { uploadUrl, fileUrl } = await getUploadUrl(driverId, 'id-photo')
        photoUrl = await uploadImage(uploadUrl, photoFile, fileUrl)
        // Update the driver with the new photo URL
        await updateDriver(driverId, { photoUrl })
      }

      // Upload license images if files are selected
      if (licenseFrontFile && driverId) {
        const { uploadUrl, fileUrl } = await getUploadUrl(
          driverId,
          'license-front'
        )
        licenseFrontUrl = await uploadImage(
          uploadUrl,
          licenseFrontFile,
          fileUrl
        )
        await updateLicenseUrls({ driverId, licenseFrontUrl })
      }

      if (licenseBackFile && driverId) {
        const { uploadUrl, fileUrl } = await getUploadUrl(
          driverId,
          'license-back'
        )
        licenseBackUrl = await uploadImage(uploadUrl, licenseBackFile, fileUrl)
        await updateLicenseUrls({ driverId, licenseBackUrl })
      }
      // If editing, update the driver
      if (editingDriver) {
        const tempData = { ...data }
        if (photoUrl) {
          tempData.photoUrl = photoUrl
        }
        if (licenseFrontUrl) {
          tempData.licenseFrontUrl = licenseFrontUrl
        }
        if (licenseBackUrl) {
          tempData.licenseBackUrl = licenseBackUrl
        }
        await updateMutation.mutateAsync(tempData)
      }

      // Reset form and state
      setIsDialogOpen(false)
      setEditingDriver(null)
      form.reset(defaultValues)
      setSameAsPhone(false)
      setLicenseFrontFile(null)
      setLicenseBackFile(null)
      setPhotoFile(null)
      setLoading(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save driver. Please try again.',
        variant: 'destructive'
      })
      setLoading(false)
    }
  }

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver)
    setSameAsPhone(driver.whatsappNumber === driver.phoneNumber)
    form.reset({
      firstName: driver.firstName,
      lastName: driver.lastName,
      photoUrl: driver.photoUrl || '',
      gender: driver.gender,
      address: driver.address || '',
      nationality: driver.nationality,
      email: driver.email || '',
      phoneNumber: driver.phoneNumber,
      whatsappNumber: driver.whatsappNumber || '',
      idNumber: driver.idNumber,
      dateOfBirth: format(new Date(driver.dateOfBirth), 'yyyy-MM-dd'),
      licenseNumber: driver.licenseNumber,
      licenseValidFrom: format(new Date(driver.licenseValidFrom), 'yyyy-MM-dd'),
      licenseValidTo: format(new Date(driver.licenseValidTo), 'yyyy-MM-dd'),
      licenseCode: driver.licenseCode,
      issuingAuthority: driver.issuingAuthority,
      vehicleRestrictions: driver.vehicleRestrictions || undefined,
      driverRestrictions: driver.driverRestrictions || undefined,
      licenseFrontUrl: driver.licenseFrontUrl || '',
      licenseBackUrl: driver.licenseBackUrl || '',
      prDpCategories: driver.prDpCategories,
      prDpExpiryDate: driver.prDpExpiryDate
        ? format(new Date(driver.prDpExpiryDate), 'yyyy-MM-dd')
        : undefined,
      region: driver.region || ''
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (driverId: string) => {
    setDriverToDelete(driverId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (driverToDelete) {
      deleteMutation.mutate(driverToDelete)
      setIsDeleteDialogOpen(false)
      setDriverToDelete(null)
    }
  }

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setSelectedDriver(null)
    setViewMode('list')
  }

  const handleSameAsPhoneChange = (checked: boolean) => {
    setSameAsPhone(checked)
    if (checked) {
      setValue('whatsappNumber', phoneNumber)
    } else {
      setValue('whatsappNumber', '')
    }
  }

  const handleReassign = (driver: Driver) => {
    setDriverToReassign(driver)
    reassignForm.reset({ companyId: driver.companyId })
    setIsReassignDialogOpen(true)
  }

  const handleReassignSubmit = (newCompanyId: string) => {
    if (driverToReassign) {
      reassignMutation.mutate({
        driverId: driverToReassign._id,
        newCompanyId
      })
    }
  }

  const handleImagePreview = (url: string | undefined, title: string) => {
    if (url) {
      setPreviewImage({ url, title })
      setIsImagePreviewOpen(true)
    }
  }

  const filteredDrivers = drivers?.filter(
    (driver) =>
      driver.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.idNumber.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className='space-y-6'>
      {viewMode === 'list' ? (
        <>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h2 className='text-xl font-semibold'>Drivers</h2>
              <p className='text-sm text-gray-500'>
                Manage drivers for this company
              </p>
            </div>
            <Button
              onClick={() => {
                setEditingDriver(null)
                form.reset(defaultValues)
                setSameAsPhone(false)
                setIsDialogOpen(true)
              }}
              className='bg-primary hover:bg-primary/90'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Driver
            </Button>
          </div>

          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search by name or ID...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-full' />
                </div>
              ))}
            </div>
          ) : error || companyError ? (
            <div className='rounded-md bg-red-50 p-4'>
              <div className='flex'>
                <div className='text-sm text-red-700'>
                  Error loading drivers. Please try again later.
                </div>
              </div>
            </div>
          ) : filteredDrivers?.length === 0 ? (
            <div className='text-center py-12 border rounded-md'>
              <p className='text-gray-500'>No drivers found</p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>ID Number</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>License Expiry</TableHead>
                    <TableHead className='w-[80px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDrivers?.map((driver) => (
                    <TableRow
                      key={driver._id}
                      className='cursor-pointer hover:bg-gray-50'
                      onClick={() => handleViewDriver(driver)}
                    >
                      <TableCell>
                        <Avatar className='h-8 w-8'>
                          {driver.photoUrl ? (
                            <AvatarImage
                              src={driver.photoUrl || '/placeholder.svg'}
                              alt={`${driver.firstName} ${driver.lastName}`}
                            />
                          ) : null}
                          <AvatarFallback>
                            {driver.firstName[0]}
                            {driver.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className='font-medium'>
                        {driver.firstName} {driver.lastName}
                      </TableCell>
                      <TableCell>{driver.idNumber}</TableCell>
                      <TableCell>{driver.phoneNumber}</TableCell>
                      <TableCell>{driver.licenseNumber}</TableCell>
                      <TableCell>{formatDate(driver.licenseValidTo)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Button variant='ghost' className='h-8 w-8 p-0'>
                              <span className='sr-only'>Open menu</span>
                              <MoreHorizontal className='h-4 w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(driver)
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReassign(driver)
                                }}
                              >
                                <Building2 className='mr-2 h-4 w-4' />
                                Reassign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              className='text-red-600'
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDelete(driver._id)
                              }}
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : (
        selectedDriver && (
          <div className='space-y-6'>
            <div className='flex sm:flex-row flex-col sm:items-center gap-4 justify-center'>
              <div className='flex items-center gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleBackToList}
                  className='h-8 w-8 p-0'
                >
                  <ChevronLeft className='h-4 w-4' />
                  <span className='sr-only'>Back</span>
                </Button>
                <div className='flex items-center gap-2'>
                  <Avatar
                    className='h-16 w-16 cursor-pointer hover:opacity-90 transition-opacity'
                    onClick={() =>
                      selectedDriver.photoUrl &&
                      handleImagePreview(
                        selectedDriver.photoUrl,
                        'Profile Photo'
                      )
                    }
                  >
                    {selectedDriver.photoUrl ? (
                      <AvatarImage
                        src={selectedDriver.photoUrl || '/placeholder.svg'}
                        alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                      />
                    ) : null}
                    <AvatarFallback className='text-lg'>
                      {selectedDriver.firstName[0]}
                      {selectedDriver.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className='text-xl font-semibold'>
                    {selectedDriver.firstName} {selectedDriver.lastName}
                  </h2>
                </div>
              </div>
              <div className='sm:ml-auto sm:flex grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  onClick={() => handleEdit(selectedDriver)}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant='outline'
                    onClick={() => handleReassign(selectedDriver)}
                  >
                    <Building2 className='mr-2 h-4 w-4' />
                    Reassign
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='text-red-600 hover:text-red-700'
                  onClick={() => handleDelete(selectedDriver._id)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Basic Information</h3>
                <div className='flex items-center gap-4 mb-4'>
                  <Avatar className='h-16 w-16'>
                    {selectedDriver.photoUrl ? (
                      <AvatarImage
                        className='cursor-pointer hover:opacity-90 transition-opacity'
                        src={selectedDriver.photoUrl || '/placeholder.svg'}
                        alt={`${selectedDriver.firstName} ${selectedDriver.lastName}`}
                        onClick={() =>
                          selectedDriver.photoUrl &&
                          handleImagePreview(
                            selectedDriver.photoUrl,
                            'Profile Photo'
                          )
                        }
                      />
                    ) : null}
                    <AvatarFallback className='text-lg'>
                      {selectedDriver.firstName[0]}
                      {selectedDriver.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className='font-medium'>
                      {selectedDriver.firstName} {selectedDriver.lastName}
                    </h4>
                    <p className='text-sm text-gray-500'>
                      Driver ID: {selectedDriver.driverNumber}
                    </p>
                  </div>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Gender</p>
                    <p className='font-medium'>
                      {selectedDriver.gender.charAt(0).toUpperCase() +
                        selectedDriver.gender.slice(1)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Nationality</p>
                    <p className='font-medium'>{selectedDriver.nationality}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>ID Number</p>
                    <p className='font-medium'>{selectedDriver.idNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Date of Birth</p>
                    <p className='font-medium'>
                      {formatDate(selectedDriver.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Phone Number</p>
                    <p className='font-medium'>{selectedDriver.phoneNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Assigned Company</p>
                    <p className='font-medium'>
                      {selectedDriver.company?.companyName}
                    </p>
                  </div>
                  {selectedDriver.whatsappNumber && (
                    <div>
                      <p className='text-sm text-gray-500'>WhatsApp Number</p>
                      <p className='font-medium'>
                        {selectedDriver.whatsappNumber}
                      </p>
                    </div>
                  )}
                  {selectedDriver.email && (
                    <div>
                      <p className='text-sm text-gray-500'>Email</p>
                      <p className='font-medium'>{selectedDriver.email}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>License Details</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>License Number</p>
                    <p className='font-medium'>
                      {selectedDriver.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>License Code</p>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {selectedDriver.licenseCode.map((code) => {
                        const licenseCode = getDriverLicenseCodes().find(
                          (p) => p.value === code
                        )
                        return (
                          <span
                            key={code}
                            className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'
                          >
                            {licenseCode?.label || code}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Valid From</p>
                    <p className='font-medium'>
                      {formatDate(selectedDriver.licenseValidFrom)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Valid To</p>
                    <p className='font-medium'>
                      {formatDate(selectedDriver.licenseValidTo)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Issuing Authority</p>
                    <p className='font-medium'>
                      {getIssuingAuthorities().find(
                        (p) => p.value === selectedDriver.issuingAuthority
                      )?.label || null}
                    </p>
                  </div>
                  {selectedDriver.vehicleRestrictions ? (
                    <div>
                      <p className='text-sm text-gray-500'>
                        Vehicle Restrictions
                      </p>
                      <p className='font-medium'>
                        {getVehicleRestrictions().find(
                          (p) => p.value === selectedDriver.vehicleRestrictions
                        )?.label || null}
                      </p>
                    </div>
                  ) : null}
                  {selectedDriver.driverRestrictions ? (
                    <div>
                      <p className='text-sm text-gray-500'>
                        Driver Restrictions
                      </p>
                      <p className='font-medium'>
                        {getDriverRestrictions().find(
                          (p) => p.value === selectedDriver.driverRestrictions
                        )?.label || null}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>PrDP Details</h3>
                <div>
                  <p className='text-sm text-gray-500'>PrDP Categories</p>
                  <div className='flex gap-2 mt-1'>
                    {selectedDriver.prDpCategories.goods && (
                      <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'>
                        Goods
                      </span>
                    )}
                    {selectedDriver.prDpCategories.passengers && (
                      <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
                        Passengers
                      </span>
                    )}
                    {selectedDriver.prDpCategories.dangerousGoods && (
                      <span className='inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700'>
                        Dangerous Goods
                      </span>
                    )}
                  </div>
                </div>
                {selectedDriver.prDpExpiryDate ? (
                  <div>
                    <p className='text-sm text-gray-500'>PrDP Expiry Date</p>
                    <p className='font-medium'>
                      {formatDate(selectedDriver.prDpExpiryDate)}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Driver Address & Region</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Address</p>
                    <p className='font-medium'>{selectedDriver.address}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Region</p>
                    <p className='font-medium'>
                      {PROVINCES.find((p) => p.value === selectedDriver.region)
                        ?.label || selectedDriver.region}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>License Images</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {selectedDriver.licenseFrontUrl ? (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-500'>License Front</p>
                      <div
                        className='relative aspect-[16/9] w-full cursor-pointer hover:opacity-90 transition-opacity'
                        onClick={() =>
                          handleImagePreview(
                            selectedDriver.licenseFrontUrl,
                            'License Front'
                          )
                        }
                      >
                        <img
                          src={selectedDriver.licenseFrontUrl}
                          alt='License Front'
                          className='object-contain rounded-md w-full h-full border'
                        />
                      </div>
                    </div>
                  ) : null}
                  {selectedDriver.licenseBackUrl ? (
                    <div className='space-y-2'>
                      <p className='text-sm text-gray-500'>License Back</p>
                      <div
                        className='relative aspect-[16/9] w-full cursor-pointer hover:opacity-90 transition-opacity'
                        onClick={() =>
                          handleImagePreview(
                            selectedDriver.licenseBackUrl,
                            'License Back'
                          )
                        }
                      >
                        <img
                          src={selectedDriver.licenseBackUrl}
                          alt='License Back'
                          className='object-contain rounded-md w-full h-full border'
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Image Preview Dialog */}
      <Dialog open={isImagePreviewOpen} onOpenChange={setIsImagePreviewOpen}>
        <DialogContent className='sm:max-w-[800px]'>
          <DialogHeader>
            <DialogTitle>{previewImage?.title}</DialogTitle>
          </DialogHeader>
          <div className='relative aspect-[16/9] w-full'>
            <img
              src={previewImage?.url}
              alt={previewImage?.title}
              className='object-contain rounded-md w-full h-full'
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              driver.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Driver Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingDriver ? 'Edit Driver' : 'Add New Driver'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue='basic' className='w-full'>
              <div className='relative rounded-sm overflow-x-scroll h-10 bg-muted'>
                <TabsList className='absolute flex flex-row justify-stretch w-full'>
                  <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                  <TabsTrigger value='license'>License Details</TabsTrigger>
                  <TabsTrigger value='prdp'>PrDP Details</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='basic' className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input
                      id='firstName'
                      {...form.register('firstName')}
                      className={
                        form.formState.errors.firstName ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.firstName && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input
                      id='lastName'
                      {...form.register('lastName')}
                      className={
                        form.formState.errors.lastName ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.lastName && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='gender'>Gender</Label>
                    <Controller
                      name='gender'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='gender'
                          options={[
                            { label: 'Male', value: 'male' },
                            { label: 'Female', value: 'female' },
                            { label: 'Other', value: 'other' }
                          ]}
                          placeholder='Select gender'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.gender}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='nationality'>Nationality</Label>
                    <Controller
                      name='nationality'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='nationality'
                          options={[
                            { label: 'South African', value: 'south-african' },
                            { label: 'Other', value: 'other' }
                          ]}
                          placeholder='Select nationality'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.nationality}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='idNumber'>ID Number</Label>
                    <Input
                      id='idNumber'
                      {...form.register('idNumber')}
                      className={
                        form.formState.errors.idNumber ? 'border-red-500' : ''
                      }
                    />
                    {form.formState.errors.idNumber && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.idNumber.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='dateOfBirth'>Date of Birth</Label>
                    <Input
                      id='dateOfBirth'
                      type='date'
                      {...form.register('dateOfBirth')}
                      className={
                        form.formState.errors.dateOfBirth
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.dateOfBirth && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.dateOfBirth.message}
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
                    <Label htmlFor='phoneNumber'>Phone Number</Label>
                    <Input
                      id='phoneNumber'
                      {...form.register('phoneNumber')}
                      className={
                        form.formState.errors.phoneNumber
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.phoneNumber && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center justify-between mt-2'>
                      <Label htmlFor='whatsappNumber'>WhatsApp Number</Label>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='sameAsPhone'
                          checked={sameAsPhone}
                          onCheckedChange={handleSameAsPhoneChange}
                        />
                        <label
                          htmlFor='sameAsPhone'
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          Same as phone
                        </label>
                      </div>
                    </div>
                    <Input
                      id='whatsappNumber'
                      {...form.register('whatsappNumber')}
                      disabled={sameAsPhone}
                      className={
                        form.formState.errors.whatsappNumber
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.whatsappNumber && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.whatsappNumber.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='region'>Region</Label>
                    <Controller
                      name='region'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='region'
                          disabled={!currentCompany || isCompanyLoading}
                          options={
                            currentCompany && currentCompany.regions.length
                              ? currentCompany.regions.map(
                                  (regionValue: string) => {
                                    // Find the corresponding province object
                                    const province = PROVINCES.find(
                                      (province) =>
                                        province.value === regionValue
                                    )
                                    // Return the province if found, otherwise use the raw value
                                    return province
                                      ? { ...province, value: regionValue }
                                      : {
                                          label: regionValue,
                                          value: regionValue
                                        }
                                  }
                                )
                              : []
                          }
                          placeholder='Select region'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.region}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2 sm:col-span-2'>
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

                  <div className='space-y-2 sm:col-span-2'>
                    <Label>Photo</Label>
                    <ImageUpload
                      type='photo'
                      imageUrl={form.watch('photoUrl')}
                      onImageSelect={(file: File) => {
                        setPhotoFile(file)
                        const blobUrl = URL.createObjectURL(file)
                        form.setValue('photoUrl', blobUrl)
                      }}
                      onImageClear={() => {
                        if (photoFile) {
                          URL.revokeObjectURL(form.getValues('photoUrl') || '')
                        }
                        setPhotoFile(null)
                        form.setValue('photoUrl', '')
                      }}
                      error={form.formState.errors.photoUrl?.message}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='license' className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='licenseNumber'>License Number</Label>
                    <Input
                      id='licenseNumber'
                      {...form.register('licenseNumber')}
                      className={
                        form.formState.errors.licenseNumber
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.licenseNumber && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.licenseNumber.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='licenseCode'>License Code</Label>
                    <Controller
                      name='licenseCode'
                      control={form.control}
                      render={({ field }) => (
                        <MultiSelect
                          id='driver-licenseCode'
                          options={getDriverLicenseCodes()}
                          placeholder='Select license codes'
                          value={field.value.map((value) => {
                            const option = getDriverLicenseCodes().find(
                              (opt) => opt.value === value
                            )
                            return option || { label: value, value }
                          })}
                          onChange={(selected) => {
                            field.onChange(
                              selected.map((option) => option.value)
                            )
                          }}
                        />
                      )}
                    />
                    {form.formState.errors.licenseCode && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.licenseCode.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='licenseValidFrom'>Valid From</Label>
                    <Input
                      id='licenseValidFrom'
                      type='date'
                      {...form.register('licenseValidFrom')}
                      className={
                        form.formState.errors.licenseValidFrom
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.licenseValidFrom && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.licenseValidFrom.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='licenseValidTo'>Valid To</Label>
                    <Input
                      id='licenseValidTo'
                      type='date'
                      {...form.register('licenseValidTo')}
                      className={
                        form.formState.errors.licenseValidTo
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.licenseValidTo && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.licenseValidTo.message}
                      </p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='issuingAuthority'>Issuing Authority</Label>
                    <Controller
                      name='issuingAuthority'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='issuingAuthority'
                          options={getIssuingAuthorities()}
                          placeholder='Select issuing authority'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.issuingAuthority}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleRestrictions'>
                      Vehicle Restrictions
                    </Label>
                    <Controller
                      name='vehicleRestrictions'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleRestrictions'
                          options={getVehicleRestrictions().map(
                            (restriction) => ({
                              label: restriction.label,
                              value: restriction.value.toString()
                            })
                          )}
                          placeholder='Select vehicle restrictions'
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          error={form.formState.errors.vehicleRestrictions}
                        />
                      )}
                    />
                  </div>
                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='driverRestrictions'>
                      Driver Restrictions
                    </Label>
                    <Controller
                      name='driverRestrictions'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='driverRestrictions'
                          options={getDriverRestrictions().map(
                            (restriction) => ({
                              label: restriction.label,
                              value: restriction.value.toString()
                            })
                          )}
                          placeholder='Select driver restrictions'
                          value={field.value?.toString()}
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          error={form.formState.errors.driverRestrictions}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label>License Front Image</Label>
                    <ImageUpload
                      type='front'
                      imageUrl={form.watch('licenseFrontUrl')}
                      onImageSelect={(file: File) => {
                        setLicenseFrontFile(file)
                        const blobUrl = URL.createObjectURL(file)
                        form.setValue('licenseFrontUrl', blobUrl)
                      }}
                      onImageClear={() => {
                        if (licenseFrontFile) {
                          URL.revokeObjectURL(
                            form.getValues('licenseFrontUrl') || ''
                          )
                        }
                        setLicenseFrontFile(null)
                        form.setValue('licenseFrontUrl', '')
                      }}
                      error={form.formState.errors.licenseFrontUrl?.message}
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label>License Back Image</Label>
                    <ImageUpload
                      type='back'
                      imageUrl={form.watch('licenseBackUrl')}
                      onImageSelect={(file: File) => {
                        setLicenseBackFile(file)
                        const blobUrl = URL.createObjectURL(file)
                        form.setValue('licenseBackUrl', blobUrl)
                      }}
                      onImageClear={() => {
                        if (licenseBackFile) {
                          URL.revokeObjectURL(
                            form.getValues('licenseBackUrl') || ''
                          )
                        }
                        setLicenseBackFile(null)
                        form.setValue('licenseBackUrl', '')
                      }}
                      error={form.formState.errors.licenseBackUrl?.message}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='prdp' className='space-y-4 mt-4'>
                <div className='space-y-4'>
                  <div>
                    <h3 className='text-sm font-medium mb-2'>
                      PrDP Categories
                    </h3>
                    <div className='space-y-4'>
                      <div className='flex items-center space-x-2'>
                        <Controller
                          name='prDpCategories.goods'
                          control={form.control}
                          render={({ field }) => (
                            <Checkbox
                              id='goods'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor='goods'>Goods</Label>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Controller
                          name='prDpCategories.passengers'
                          control={form.control}
                          render={({ field }) => (
                            <Checkbox
                              id='passengers'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor='passengers'>Passengers</Label>
                      </div>

                      <div className='flex items-center space-x-2'>
                        <Controller
                          name='prDpCategories.dangerousGoods'
                          control={form.control}
                          render={({ field }) => (
                            <Checkbox
                              id='dangerousGoods'
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          )}
                        />
                        <Label htmlFor='dangerousGoods'>Dangerous Goods</Label>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='prDpExpiryDate'>
                      PrDP Permit Expiry Date
                    </Label>
                    <Input
                      id='prDpExpiryDate'
                      type='date'
                      {...form.register('prDpExpiryDate')}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingDriver(null)
                  form.reset(defaultValues)
                  setSameAsPhone(false)
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90'
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  loading
                }
              >
                {createMutation.isPending || updateMutation.isPending || loading
                  ? 'Saving...'
                  : editingDriver
                  ? 'Update Driver'
                  : 'Add Driver'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reassign Dialog */}
      <Dialog
        open={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Driver</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p>
              Select a new company to reassign{' '}
              <span className='font-semibold'>
                {driverToReassign
                  ? `${driverToReassign.firstName} ${driverToReassign.lastName}`
                  : 'this driver'}
              </span>{' '}
              to:
            </p>
            <div className='space-y-2'>
              <Label htmlFor='companyId'>Current Company</Label>
              <p className='text-sm text-gray-500'>
                {driverToReassign?.company?.companyName}
              </p>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='companyId'>New Company</Label>
              <Controller
                name='companyId'
                control={reassignForm.control}
                render={({ field }) => (
                  <AutoComplete
                    id='companyId'
                    options={
                      companies
                        ?.filter(
                          (company) =>
                            company._id !== driverToReassign?.companyId
                        )
                        .map((company) => ({
                          label: company.companyName,
                          value: company._id
                        })) || []
                    }
                    placeholder='Select company'
                    onValueChange={field.onChange}
                    value={field.value}
                    error={reassignForm.formState.errors.companyId}
                  />
                )}
              />
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsReassignDialogOpen(false)
                  setDriverToReassign(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (driverToReassign && reassignForm.getValues('companyId')) {
                    handleReassignSubmit(reassignForm.getValues('companyId'))
                  }
                }}
                disabled={!reassignForm.getValues('companyId')}
              >
                Reassign
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
