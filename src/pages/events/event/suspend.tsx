import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { fetchEvents } from '@/api/events'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Ban } from 'lucide-react'
import { toast } from 'sonner'
import { AutoComplete } from '@/components/ui/autocomplete'

// Mock data for suspension reasons
const suspensionReasons = [
  { label: 'Driver Violation', value: 'driver-violation' },
  { label: 'Vehicle Maintenance', value: 'vehicle-maintenance' },
  { label: 'Safety Concern', value: 'safety-concern' },
  { label: 'Policy Violation', value: 'policy-violation' },
  { label: 'Other', value: 'other' }
]

export function SuspendEventPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [selectedReason, setSelectedReason] = useState('')

  const { data: event, isLoading } = useQuery({
    queryKey: ['event', id],
    queryFn: () =>
      fetchEvents('all', { eventGroupType: id }).then((events) => events[0]),
    enabled: !!id
  })

  const suspendMutation = useMutation({
    mutationFn: async () => {
      // TODO: Implement suspend API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
    },
    onSuccess: () => {
      toast.success('Event suspended successfully')
      navigate(`/events/event/${id}`)
    },
    onError: () => {
      toast.error('Failed to suspend event')
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
          <h1 className='text-2xl font-bold tracking-tight'>Suspend Event</h1>
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
                    <p className='text-sm text-gray-500'>Driver</p>
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
                <Label htmlFor='reason'>Suspension Reason</Label>
                <AutoComplete
                  id='reason'
                  options={suspensionReasons}
                  placeholder='Select a reason'
                  value={selectedReason}
                  onValueChange={setSelectedReason}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notes'>Notes</Label>
                <Textarea
                  id='notes'
                  placeholder='Add any notes about this suspension...'
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
                  className='bg-red-600 hover:bg-red-700'
                  onClick={() => suspendMutation.mutate()}
                  disabled={suspendMutation.isPending || !selectedReason}
                >
                  <Ban className='mr-2 h-4 w-4' />
                  Suspend Event
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
