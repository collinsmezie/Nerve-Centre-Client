import { useState, useEffect, useCallback } from 'react'
import { Card, CardTitle, CardHeader, CardContent } from '@/components/ui/card'
import { fetchEvents } from '@/api/events'
import { useEventWebSocket } from '@/hooks/useEventWebSocket'
import type { Event } from '@/types/event'
import { cn } from '@/lib/utils'
import { ClipboardList, Clock } from 'lucide-react'
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { HistoricEventsView } from './historic-view'
import { EVENT_GROUP_TYPES } from '@/lib/constants'
import { getVehicleIcon } from '../companies/tabs/vehicles-tab'

// EventCategory type
interface EventCategory {
  value: string
  label: string
}

export function EventsPage() {
  const [categories, setCategories] = useState<EventCategory[]>([])
  const [eventsByCategory, setEventsByCategory] = useState<
    Record<string, Event[]>
  >({})
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('data') || 'live')
  const navigate = useNavigate()
  const location = useLocation()

  const isLiveView =
    location.pathname === '/events' &&
    (!searchParams.get('data') || searchParams.get('data') === 'live')

  // Add effect to sync activeTab with URL
  useEffect(() => {
    const dataParam = searchParams.get('data')
    setActiveTab(dataParam || 'live')
  }, [searchParams])

  // Fetch categories and initial events
  useEffect(() => {
    async function load() {
      setLoading(true)
      const cats: EventCategory[] = EVENT_GROUP_TYPES
      setCategories(cats)
      // Optionally fetch initial events from API
      const initialEvents: Event[] = await fetchEvents('1')
      const grouped: Record<string, Event[]> = {}
      cats.forEach((cat) => {
        grouped[cat.value] = []
      })
      initialEvents.forEach((ev) => {
        const cat = ev.eventGroupType
        if (cat && grouped[cat]) grouped[cat].push(ev as Event)
      })
      setEventsByCategory(grouped)
      setLoading(false)
    }
    load()
  }, [])

  // Real-time event handler
  const handleNewEvent = useCallback((event: Event) => {
    setEventsByCategory((prev) => {
      const cat = event.eventGroupType
      if (!cat) return prev
      return {
        ...prev,
        [cat]: [event, ...(prev[cat] || [])]
      }
    })
  }, [])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSearchParams({ data: value })
  }

  const handleEventClick = (eventId: string) => {
    navigate(`/events/event/${eventId}`)
  }

  // Subscribe to WebSocket
  useEventWebSocket(handleNewEvent)

  return (
    <div className={cn(isLiveView ? 'bg-[#111827]' : '')}>
      <div
        className={cn(
          'flex flex-col md:!h-[calc(100vh-72px)] p-6 relative',
          !isLiveView && 'container'
        )}
      >
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsContent value='live' className='mt-0'>
            <div className='flex justify-between items-center mb-4'>
              <div>
                <h1 className='text-2xl font-bold tracking-tight text-white'>
                  Events
                </h1>
                <p className='text-gray-300'>View real-time events</p>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn(
                    'text-white',
                    activeTab === 'live' && 'bg-white/10'
                  )}
                  onClick={() => handleTabChange('live')}
                >
                  <Clock className='h-5 w-5' />
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  className={cn(
                    'text-white',
                    activeTab === 'historic' && 'bg-white/10'
                  )}
                  onClick={() => handleTabChange('historic')}
                >
                  <ClipboardList className='h-5 w-5' />
                </Button>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 h-full w-full'>
              {loading ? (
                <div className='text-white'>Loading...</div>
              ) : (
                categories.map((cat) => (
                  <Card
                    key={cat.value}
                    className='bg-[#23272f] text-white md:h-[calc(100vh/3-80px)] h-[250px] flex flex-col border-none'
                  >
                    <CardHeader className='bg-[#383839] rounded-t-lg p-3 group'>
                      <CardTitle
                        onClick={() =>
                          navigate(
                            `/events?data=historic&eventGroupType=${cat.value}`
                          )
                        }
                        className={cn(
                          'flex justify-between items-center text-sm',
                          eventsByCategory[cat.value]?.length > 0
                            ? 'text-[#FB923C] group-hover:text-[#FB926C]/90 transition group-hover:cursor-pointer'
                            : ''
                        )}
                      >
                        <span className='font-bold'>{cat.label}</span>
                        <span className='text-xs'>
                          {eventsByCategory[cat.value]?.length || 0} Pending
                          Events
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 overflow-y-auto p-4 bg-white rounded-b-lg'>
                      {eventsByCategory[cat.value]?.length > 0 ? (
                        eventsByCategory[cat.value].map((ev) => (
                          <div
                            key={ev._id}
                            onClick={() => handleEventClick(ev._id)}
                            className='bg-white shadow rounded border border-black/5 p-2 mb-2 flex items-center justify-between text-black cursor-pointer hover:bg-gray-50'
                          >
                            <div className='flex items-center gap-2'>
                              <div className='text-gray-500'>
                                {getVehicleIcon(
                                  ev.vehicle.vehicleCategory,
                                  '!text-[#FB923C]'
                                )}
                              </div>
                              <p className='text-sm'>
                                {ev.vehicle?.licenseNumber || 'Unknown'}
                              </p>
                            </div>
                            <p className='text-xs'>{ev.eventGroupType || ''}</p>
                          </div>
                        ))
                      ) : (
                        <span className='text-gray-400 text-xs'>
                          No pending events
                        </span>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value='historic' className='mt-0'>
            <HistoricEventsView
              onTabChange={(data: string) => handleTabChange(data)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
