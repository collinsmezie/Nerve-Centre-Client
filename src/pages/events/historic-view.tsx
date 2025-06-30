import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Calendar,
  LayoutGrid,
  Table as TableIcon,
  ArrowLeft,
  Clock
} from 'lucide-react'
import { fetchEvents } from '@/api/events'
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { Skeleton } from '@/components/ui/skeleton'
import { AutoComplete } from '@/components/ui/autocomplete'
import { Card, CardContent } from '@/components/ui/card'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { EVENT_GROUP_TYPES } from '@/lib/constants'
import { fetchCompanies } from '@/api/companies'
import { getVehicleIcon } from '../companies/tabs/vehicles-tab'

// Mock action types for the dropdown
const actionTypes = [
  { label: 'Acknowledged', value: 'acknowledged' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Reallocated', value: 'reallocated' }
]

export function HistoricEventsView({
  onTabChange
}: {
  onTabChange: (data: string) => void
}) {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    vehicleReg: '',
    driverName: '',
    actionTaken: '',
    eventGroupType: '',
    company: ''
  })
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const navigate = useNavigate()

  const {
    data: events,
    isLoading,
    error
  } = useQuery({
    queryKey: ['events', 'all', filters],
    queryFn: () => fetchEvents('all', filters)
  })

  const {
    data: companies,
    isLoading: isCompaniesLoading,
    error: companiesError
  } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  })

  useEffect(() => {
    const eventGroupType = searchParams.get('eventGroupType')
    if (eventGroupType) {
      setFilters((prev) => ({ ...prev, eventGroupType }))
    }
  }, [searchParams])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))

    // Update URL search params
    setSearchParams((prev) => {
      if (value) {
        prev.set(key, value)
      } else {
        prev.delete(key)
      }
      return prev
    })
  }

  const handleDateRangeChange = (range: {
    from: Date | undefined
    to: Date | undefined
  }) => {
    setDateRange(range)

    setSearchParams((prev) => {
      if (range.from) {
        prev.set('startDate', format(range.from, 'yyyy-MM-dd'))
      } else {
        prev.delete('startDate')
      }

      if (range.to) {
        prev.set('endDate', format(range.to, 'yyyy-MM-dd'))
      } else {
        prev.delete('endDate')
      }

      return prev
    })

    if (range.from) {
      setFilters((prev) => ({
        ...prev,
        startDate: format(range.from as Date, 'yyyy-MM-dd')
      }))
    }
    if (range.to) {
      setFilters((prev) => ({
        ...prev,
        endDate: format(range.to as Date, 'yyyy-MM-dd')
      }))
    }
  }

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      vehicleReg: '',
      driverName: '',
      actionTaken: '',
      eventGroupType: '',
      company: ''
    })
    setDateRange({ from: undefined, to: undefined })

    // Clear all search params except 'data'
    setSearchParams((prev) => {
      const data = prev.get('data')
      const newParams = new URLSearchParams()
      if (data) {
        newParams.set('data', data)
      }
      return newParams
    })
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/events/event/${eventId}`)
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onTabChange('live')}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <div>
            <h2 className='text-xl font-semibold text-black'>
              {filters.eventGroupType
                ? `${
                    EVENT_GROUP_TYPES.find(
                      (t) => t.value === filters.eventGroupType
                    )?.label
                  } Events`
                : 'Historic Events'}
            </h2>
            <p className='text-sm text-gray-400'>View historic events</p>
          </div>
        </div>
        <div className='flex gap-2'>
          <Button
            variant='ghost'
            size='icon'
            className={cn('text-black', viewMode === 'table' && 'bg-black/10')}
            onClick={() => setViewMode('table')}
          >
            <TableIcon className='h-5 w-5' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className={cn('text-black', viewMode === 'card' && 'bg-black/10')}
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <Label htmlFor='dateRange' className='mb-2 block'>
              Date Range
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  id='dateRange'
                  variant='outline'
                  className='w-full justify-start text-left font-normal bg-white'
                >
                  <Calendar className='mr-2 h-4 w-4' />
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'PPP')} -{' '}
                        {format(dateRange.to, 'PPP')}
                      </>
                    ) : (
                      format(dateRange.from, 'PPP')
                    )
                  ) : (
                    <span className='text-muted-foreground'>
                      Select date range
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto p-0' align='start'>
                <CalendarComponent
                  mode='range'
                  selected={dateRange}
                  onSelect={(range) => {
                    handleDateRangeChange(
                      range as { from: Date | undefined; to: Date | undefined }
                    )
                    if (range?.to) {
                      setIsCalendarOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className='flex-1'>
            <Label htmlFor='company' className='mb-2 block'>
              Company
            </Label>
            <AutoComplete
              id='company'
              isLoading={isCompaniesLoading}
              options={
                companies
                  ? companies.map((company) => ({
                      label: company.companyName,
                      value: company._id.toString()
                    }))
                  : []
              }
              placeholder='All companies'
              value={filters.company}
              onValueChange={(value) => handleFilterChange('company', value)}
            />
          </div>

          <div className='flex-1'>
            <Label htmlFor='eventGroupType' className='mb-2 block'>
              Event Type
            </Label>
            <AutoComplete
              id='eventGroupType'
              options={EVENT_GROUP_TYPES}
              placeholder='All event types'
              value={filters.eventGroupType}
              onValueChange={(value) =>
                handleFilterChange('eventGroupType', value)
              }
            />
          </div>

          <div className='flex-1'>
            <Label htmlFor='actionTaken' className='mb-2 block'>
              Action Taken
            </Label>
            <AutoComplete
              id='actionTaken'
              options={actionTypes}
              placeholder='All actions'
              value={filters.actionTaken}
              onValueChange={(value) =>
                handleFilterChange('actionTaken', value)
              }
            />
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-4'>
          <div className='flex-1'>
            <Label htmlFor='vehicleReg' className='mb-2 block'>
              Vehicle Registration
            </Label>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                id='vehicleReg'
                placeholder='Search by license plate'
                value={filters.vehicleReg}
                onChange={(e) =>
                  handleFilterChange('vehicleReg', e.target.value)
                }
                className='bg-white'
              />
            </div>
          </div>

          <div className='flex-1'>
            <Label htmlFor='driverName' className='mb-2 block'>
              Driver Name
            </Label>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                id='driverName'
                placeholder='Search by driver name'
                value={filters.driverName}
                onChange={(e) =>
                  handleFilterChange('driverName', e.target.value)
                }
                className='bg-white'
              />
            </div>
          </div>

          <div className='flex-1 flex items-end'>
            <Button
              variant='outline'
              onClick={clearFilters}
              className='w-full bg-white'
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {isLoading || isCompaniesLoading ? (
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center space-x-4'>
              <Skeleton className='h-12 w-full' />
            </div>
          ))}
        </div>
      ) : error || companiesError ? (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>
              Error loading events. Please try again later.
            </div>
          </div>
        </div>
      ) : events?.length === 0 ? (
        <div className='text-center py-12 border rounded-md bg-white'>
          <p className='text-gray-500'>
            No events found matching your filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className='rounded-md border bg-white'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-10'></TableHead>
                <TableHead>Vehicle Reg</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Action Taken</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events?.map((event) => (
                <TableRow
                  key={event._id}
                  className='cursor-pointer hover:bg-gray-50'
                  onClick={() => handleEventClick(event._id)}
                >
                  <TableCell>
                    {getVehicleIcon(event.vehicle.vehicleCategory)}
                  </TableCell>
                  <TableCell>{event.vehicle?.licenseNumber}</TableCell>
                  <TableCell>
                    {format(new Date(event.dateTime), 'MMMM dd, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>{event.company.companyName}</TableCell>
                  <TableCell>
                    {`${event.driver?.firstName} ${event.driver?.lastName}`}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        event.eventGroupType.includes('fatigue')
                          ? 'bg-red-100 text-red-800'
                          : event.eventGroupType.includes('phone')
                          ? 'bg-yellow-100 text-yellow-800'
                          : event.eventGroupType.includes('harsh')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {EVENT_GROUP_TYPES.find(
                        (type) => type.value === event.eventGroupType
                      )?.label || event.eventGroupType}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`,
                        event.actionTaken === 'acknowledged'
                          ? 'bg-green-100 text-green-800'
                          : event.actionTaken === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : event.actionTaken === 'reallocated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {actionTypes.find(
                        (type) => type.value === event.actionTaken
                      )?.label ||
                        (event.actionTaken
                          ? event.actionTaken.charAt(0).toUpperCase() +
                            event.actionTaken.slice(1)
                          : '-')}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
          {events?.map((event) => (
            <Card
              key={event._id}
              className='cursor-pointer hover:shadow-lg transition-shadow'
              onClick={() => handleEventClick(event._id)}
            >
              <CardContent className='p-4'>
                <div className='flex justify-between items-start mb-4'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      {getVehicleIcon(event.vehicle.vehicleCategory)}
                      <h3 className='font-semibold'>
                        {event.vehicle?.licenseNumber}
                      </h3>
                    </div>
                    <p className='text-sm text-gray-500 flex items-center gap-2'>
                      <Clock className='w-4 h-4' />
                      {format(new Date(event.dateTime), 'MMMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800`}
                  >
                    {EVENT_GROUP_TYPES.find(
                      (type) => type.value === event.eventGroupType
                    )?.label || event.eventGroupType}
                  </span>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between space-x-2'>
                    <span className='text-sm text-gray-500'>Company</span>
                    <span className='text-sm font-medium'>
                      {event.company.companyName}
                    </span>
                  </div>
                  <div className='w-full h-[1px] bg-gray-200 my-2' />
                  <div className='flex justify-between space-x-2'>
                    <span className='text-sm text-gray-500'>Driver</span>
                    <span className='text-sm font-medium'>
                      {`${event.driver?.firstName} ${event.driver?.lastName}`}
                    </span>
                  </div>
                  <div className='w-full h-[1px] bg-gray-200 my-2' />
                  <div className='flex justify-between space-x-2'>
                    <span className='text-sm text-gray-500'>Action</span>
                    <span
                      className={cn(
                        `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`,
                        event.actionTaken === 'acknowledged'
                          ? 'bg-green-100 text-green-800'
                          : event.actionTaken === 'suspended'
                          ? 'bg-red-100 text-red-800'
                          : event.actionTaken === 'reallocated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      )}
                    >
                      {actionTypes.find(
                        (type) => type.value === event.actionTaken
                      )?.label ||
                        (event.actionTaken
                          ? event.actionTaken.charAt(0).toUpperCase() +
                            event.actionTaken.slice(1)
                          : '-')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
