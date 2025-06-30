import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  fetchICEContacts,
  createICEContact,
  updateICEContact,
  deleteICEContact
} from '@/api/ice-contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { MultiSelect } from '@/components/ui/multi-select'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import type { ICEContact } from '@/types/ice-contact'
import { PROVINCES, ICE_CONTACT_PRIORITIES } from '@/lib/constants'
import { AutoComplete } from '@/components/ui/autocomplete'
import { fetchCompany } from '@/api/companies'

const defaultValues = {
  name: '',
  phone: '',
  email: '',
  regions: [],
  priority: 1
}

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  email: z
    .string()
    .email('Please enter a valid email')
    .optional()
    .or(z.literal('')),
  regions: z.array(z.string()).min(1, 'Please select at least one region'),
  priority: z.number().min(1, 'Please select a priority')
})

type ContactFormValues = z.infer<typeof contactSchema>

interface IceContactsTabProps {
  companyId: string
}

export function IceContactsTab({ companyId }: IceContactsTabProps) {
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<ICEContact | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [contactToDelete, setContactToDelete] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const {
    data: contacts,
    isLoading: isLoadingContacts,
    isFetching,
    error: contactsError
  } = useQuery({
    queryKey: ['ice-contacts', companyId],
    queryFn: () => fetchICEContacts(companyId),
    enabled: !!companyId
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

  const contactForm = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues
  })

  const createContactMutation = useMutation({
    mutationFn: (data: ContactFormValues) =>
      createICEContact(companyId, {
        ...data,
        email: data.email ? data.email : undefined
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-contacts', companyId] })
      toast({
        title: 'Contact created',
        description: 'The ICE contact has been created successfully.',
        variant: 'success'
      })
      setIsContactDialogOpen(false)
      contactForm.reset(defaultValues)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to create ICE contact. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const updateContactMutation = useMutation({
    mutationFn: (data: ContactFormValues) =>
      updateICEContact(editingContact?._id || '', {
        ...data,
        email: data.email ? data.email : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-contacts', companyId] })
      toast({
        title: 'Contact updated',
        description: 'The ICE contact has been updated successfully.',
        variant: 'success'
      })
      setIsContactDialogOpen(false)
      setEditingContact(null)
      contactForm.reset(defaultValues)
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update ICE contact. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => deleteICEContact(contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ice-contacts', companyId] })
      toast({
        title: 'Contact deleted',
        description: 'The ICE contact has been deleted successfully.',
        variant: 'success'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete ICE contact. Please try again.',
        variant: 'destructive'
      })
    }
  })

  const handleContactSubmit = (data: ContactFormValues) => {
    if (editingContact) {
      updateContactMutation.mutate(data)
    } else {
      createContactMutation.mutate(data)
    }
  }

  const handleEditContact = (contact: ICEContact) => {
    setEditingContact(contact)
    contactForm.reset({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      regions: contact.regions,
      priority: contact.priority || 1
    })
    setIsContactDialogOpen(true)
  }

  const handleDeleteContact = (contactId: string) => {
    setContactToDelete(contactId)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (contactToDelete) {
      deleteContactMutation.mutate(contactToDelete)
      setIsDeleteDialogOpen(false)
      setContactToDelete(null)
    }
  }

  const openContactDialog = () => {
    setEditingContact(null)
    contactForm.reset({
      name: '',
      phone: '',
      email: '',
      regions: [],
      priority: 1
    })
    setIsContactDialogOpen(true)
  }

  const getPriorityLabel = (priority?: number) => {
    switch (priority) {
      case 1:
        return 'Primary'
      case 2:
        return 'Secondary'
      case 3:
        return 'Tertiary'
      default:
        return 'Primary'
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-xl font-semibold'>ICE Contacts</h2>
          <p className='text-sm text-gray-500'>
            Manage emergency contacts for this company
          </p>
        </div>
        <div className='flex gap-2'>
          <Button
            onClick={openContactDialog}
            className='bg-primary hover:bg-primary/90'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Contact
          </Button>
        </div>
      </div>

      {isLoadingContacts || isFetching || isCompanyLoading ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className='h-48' />
          ))}
        </div>
      ) : contactsError || companyError ? (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>
              Error loading ICE contacts. Please try again later.
            </div>
          </div>
        </div>
      ) : contacts?.length === 0 ? (
        <div className='text-center py-12 border rounded-md'>
          <p className='text-gray-500'>
            No ICE contacts found. Add your first contact.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {contacts?.map((contact) => (
            <Card key={contact._id}>
              <CardContent className='p-6'>
                <div className='flex items-start gap-4'>
                  <Avatar className='h-16 w-16'>
                    {contact.imageUrl ? (
                      <AvatarImage
                        src={contact.imageUrl || '/placeholder.svg'}
                        alt={contact.name}
                      />
                    ) : null}
                    <AvatarFallback className='text-lg'>
                      {contact.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='flex sm:flex-row flex-col justify-between items-start'>
                      <div className='space-y-2'>
                        <h3 className='font-semibold'>{contact.name}</h3>
                        <div
                          className={`text-xs px-2 py-1 rounded-full w-fit ${
                            contact.priority === 1
                              ? 'bg-blue-100 text-blue-800'
                              : contact.priority === 2
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <p>{getPriorityLabel(contact.priority)}</p>
                        </div>
                        <p className='text-sm text-gray-500'>{contact.phone}</p>
                        {contact.email && (
                          <p className='text-sm text-gray-500'>
                            {contact.email}
                          </p>
                        )}
                      </div>
                      <div className='flex gap-1'>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleEditContact(contact)}
                          className='h-8 w-8'
                        >
                          <Pencil className='h-4 w-4' />
                          <span className='sr-only'>Edit</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => handleDeleteContact(contact._id)}
                          className='h-8 w-8 text-red-500 hover:text-red-600'
                        >
                          <Trash2 className='h-4 w-4' />
                          <span className='sr-only'>Delete</span>
                        </Button>
                      </div>
                    </div>
                    <div className='mt-2'>
                      <p className='text-xs text-gray-500 mb-1'>Regions:</p>
                      <div className='flex flex-wrap gap-1'>
                        {contact.regions.map((regionId) => {
                          const region = PROVINCES?.find(
                            (r) => r.value === regionId
                          )
                          return (
                            <span
                              key={regionId}
                              className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700'
                            >
                              {region?.label || regionId}
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Edit Contact' : 'Add New Contact'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={contactForm.handleSubmit(handleContactSubmit)}>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Name</Label>
                <Input
                  id='name'
                  {...contactForm.register('name')}
                  className={
                    contactForm.formState.errors.name ? 'border-red-500' : ''
                  }
                />
                {contactForm.formState.errors.name && (
                  <p className='text-sm text-red-500'>
                    {contactForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='phone'>Phone Number</Label>
                <Input
                  id='phone'
                  {...contactForm.register('phone')}
                  className={
                    contactForm.formState.errors.phone ? 'border-red-500' : ''
                  }
                />
                {contactForm.formState.errors.phone && (
                  <p className='text-sm text-red-500'>
                    {contactForm.formState.errors.phone.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email (Optional)</Label>
                <Input
                  id='email'
                  type='email'
                  {...contactForm.register('email')}
                  className={
                    contactForm.formState.errors.email ? 'border-red-500' : ''
                  }
                />
                {contactForm.formState.errors.email && (
                  <p className='text-sm text-red-500'>
                    {contactForm.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='priority'>Priority</Label>
                <Controller
                  name='priority'
                  control={contactForm.control}
                  render={({ field }) => (
                    <AutoComplete
                      id='priority'
                      options={ICE_CONTACT_PRIORITIES.map((priority) => ({
                        label: priority.label,
                        value: priority.value.toString()
                      }))}
                      placeholder='Select priority'
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(Number(value))}
                      error={contactForm.formState.errors.priority}
                    />
                  )}
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='regions'>Regions</Label>
                <Controller
                  name='regions'
                  control={contactForm.control}
                  render={({ field }) => (
                    <MultiSelect
                      id='ice-contact-regions'
                      options={
                        currentCompany && currentCompany.regions.length
                          ? currentCompany.regions.map((regionValue) => {
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
                      value={field.value.map((value) => ({
                        label:
                          PROVINCES.find((r) => r.value === value)?.label ||
                          value,
                        value
                      }))}
                      onChange={(selected) =>
                        field.onChange(selected.map((item) => item.value))
                      }
                      className={
                        contactForm.formState.errors.regions
                          ? 'border-red-500'
                          : ''
                      }
                    />
                  )}
                />
                {contactForm.formState.errors.regions && (
                  <p className='text-sm text-red-500 !mt-0'>
                    {contactForm.formState.errors.regions.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsContactDialogOpen(false)
                  setEditingContact(null)
                  contactForm.reset(defaultValues)
                }}
              >
                Cancel
              </Button>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90'
                disabled={
                  createContactMutation.isPending ||
                  updateContactMutation.isPending
                }
              >
                {createContactMutation.isPending ||
                updateContactMutation.isPending
                  ? 'Saving...'
                  : editingContact
                  ? 'Update Contact'
                  : 'Add Contact'}
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
              contact.
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
    </div>
  )
}
