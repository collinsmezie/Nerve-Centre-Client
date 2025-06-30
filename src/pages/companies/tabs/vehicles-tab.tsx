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
  fetchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getVehicleMakes,
  getVehicleCategories,
  getSubVehicleTypes,
  getVehicleModels,
  getVehicleSpeedLimits,
  getEngineType,
  getShowFleetOptions,
  getDrivenOptions,
  getVehicleColours,
  getSubGroupOptions,
  getCameraProviders,
  getTelematicsProviders,
  getRiskGroupOptions,
  reassignVehicle
} from '@/api/vehicles'
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import type { Vehicle } from '@/types/vehicle'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchCompany, fetchCompanies } from '@/api/companies'
import { PROVINCES } from '@/lib/constants'
import { Textarea } from '@/components/ui/textarea'
import { AutoComplete } from '@/components/ui/autocomplete'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/context/auth-context'
import { format } from 'date-fns'
import { formatDate } from '@/lib/utils'

export const getVehicleIcon = (type: string, extraClassName?: string) => {
  const className = 'h-5 w-5 text-primary ' + extraClassName
  switch (type.toLowerCase()) {
    case 'hvc':
    case 'car':
      return <Icons.car className={className} />
    case 'tractor':
      return <Icons.tractor className={className} />
    case 'forklift':
      return <Icons.forklift className={className} />
    case 'excavator':
      return <Icons.excavator className={className} />
    case 'bike':
      return <Icons.bike className={className} />
    case 'bus':
      return <Icons.bus className={className} />
    case 'delivery-van':
      return <Icons.deliveryVan className={className} />
    case 'bakkie':
      return <Icons.bakkie className={className} />
    case 'trailer':
      return <Icons.trailer className={className} />
    default:
      return <Icons.car className={className} />
  }
}

const defaultValues = {
  fleetNumber: '',
  licenseNumber: '',
  vehicleMake: undefined,
  vehicleCategory: undefined,
  vehicleModel: undefined,
  subVehicleType: undefined,
  engineNumber: '',
  vehicleYear: new Date().getFullYear(),
  vehicleColour: undefined,
  specialMarkings: '',
  vehicleMaxSpeed: undefined,
  engineType: undefined,
  dateOfPurchase: undefined,
  vehicleRegisterNumber: '',
  showFleet: undefined,
  vin: '',
  driven: undefined,
  vehicleDescription: '',
  tare: 0,
  gvm: 0,
  nvc: 0,
  regAuthority: '',
  dateOfExpiry: undefined,
  controlNumber: '',
  prDpCategories: {
    goods: false,
    passengers: false,
    dangerousGoods: false
  },
  riskGroup: undefined,
  region: undefined,
  subGroup1: undefined,
  subGroup2: undefined,
  cameraDevice: {
    exists: false,
    provider: undefined,
    deviceId: ''
  },
  telematicsDevice: {
    exists: false,
    provider: undefined,
    deviceId: ''
  },
  svrDevice: {
    exists: false,
    deviceId: '',
    caseNumber: ''
  }
}

// Mock data for dropdowns
const vehicleMakes = getVehicleMakes()

const vehicleCategories = getVehicleCategories()

const cameraProviders = getCameraProviders()

const telematicsProviders = getTelematicsProviders()

const vehicleSchema = z.object({
  // Basic information
  fleetNumber: z.string().optional(),
  licenseNumber: z
    .string()
    .min(2, 'License number must be at least 2 characters'),
  vehicleMake: z.string().min(1, 'Please select a make'),
  vehicleCategory: z.string().min(1, 'Please select a vehicle type'),
  vehicleModel: z.string().min(1, 'Please select a model'),
  subVehicleType: z.string().min(1, 'Please select a sub-vehicle type'),
  engineNumber: z.string().optional(),
  vehicleYear: z
    .number()
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the future'),
  vehicleColour: z.string().min(1, 'Please select a colour'),
  specialMarkings: z.string().optional(),
  vehicleMaxSpeed: z.number().min(1, 'Please select a maximum speed'),
  showFleet: z.enum(['fleet', 'license-number', 'combination-of-both']),
  vin: z.string().min(1, 'VIN is required'),
  driven: z.enum([
    'self-propelled',
    'trailer',
    'semi-trailer',
    'trailer-drawn-by-tractor'
  ]),

  // Additional information
  engineType: z.string().min(1, 'Please select an engine type'),
  dateOfPurchase: z.string().optional(),
  vehicleRegisterNumber: z.string().optional(),
  vehicleDescription: z.string().optional(),
  tare: z.number().optional(),
  gvm: z.number().optional(),
  nvc: z.number().optional(),
  regAuthority: z.string().optional(),
  dateOfExpiry: z.string().optional(),
  controlNumber: z.string().optional(),
  prDpCategories: z.object({
    goods: z.boolean(),
    passengers: z.boolean(),
    dangerousGoods: z.boolean()
  }),

  // Company linked information
  riskGroup: z.enum(['low', 'medium', 'high']),
  region: z.string().min(1, 'Please select a region'),
  subGroup1: z.enum(['1st-group', '2nd-group', '3rd-group']),
  subGroup2: z.enum(['1st-group', '2nd-group', '3rd-group']),

  // Devices
  cameraDevice: z.object({
    exists: z.boolean(),
    provider: z.enum(['pf', 'icar']).optional(),
    deviceId: z.string().optional()
  }),
  telematicsDevice: z.object({
    exists: z.boolean(),
    provider: z.enum(['pf', 'teltonika']).optional(),
    deviceId: z.string().optional()
  }),
  svrDevice: z.object({
    exists: z.boolean(),
    deviceId: z.string().optional(),
    caseNumber: z.string().optional()
  })
})

