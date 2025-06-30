import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchEvents } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  CheckCircle,
  RefreshCw,
  Ban,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [liveViewLoaded, setLiveViewLoaded] = useState(false)

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () =>
      fetchEvents('all', { eventGroupType: id }).then((events) => events[0]),
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[60vh] text-gray-500'>
        Loading...
      </div>
    )
  }

  if (!event) {
    return (
      <div className='flex justify-center items-center min-h-[60vh] text-gray-500'>
        Event not found
      </div>
    )
  }

  return (
    <div>
      {/* Action Buttons */}
      <div className='flex flex-col md:flex-row gap-3 md:gap-4 mb-6'>
        <Button
          variant='ghost'
          className='flex items-center gap-2'
          onClick={() => navigate(-1)}
        >
          <ArrowLeft />
          <p className='text-sm font-semibold'>Back</p>
        </Button>
        <Button
          variant='outline'
          className='flex-1 border-green-600 text-green-600 hover:bg-green-50 font-semibold flex items-center justify-center'
          onClick={() => navigate(`/events/event/${id}/acknowledge`)}
        >
          <CheckCircle className='mr-2 h-5 w-5' />
          Acknowledge
        </Button>
        <Button
          variant='outline'
          className='flex-1 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold flex items-center justify-center'
          onClick={() => navigate(`/events/event/${id}/reallocate`)}
        >
          <RefreshCw className='mr-2 h-5 w-5' />
          Reallocate
        </Button>
        <Button
          variant='outline'
          className='flex-1 border-orange-500 text-orange-500 hover:bg-orange-50 font-semibold flex items-center justify-center'
          onClick={() => navigate(`/events/event/${id}/suspend`)}
        >
          <Ban className='mr-2 h-5 w-5' />
          Suspend
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:h-[calc(100vh-184px)]'>
        {/* Left: Live View */}
        <Card className='col-span-1'>
          <CardContent className='p-4 flex flex-col h-full'>
            <div className='font-semibold text-gray-800 mb-2'>
              {event.vehicle?.licenseNumber} Live View
            </div>

            <div className='flex-1 flex flex-col'>
              <div className='grid grid-cols-2 gap-2 mb-4'>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className='bg-blue-200 rounded h-16 md:h-20 flex items-center justify-center text-blue-900 text-xs font-semibold'
                  >
                    {liveViewLoaded ? (
                      `Camera ${i + 1}`
                    ) : (
                      <span className='opacity-40'>Live Feed</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button
              className='w-full text-white font-semibold rounded'
              onClick={() => setLiveViewLoaded(true)}
            >
              Load Live View
            </Button>
          </CardContent>
        </Card>

        {/* Middle: Event Info */}
        <Card className='col-span-1'>
          <CardContent className='p-4 flex flex-col h-full'>
            <div className='font-bold text-lg text-gray-900 mb-2'>
              {event.eventGroupType} Event
            </div>

            <div className='flex flex-wrap justify-between gap-2 text-gray-700 mb-2'>
              <div className='flex items-center gap-1'>
                <Calendar className='h-4 w-4' />
                <span>{format(new Date(event.dateTime), 'MMMM dd, yyyy')}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Clock className='h-4 w-4' />
                <span>{format(new Date(event.dateTime), 'HH:mm')}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Car className='h-4 w-4' />
                <span>{event.vehicle?.licenseNumber}</span>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-2 mb-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className='bg-gray-200 rounded h-16 flex items-center justify-center text-gray-500 text-xs font-semibold'
                >
                  {/* Replace with actual event images if available */}
                  <span>Event Img {i + 1}</span>
                </div>
              ))}
            </div>
            <div className='flex-1 flex flex-col justify-end'>
              <div className='bg-blue-200 rounded h-full flex items-center justify-center text-blue-900 text-xs font-semibold mb-2'>
                {/* Replace with actual event video if available */}
                Event Video
              </div>
              <Button className='w-full text-white font-semibold rounded'>
                Event Video
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Location Info */}
        <Card className='col-span-1 md:col-span-2 lg:col-span-1'>
          <CardContent className='p-4 flex flex-col h-full'>
            <div className='font-bold text-lg text-gray-900 mb-2'>
              Event Location
            </div>
            <div className='flex items-center gap-2 text-gray-700 mb-2'>
              <MapPin className='h-4 w-4' />
              <span>123 Main Street, Rosettenville, Johannesburg, 2190</span>
            </div>
            <div className='font-bold text-lg text-gray-900 mb-2 mt-2'>
              Location Now
            </div>
            <div className='flex items-center gap-2 text-gray-700 mb-2'>
              <MapPin className='h-4 w-4' />
              <span>234 Main Street, Rosettenville, Johannesburg, 2190</span>
            </div>
            <div className='flex-1 flex flex-col justify-end'>
              <div className='bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs font-semibold mb-2 h-full mt-2'>
                {/* Replace with actual map if available */}
                <span>Map Placeholder</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
