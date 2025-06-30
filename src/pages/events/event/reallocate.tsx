import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchEvents } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { AutoComplete } from '@/components/ui/autocomplete'

// Mock data for available drivers
const availableDrivers = [
  { label: 'John Smith', value: 'john-smith' },
  { label: 'Jane Doe', value: 'jane-doe' },
  { label: 'Mike Johnson', value: 'mike-johnson' },
  { label: 'Sarah Williams', value: 'sarah-williams' }
]

export function ReallocateEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () =>
      fetchEvents('all', { eventGroupType: id }).then((events) => events[0]),
    enabled: !!id
  })

  const reallocateMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement reallocate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success('Event reallocated successfully')
      navigate(`/events/event/${id}`)
    },
    onError: () => {
      toast.error('Failed to reallocate event')
    }
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!event) {
    return <div>Event not found</div>
  }

  return (
    <div className='p-6'>
      <div className='flex items-center gap-4 mb-6'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => navigate(`/events/event/${id}`)}
        >
          <ArrowLeft className='h-5 w-5' />
        </Button>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Reallocate Event
          </h1>
          <p className='text-gray-400'>
            {event.eventGroupType} - {event.dateTime}
          </p>
        </div>
      </div>

      <div className='max-w-2xl mx-auto'>
        <Card>
          <CardContent className='p-6'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-semibold mb-4'>Event Details</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-gray-500'>Vehicle</p>
                    <p className='font-medium'>
                      {event.vehicle?.licenseNumber}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Current Driver</p>
                    <p className='font-medium'>
                      {`${event.driver?.firstName} ${event.driver?.lastName}`}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Event Type</p>
                    <p className='font-medium'>{event.eventGroupType}</p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Date & Time</p>
                    <p className='font-medium'>{event.dateTime}</p>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='newDriver'>New Driver</Label>
                <AutoComplete
                  id='newDriver'
                  options={availableDrivers}
                  placeholder='Select a driver'
                  value={selectedDriver}
                  onValueChange={setSelectedDriver}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  placeholder='Add any notes about this reallocation...'
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className='min-h-[100px]'
                />
              </div>

              <div className='flex justify-end gap-4'>
                <Button
                  variant='outline'
                  onClick={() => navigate(`/events/event/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  className='bg-blue-600 hover:bg-blue-700'
                  onClick={() => reallocateMutation.mutate()}
                  disabled={reallocateMutation.isPending || !selectedDriver}
                >
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Reallocate Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