type VehicleFormValues = z.infer<typeof vehicleSchema>

// Add reassign form schema
const reassignSchema = z.object({
  companyId: z.string().min(1, 'Please select a company')
})

type ReassignFormValues = z.infer<typeof reassignSchema>

interface VehiclesTabProps {
  companyId: string
  companyName: string
}

export function VehiclesTab({ companyId, companyName }: VehiclesTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null)
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false)
  const [vehicleToReassign, setVehicleToReassign] = useState<Vehicle | null>(
    null
  )
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { isAdmin } = useAuth()

  const {
    data: company,
    isLoading: isCompanyLoading,
    error: companyError
  } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => fetchCompany(companyId),
    enabled: !!companyId
  })

  const {
    data: vehicles,
    isLoading,
    error
  } = useQuery({
    queryKey: ['vehicles', companyId],
    queryFn: () => fetchVehicles(companyId),
    enabled: !!companyId
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies,
    enabled: isAdmin
  })

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues
  })

  const reassignForm = useForm<ReassignFormValues>({
    resolver: zodResolver(reassignSchema),
    defaultValues: {
      companyId: ''
    }
  })

  const { watch } = form

  // Watch for changes to make and vehicle type to filter models and sub-vehicle types
  const selectedMake = watch('vehicleMake')
  const selectedVehicleType = watch('vehicleCategory')
  const cameraExists = watch('cameraDevice.exists')
  const telematicsExists = watch('telematicsDevice.exists')
  const svrExists = watch('svrDevice.exists')

  const filteredSubTypes = selectedVehicleType
    ? getSubVehicleTypes(selectedVehicleType)
    : []

  const filteredVehicleSpeedLimits = selectedVehicleType
    ? selectedVehicleType === 'truck'
      ? getVehicleSpeedLimits().filter((speed) => speed.value < 120)
      : getVehicleSpeedLimits()
    : []

  // Filter models based on selected make
  const filteredModels = selectedMake ? getVehicleModels(selectedMake) : []

  const createMutation = useMutation({
    mutationFn: (data: VehicleFormValues) => createVehicle(companyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] })
      toast({
        title: 'Vehicle created',
        description: 'The vehicle has been created successfully.',
        variant: 'success'
      })
      setIsDialogOpen(false)
      form.reset(defaultValues)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create vehicle. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: VehicleFormValues) =>
      updateVehicle(editingVehicle?._id || '', data),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] })
      if (selectedVehicle?._id === updatedVehicle._id) {
        setSelectedVehicle(updatedVehicle)
      }
      toast({
        title: 'Vehicle updated',
        description: 'The vehicle has been updated successfully.',
        variant: 'success'
      })
      setIsDialogOpen(false)
      setEditingVehicle(null)
      form.reset(defaultValues)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update vehicle. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (vehicleId: string) => deleteVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] })
      toast({
        title: 'Vehicle deleted',
        description: 'The vehicle has been deleted successfully.',
        variant: 'success'
      })
      if (selectedVehicle) {
        setSelectedVehicle(null)
        setViewMode('list')
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const reassignMutation = useMutation({
    mutationFn: (data: { vehicleId: string; newCompanyId: string }) =>
      reassignVehicle(data.vehicleId, data.newCompanyId),
    onSuccess: (updatedVehicle) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] })
      queryClient.invalidateQueries({
        queryKey: ['vehicles', updatedVehicle.companyId]
      })
      toast({
        title: 'Vehicle reassigned',
        description: 'The vehicle has been reassigned successfully.',
        variant: 'success'
      })
      setIsReassignDialogOpen(false)
      setVehicleToReassign(null)
      setSelectedVehicle(null)
      setViewMode('list')
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to reassign vehicle. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleSubmit = (data: VehicleFormValues) => {
    if (editingVehicle) {
      const updateData = {
        ...data,
        fleetNumber: data.fleetNumber || ''
      }
      updateMutation.mutate(updateData)
    } else {
      createMutation.mutate(data)
    }
  }

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    form.reset({
      fleetNumber: vehicle.fleetNumber,
      licenseNumber: vehicle.licenseNumber,
      vehicleMake: vehicle.vehicleMake,
      vehicleCategory: vehicle.vehicleCategory,
      vehicleModel: vehicle.vehicleModel,
      subVehicleType: vehicle.subVehicleType,
      engineNumber: vehicle.engineNumber,
      vehicleYear: vehicle.vehicleYear,
      vehicleColour: vehicle.vehicleColour,
      specialMarkings: vehicle.specialMarkings || '',
      vehicleMaxSpeed: vehicle.vehicleMaxSpeed,
      engineType: vehicle.engineType || undefined,
      dateOfPurchase: vehicle.dateOfPurchase
        ? format(new Date(vehicle.dateOfPurchase), 'yyyy-MM-dd')
        : undefined,
      vehicleRegisterNumber: vehicle.vehicleRegisterNumber || '',
      showFleet: vehicle.showFleet || 'fleet',
      vin: vehicle.vin || '',
      driven: vehicle.driven || 'self-propelled',
      vehicleDescription: vehicle.vehicleDescription || '',
      tare: vehicle.tare || 0,
      gvm: vehicle.gvm || 0,
      nvc: vehicle.nvc || 0,
      regAuthority: vehicle.regAuthority || '',
      dateOfExpiry: vehicle.dateOfExpiry
        ? format(new Date(vehicle.dateOfExpiry), 'yyyy-MM-dd')
        : undefined,
      controlNumber: vehicle.controlNumber || '',
      prDpCategories: vehicle.prDpCategories || {
        goods: false,
        passengers: false,
        dangerousGoods: false
      },
      riskGroup: vehicle.riskGroup,
      region: vehicle.region || undefined,
      subGroup1: vehicle.subGroup1 || undefined,
      subGroup2: vehicle.subGroup2 || undefined,
      cameraDevice: vehicle.cameraDevice || {
        exists: false
      },
      telematicsDevice: vehicle.telematicsDevice || {
        exists: false
      },
      svrDevice: vehicle.svrDevice || {
        exists: false
      }
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (vehicleId: string) => {
    setVehicleToDelete(vehicleId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteMutation.mutate(vehicleToDelete)
      setIsDeleteDialogOpen(false)
      setVehicleToDelete(null)
    }
  }

  const openDialog = () => {
    setEditingVehicle(null)
    form.reset(defaultValues)
    setIsDialogOpen(true)
  }

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setSelectedVehicle(null)
    setViewMode('list')
  }

  const filteredVehicles = vehicles?.filter(
    (vehicle) =>
      vehicle.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.fleetNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleReassign = (vehicle: Vehicle) => {
    setVehicleToReassign(vehicle)
    reassignForm.reset({ companyId: vehicle.companyId })
    setIsReassignDialogOpen(true)
  }

  const handleReassignSubmit = (newCompanyId: string) => {
    if (vehicleToReassign) {
      reassignMutation.mutate({
        vehicleId: vehicleToReassign._id,
        newCompanyId
      })
    }
  }

  return (
    <div className='space-y-6'>
      {viewMode === 'list' ? (
        <>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
            <div>
              <h2 className='text-xl font-semibold'>Vehicles</h2>
              <p className='text-sm text-gray-500'>
                Manage vehicles for this company
              </p>
            </div>
            <Button
              onClick={openDialog}
              className='bg-primary hover:bg-primary/90'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Vehicle
            </Button>
          </div>

          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search by license or fleet number...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading || isCompanyLoading ? (
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
                  Error loading vehicles. Please try again later.
                </div>
              </div>
            </div>
          ) : filteredVehicles?.length === 0 ? (
            <div className='text-center py-12 border rounded-md'>
              <p className='text-gray-500'>No vehicles found</p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-10'></TableHead>
                    <TableHead>License Number</TableHead>
                    <TableHead>Fleet Number</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Risk Group</TableHead>
                    <TableHead className='w-[80px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles?.map((vehicle) => (
                    <TableRow
                      key={vehicle._id}
                      className='cursor-pointer hover:bg-gray-50'
                      onClick={() => handleViewVehicle(vehicle)}
                    >
                      <TableCell>
                        {getVehicleIcon(vehicle.vehicleCategory)}
                      </TableCell>
                      <TableCell>{vehicle.licenseNumber}</TableCell>
                      <TableCell>{vehicle.fleetNumber}</TableCell>
                      <TableCell>
                        {getVehicleMakes().find(
                          (p) => p.value === vehicle.vehicleMake
                        )?.label || null}
                        {' / '}
                        {getVehicleModels(vehicle.vehicleMake).find(
                          (p) => p.value === vehicle.vehicleModel
                        )?.label || null}
                      </TableCell>
                      <TableCell>{vehicle.vehicleYear}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            vehicle.riskGroup === 'low'
                              ? 'bg-green-100 text-green-800'
                              : vehicle.riskGroup === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {vehicle.riskGroup.charAt(0).toUpperCase() +
                            vehicle.riskGroup.slice(1)}
                        </span>
                      </TableCell>
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
                                handleEdit(vehicle)
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReassign(vehicle)
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
                                handleDelete(vehicle._id)
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
        selectedVehicle && (
          <div className='space-y-6'>
            <div className='flex sm:flex-row flex-col sm:items-center justify-center gap-2'>
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
                  {getVehicleIcon(selectedVehicle.vehicleCategory)}
                  <h2 className='text-xl font-semibold'>
                    {selectedVehicle.licenseNumber}
                  </h2>
                </div>
              </div>
              <div className='sm:ml-auto sm:flex grid grid-cols-2 gap-2'>
                <Button
                  variant='outline'
                  onClick={() => handleEdit(selectedVehicle)}
                >
                  <Edit className='mr-2 h-4 w-4' />
                  Edit
                </Button>
                {isAdmin && (
                  <Button
                    variant='outline'
                    onClick={() => handleReassign(selectedVehicle)}
                  >
                    <Building2 className='mr-2 h-4 w-4' />
                    Reassign
                  </Button>
                )}
                <Button
                  variant='outline'
                  className='text-red-600 hover:text-red-700'
                  onClick={() => handleDelete(selectedVehicle._id)}
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  Delete
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Basic Information</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Asset ID</p>
                    <p className='font-medium'>{selectedVehicle.assetId}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Asset Number</p>
                    <p className='font-medium'>{selectedVehicle.assetNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>License Number</p>
                    <p className='font-medium'>
                      {selectedVehicle.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Fleet Number</p>
                    <p className='font-medium'>{selectedVehicle.fleetNumber}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Make</p>
                    <p className='font-medium'>
                      {getVehicleMakes().find(
                        (p) => p.value === selectedVehicle.vehicleMake
                      )?.label || null}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Model</p>
                    <p className='font-medium'>
                      {getVehicleModels(selectedVehicle.vehicleMake).find(
                        (p) => p.value === selectedVehicle.vehicleModel
                      )?.label || null}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Vehicle Type</p>
                    <p className='font-medium'>
                      {getVehicleCategories().find(
                        (p) => p.value === selectedVehicle.vehicleCategory
                      )?.label || null}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Sub-vehicle Type</p>
                    <p className='font-medium'>
                      {getSubVehicleTypes(selectedVehicle.vehicleCategory).find(
                        (p) => p.value === selectedVehicle.subVehicleType
                      )?.label || null}
                    </p>
                  </div>
                  {selectedVehicle.engineNumber ? (
                    <div>
                      <p className='text-sm text-gray-500'>Engine Number</p>
                      <p className='font-medium'>
                        {selectedVehicle.engineNumber}
                      </p>
                    </div>
                  ) : null}
                  <div>
                    <p className='text-sm text-gray-500'>Year</p>
                    <p className='font-medium'>{selectedVehicle.vehicleYear}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Vehicle Colour</p>
                    <p className='font-medium'>
                      {getVehicleColours().find(
                        (p) => p.value === selectedVehicle.vehicleColour
                      )?.label || null}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Max Speed</p>
                    <p className='font-medium'>
                      {selectedVehicle.vehicleMaxSpeed} km/h
                    </p>
                  </div>
                </div>
                {selectedVehicle.specialMarkings && (
                  <div>
                    <p className='text-sm text-gray-500'>Special Markings</p>
                    <p className='font-medium'>
                      {selectedVehicle.specialMarkings}
                    </p>
                  </div>
                )}
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Additional Information</h3>
                <div className='grid grid-cols-2 gap-4'>
                  {selectedVehicle.engineType && (
                    <div>
                      <p className='text-sm text-gray-500'>Engine Type</p>
                      <p className='font-medium'>
                        {getEngineType().find(
                          (p) => p.value === selectedVehicle.engineType
                        )?.label || null}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.dateOfPurchase && (
                    <div>
                      <p className='text-sm text-gray-500'>Date of Purchase</p>
                      <p className='font-medium'>
                        {formatDate(selectedVehicle.dateOfPurchase)}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.vehicleRegisterNumber && (
                    <div>
                      <p className='text-sm text-gray-500'>
                        Vehicle Register Number
                      </p>
                      <p className='font-medium'>
                        {selectedVehicle.vehicleRegisterNumber}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.showFleet && (
                    <div>
                      <p className='text-sm text-gray-500'>
                        Show Fleet/License/Combo
                      </p>
                      <p className='font-medium'>
                        {getShowFleetOptions().find(
                          (p) => p.value === selectedVehicle.showFleet
                        )?.label || null}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.vin && (
                    <div>
                      <p className='text-sm text-gray-500'>VIN</p>
                      <p className='font-medium'>{selectedVehicle.vin}</p>
                    </div>
                  )}
                  {selectedVehicle.driven && (
                    <div>
                      <p className='text-sm text-gray-500'>Driven</p>
                      <p className='font-medium'>
                        {getDrivenOptions().find(
                          (p) => p.value === selectedVehicle.driven
                        )?.label || null}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.tare !== undefined ? (
                    <div>
                      <p className='text-sm text-gray-500'>Tare (kg)</p>
                      <p className='font-medium'>{selectedVehicle.tare} kg</p>
                    </div>
                  ) : null}
                  {selectedVehicle.gvm !== undefined ? (
                    <div>
                      <p className='text-sm text-gray-500'>GVM (kg)</p>
                      <p className='font-medium'>{selectedVehicle.gvm} kg</p>
                    </div>
                  ) : null}
                  {selectedVehicle.nvc ? (
                    <div>
                      <p className='text-sm text-gray-500'>NVC</p>
                      <p className='font-medium'>{selectedVehicle.nvc} kg</p>
                    </div>
                  ) : null}
                  {selectedVehicle.regAuthority && (
                    <div>
                      <p className='text-sm text-gray-500'>Reg Authority</p>
                      <p className='font-medium'>
                        {selectedVehicle.regAuthority}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.dateOfExpiry && (
                    <div>
                      <p className='text-sm text-gray-500'>Date of Expiry</p>
                      <p className='font-medium'>
                        {formatDate(selectedVehicle.dateOfExpiry)}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.controlNumber && (
                    <div>
                      <p className='text-sm text-gray-500'>Control Number</p>
                      <p className='font-medium'>
                        {selectedVehicle.controlNumber}
                      </p>
                    </div>
                  )}
                </div>
                {selectedVehicle.vehicleDescription && (
                  <div>
                    <p className='text-sm text-gray-500'>Vehicle Description</p>
                    <p className='font-medium'>
                      {selectedVehicle.vehicleDescription}
                    </p>
                  </div>
                )}
                {selectedVehicle.prDpCategories && (
                  <div>
                    <p className='text-sm text-gray-500'>PrDP Categories</p>
                    <div className='flex gap-2 mt-1'>
                      {selectedVehicle.prDpCategories.goods && (
                        <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'>
                          Goods
                        </span>
                      )}
                      {selectedVehicle.prDpCategories.passengers && (
                        <span className='inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700'>
                          Passengers
                        </span>
                      )}
                      {selectedVehicle.prDpCategories.dangerousGoods && (
                        <span className='inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700'>
                          Dangerous Goods
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Company Information</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Company</p>
                    <p className='font-medium'>
                      {selectedVehicle.company.companyName}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Risk Group</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        selectedVehicle.riskGroup === 'low'
                          ? 'bg-green-100 text-green-800'
                          : selectedVehicle.riskGroup === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedVehicle.riskGroup.charAt(0).toUpperCase() +
                        selectedVehicle.riskGroup.slice(1)}
                    </span>
                  </div>
                  {selectedVehicle.region && (
                    <div>
                      <p className='text-sm text-gray-500'>Region</p>
                      <p className='font-medium'>
                        {PROVINCES.find(
                          (p) => p.value === selectedVehicle.region
                        )?.label || null}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.subGroup1 && (
                    <div>
                      <p className='text-sm text-gray-500'>Sub Group 1</p>
                      <p className='font-medium'>
                        {getSubGroupOptions().find(
                          (p) => p.value === selectedVehicle.subGroup1
                        )?.label || null}
                      </p>
                    </div>
                  )}
                  {selectedVehicle.subGroup2 && (
                    <div>
                      <p className='text-sm text-gray-500'>Sub Group 2</p>
                      <p className='font-medium'>
                        {getSubGroupOptions().find(
                          (p) => p.value === selectedVehicle.subGroup2
                        )?.label || null}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className='space-y-4 rounded-md border p-4'>
                <h3 className='font-medium text-lg'>Devices</h3>
                <div className='space-y-4'>
                  <div>
                    <div className='flex items-center justify-between'>
                      <p className='font-medium'>Camera Device</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selectedVehicle.cameraDevice?.exists
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedVehicle.cameraDevice?.exists
                          ? 'Installed'
                          : 'Not Installed'}
                      </span>
                    </div>
                    {selectedVehicle.cameraDevice?.exists && (
                      <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-gray-500'>Provider</p>
                          <p>
                            {getCameraProviders().find(
                              (p) =>
                                p.value ===
                                selectedVehicle.cameraDevice.provider
                            )?.label || null}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Device ID</p>
                          <p>{selectedVehicle.cameraDevice.deviceId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className='flex items-center justify-between'>
                      <p className='font-medium'>Telematics Device</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selectedVehicle.telematicsDevice?.exists
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedVehicle.telematicsDevice?.exists
                          ? 'Installed'
                          : 'Not Installed'}
                      </span>
                    </div>
                    {selectedVehicle.telematicsDevice?.exists && (
                      <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-gray-500'>Provider</p>
                          <p>
                            {getTelematicsProviders().find(
                              (p) =>
                                p.value ===
                                selectedVehicle.telematicsDevice.provider
                            )?.label || null}
                          </p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Device ID</p>
                          <p>{selectedVehicle.telematicsDevice.deviceId}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className='flex items-center justify-between'>
                      <p className='font-medium'>SVR Device</p>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          selectedVehicle.svrDevice?.exists
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedVehicle.svrDevice?.exists
                          ? 'Installed'
                          : 'Not Installed'}
                      </span>
                    </div>
                    {selectedVehicle.svrDevice?.exists && (
                      <div className='mt-2 grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-gray-500'>Device ID</p>
                          <p>{selectedVehicle.svrDevice.deviceId}</p>
                        </div>
                        <div>
                          <p className='text-gray-500'>Case Number</p>
                          <p>{selectedVehicle.svrDevice.caseNumber}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}

      {/* Vehicle Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs defaultValue='basic' className='w-full'>
              <div className='relative rounded-sm overflow-x-scroll h-10 bg-muted'>
                <TabsList className='absolute flex flex-row justify-stretch w-full'>
                  <TabsTrigger value='basic'>Basic Info</TabsTrigger>
                  <TabsTrigger value='additional'>Additional Info</TabsTrigger>
                  <TabsTrigger value='company'>Company Info</TabsTrigger>
                  <TabsTrigger value='devices'>Devices</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value='basic' className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='fleetNumber'>Fleet Number</Label>
                    <Input
                      id='fleetNumber'
                      {...form.register('fleetNumber')}
                      className={
                        form.formState.errors.fleetNumber
                          ? 'border-red-500'
                          : ''
                      }
                    />
                    {form.formState.errors.fleetNumber && (
                      <p className='text-sm text-red-500'>
                        {form.formState.errors.fleetNumber.message}
                      </p>
                    )}
                  </div>

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
                    <Label htmlFor='vehicleMake'>Make</Label>
                    <Controller
                      name='vehicleMake'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleMake'
                          options={vehicleMakes}
                          placeholder='Select make'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.vehicleMake}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleModel'>Model</Label>
                    <Controller
                      name='vehicleModel'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleModel'
                          options={filteredModels}
                          disabled={!selectedMake}
                          placeholder={
                            selectedMake ? 'Select model' : 'Select make first'
                          }
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.vehicleModel}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleCategory'>Vehicle Type</Label>
                    <Controller
                      name='vehicleCategory'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleCategory'
                          options={vehicleCategories}
                          placeholder='Select vehicle type'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.vehicleCategory}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subVehicleType'>Sub-vehicle Type</Label>
                    <Controller
                      name='subVehicleType'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='subVehicleType'
                          options={filteredSubTypes}
                          disabled={!selectedVehicleType}
                          placeholder={
                            selectedVehicleType
                              ? 'Select sub-type'
                              : 'Select vehicle type first'
                          }
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.subVehicleType}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleYear'>Year</Label>
                    <Input
                      id='vehicleYear'
                      type='number'
                      {...form.register('vehicleYear', { valueAsNumber: true })}
                      error={form.formState.errors.vehicleYear}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleColour'>Vehicle Colour</Label>
                    <Controller
                      name='vehicleColour'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleColour'
                          options={getVehicleColours()}
                          placeholder='Select colour'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.vehicleColour}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='vehicleMaxSpeed'>
                      Vehicle Max Speed (km/h)
                    </Label>
                    <Controller
                      name='vehicleMaxSpeed'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='vehicleMaxSpeed'
                          options={filteredVehicleSpeedLimits.map((limit) => ({
                            label: limit.label,
                            value: limit.value.toString()
                          }))}
                          disabled={!selectedVehicleType}
                          placeholder={
                            selectedVehicleType
                              ? 'Select max speed'
                              : 'Select vehicle type first'
                          }
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={
                            field.value ? field.value?.toString() : undefined
                          }
                          error={form.formState.errors.vehicleMaxSpeed}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='vehicleDescription'>
                      Vehicle Description
                    </Label>
                    <Textarea
                      id='vehicleDescription'
                      {...form.register('vehicleDescription')}
                    />
                  </div>

                  <div className='space-y-2 md:col-span-2'>
                    <Label htmlFor='specialMarkings'>Special Markings</Label>
                    <Textarea
                      id='specialMarkings'
                      {...form.register('specialMarkings')}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='additional' className='space-y-4'>
                <Accordion
                  type='multiple'
                  // collapsible
                  defaultValue={['additional-info', 'prdp-categories']}
                  className='w-full'
                >
                  <AccordionItem value='additional-info'>
                    <AccordionTrigger>
                      Additional Vehicle Information
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='engineType'>Engine Type</Label>
                          <Controller
                            name='engineType'
                            control={form.control}
                            render={({ field }) => (
                              <AutoComplete
                                id='engineType'
                                options={getEngineType()}
                                placeholder='Select colour'
                                onValueChange={field.onChange}
                                value={field.value}
                                error={form.formState.errors.engineType}
                              />
                            )}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='dateOfPurchase'>
                            Date of Purchase
                          </Label>
                          <Input
                            id='dateOfPurchase'
                            type='date'
                            {...form.register('dateOfPurchase')}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='vehicleRegisterNumber'>
                            Vehicle Register Number
                          </Label>
                          <Input
                            id='vehicleRegisterNumber'
                            {...form.register('vehicleRegisterNumber')}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='showFleet'>
                            Show Fleet/License/Combo
                          </Label>
                          <Controller
                            name='showFleet'
                            control={form.control}
                            render={({ field }) => (
                              <AutoComplete
                                id='showFleet'
                                options={getShowFleetOptions()}
                                placeholder='Select display option'
                                onValueChange={field.onChange}
                                value={field.value}
                                error={form.formState.errors.showFleet}
                              />
                            )}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='vin'>VIN</Label>
                          <Input
                            id='vin'
                            {...form.register('vin')}
                            className={
                              form.formState.errors.vin ? 'border-red-500' : ''
                            }
                          />
                          {form.formState.errors.vin && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.vin.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='driven'>Driven</Label>
                          <Controller
                            name='driven'
                            control={form.control}
                            render={({ field }) => (
                              <AutoComplete
                                id='driven'
                                options={getDrivenOptions()}
                                placeholder='Select driven type'
                                onValueChange={field.onChange}
                                value={field.value}
                                error={form.formState.errors.driven}
                              />
                            )}
                          />
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='engineNumber'>Engine Number</Label>
                          <Input
                            id='engineNumber'
                            {...form.register('engineNumber')}
                            className={
                              form.formState.errors.engineNumber
                                ? 'border-red-500'
                                : ''
                            }
                            required={form.watch('driven') === 'self-propelled'}
                          />
                          {form.formState.errors.engineNumber && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.engineNumber.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='gvm'>GVM (kg)</Label>
                          <Input
                            id='gvm'
                            type='number'
                            {...form.register('gvm', { valueAsNumber: true })}
                            className={
                              form.formState.errors.gvm ? 'border-red-500' : ''
                            }
                          />
                          {form.formState.errors.gvm && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.gvm.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='tare'>Tare (kg)</Label>
                          <Input
                            id='tare'
                            type='number'
                            {...form.register('tare', { valueAsNumber: true })}
                            className={
                              form.formState.errors.tare ? 'border-red-500' : ''
                            }
                          />
                          {form.formState.errors.tare && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.tare.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='nvc'>NVC</Label>
                          <Input
                            id='nvc'
                            type='number'
                            {...form.register('nvc', { valueAsNumber: true })}
                            className={
                              form.formState.errors.nvc ? 'border-red-500' : ''
                            }
                          />
                          {form.formState.errors.nvc && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.nvc.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='regAuthority'>
                            Registration Authority
                          </Label>
                          <Input
                            id='regAuthority'
                            {...form.register('regAuthority')}
                            className={
                              form.formState.errors.regAuthority
                                ? 'border-red-500'
                                : ''
                            }
                          />
                          {form.formState.errors.regAuthority && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.regAuthority.message}
                            </p>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor='dateOfExpiry'>Date of Expiry</Label>
                          <Input
                            id='dateOfExpiry'
                            type='date'
                            {...form.register('dateOfExpiry')}
                            className={
                              form.formState.errors.dateOfExpiry
                                ? 'border-red-500'
                                : ''
                            }
                          />
                          {form.formState.errors.dateOfExpiry && (
                            <p className='text-sm text-red-500'>
                              {form.formState.errors.dateOfExpiry.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value='prdp-categories'>
                    <AccordionTrigger>PrDP Categories</AccordionTrigger>
                    <AccordionContent>
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
                          <Label htmlFor='dangerousGoods'>
                            Dangerous Goods
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent value='company' className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label>Company</Label>
                    <Input value={companyName} disabled />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='riskGroup'>Risk Group</Label>
                    <Controller
                      name='riskGroup'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='riskGroup'
                          options={getRiskGroupOptions()}
                          placeholder='Select risk group'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.riskGroup}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='region'>Region</Label>
                    <Controller
                      name='region'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='region'
                          disabled={!company || isCompanyLoading}
                          options={
                            company && company.regions.length
                              ? company.regions.map((regionValue) => {
                                  // Find the corresponding province object
                                  const province = PROVINCES.find(
                                    (province) => province.value === regionValue
                                  )
                                  // Return the province if found, otherwise use the raw value
                                  return province
                                    ? { ...province, value: regionValue }
                                    : { label: regionValue, value: regionValue }
                                })
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

                  <div className='space-y-2'>
                    <Label htmlFor='subGroup1'>Sub Group 1</Label>
                    <Controller
                      name='subGroup1'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='subGroup1'
                          options={getSubGroupOptions()}
                          placeholder='Select sub group 1'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.subGroup1}
                        />
                      )}
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subGroup2'>Sub Group 2</Label>
                    <Controller
                      name='subGroup2'
                      control={form.control}
                      render={({ field }) => (
                        <AutoComplete
                          id='subGroup2'
                          options={getSubGroupOptions()}
                          placeholder='Select sub group 2'
                          onValueChange={field.onChange}
                          value={field.value}
                          error={form.formState.errors.subGroup2}
                        />
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value='devices' className='space-y-4 mt-4'>
                <div className='space-y-4 border p-4 rounded-md'>
                  <div className='flex items-center space-x-2'>
                    <Controller
                      name='cameraDevice.exists'
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id='cameraExists'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor='cameraExists' className='font-medium'>
                      Camera Device
                    </Label>
                  </div>

                  {cameraExists && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='cameraProvider'>Camera Provider</Label>
                        <Controller
                          name='cameraDevice.provider'
                          control={form.control}
                          render={({ field }) => (
                            <AutoComplete
                              id='cameraProvider'
                              options={cameraProviders}
                              placeholder='Select provider'
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              error={
                                cameraExists && !field.value
                                  ? {
                                      message: 'Camera provider is required',
                                      type: 'required'
                                    }
                                  : undefined
                              }
                            />
                          )}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='cameraDeviceId'>Device ID</Label>
                        <Input
                          id='cameraDeviceId'
                          {...form.register('cameraDevice.deviceId')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className='space-y-4 border p-4 rounded-md'>
                  <div className='flex items-center space-x-2'>
                    <Controller
                      name='telematicsDevice.exists'
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id='telematicsExists'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor='telematicsExists' className='font-medium'>
                      Telematics Device
                    </Label>
                  </div>

                  {telematicsExists && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='telematicsProvider'>
                          Telematics Provider
                        </Label>
                        <Controller
                          name='telematicsDevice.provider'
                          control={form.control}
                          render={({ field }) => (
                            <AutoComplete
                              id='telematicsProvider'
                              options={telematicsProviders}
                              placeholder='Select provider'
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              error={
                                telematicsExists && !field.value
                                  ? {
                                      message:
                                        'Telematics provider is required',
                                      type: 'required'
                                    }
                                  : undefined
                              }
                            />
                          )}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='telematicsDeviceId'>Device ID</Label>
                        <Input
                          id='telematicsDeviceId'
                          {...form.register('telematicsDevice.deviceId')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className='space-y-4 border p-4 rounded-md'>
                  <div className='flex items-center space-x-2'>
                    <Controller
                      name='svrDevice.exists'
                      control={form.control}
                      render={({ field }) => (
                        <Checkbox
                          id='svrExists'
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                    <Label htmlFor='svrExists' className='font-medium'>
                      SVR Device
                    </Label>
                  </div>

                  {svrExists && (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 pl-6'>
                      <div className='space-y-2'>
                        <Label htmlFor='svrDeviceId'>Device ID</Label>
                        <Input
                          id='svrDeviceId'
                          {...form.register('svrDevice.deviceId')}
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor='svrCaseNumber'>Case Number</Label>
                        <Input
                          id='svrCaseNumber'
                          {...form.register('svrDevice.caseNumber')}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsDialogOpen(false)
                  setEditingVehicle(null)
                  form.reset(defaultValues)
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90'
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editingVehicle
                  ? 'Update Vehicle'
                  : 'Add Vehicle'}
              </Button>
            </DialogFooter>
          </form>
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
              vehicle.
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

      {/* Reassign Dialog */}
      <Dialog
        open={isReassignDialogOpen}
        onOpenChange={setIsReassignDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Vehicle</DialogTitle>
          </DialogHeader>
          <div className='space-y-4'>
            <p>
              Select a new company to reassign{' '}
              <span className='font-semibold'>
                {vehicleToReassign
                  ? `${vehicleToReassign.licenseNumber}`
                  : 'this vehicle'}
              </span>{' '}
              to:
            </p>
            <div className='space-y-2'>
              <Label htmlFor='companyId'>Current Company</Label>
              <p className='text-sm text-gray-500'>
                {vehicleToReassign?.company?.companyName}
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
                            company._id !== vehicleToReassign?.companyId
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
                  setVehicleToReassign(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (
                    vehicleToReassign &&
                    reassignForm.getValues('companyId')
                  ) {
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
