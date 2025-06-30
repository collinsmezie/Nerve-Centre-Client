import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCompany } from '../../api/companies'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../../components/ui/tabs'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { DetailsTab } from './tabs/details-tab'
import { IceContactsTab } from './tabs/ice-contacts-tab'
import { VehiclesTab } from './tabs/vehicles-tab'
import { DriversTab } from './tabs/drivers-tab'
import { EventsTab } from './tabs/events-tab'

export const CompanyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(
    searchParams.get('data') || 'details'
  )

  const {
    data: company,
    isLoading,
    error
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompany(id || ''),
    enabled: !!id
  })

  useEffect(() => {
    if (error) {
      console.error('Error fetching company:', error)
    }
  }, [error])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ data: value })
  }

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
      </div>
    )
  }

  if (!company) {
    return (
      <div className='flex flex-col items-center justify-center h-full'>
        <h2 className='text-2xl font-bold mb-4'>Company not found</h2>
        <Button onClick={() => navigate('/companies')}>
          Back to Companies
        </Button>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() => navigate('/companies')}
          >
            <ArrowLeft className='h-5 w-5' />
          </Button>
          <h1 className='text-2xl font-bold'>{company.companyName}</h1>
        </div>
      </div>

      <Tabs
        defaultValue='details'
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <div className='relative rounded-sm overflow-x-scroll h-10 bg-muted'>
          <TabsList className='absolute flex flex-row justify-stretch w-full'>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger value='ice-contacts'>ICE Contacts</TabsTrigger>
            <TabsTrigger value='vehicles'>Vehicles</TabsTrigger>
            <TabsTrigger value='drivers'>Drivers</TabsTrigger>
            <TabsTrigger value='events'>Events</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value='details' className='mt-4'>
          <DetailsTab companyId={company._id} />
        </TabsContent>

        <TabsContent value='ice-contacts' className='mt-4'>
          <IceContactsTab companyId={company._id} />
        </TabsContent>

        <TabsContent value='vehicles' className='mt-4'>
          <VehiclesTab
            companyId={company._id}
            companyName={company.companyName}
          />
        </TabsContent>

        <TabsContent value='drivers' className='mt-4'>
          <DriversTab companyId={company._id} />
        </TabsContent>

        <TabsContent value='events' className='mt-4'>
          <EventsTab companyId={company._id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
