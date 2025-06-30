import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { deleteCompany, fetchCompanies } from '@/api/companies'
import { useAuth } from '@/context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
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
import { toast } from '@/hooks/use-toast'

export function CompaniesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isAdmin } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null)

  const {
    data: companies,
    isLoading,
    error
  } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  })

  const filteredCompanies = companies?.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const confirmDelete = () => {
    if (companyToDelete) {
      deleteMutation.mutate(companyToDelete)
      setIsDeleteDialogOpen(false)
      setCompanyToDelete(null)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (companyId: string) => deleteCompany(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast({
        title: 'Company deleted',
        description: 'The company has been deleted successfully.',
        variant: 'success'
      })
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to delete company. Please try again.',
        variant: 'destructive'
      })
    }
  })

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Companies</h1>
          <p className='text-muted-foreground'>
            Manage all client companies and their details
          </p>
        </div>
        {isAdmin && (
          <Button
            onClick={() => navigate('/companies/new')}
            className='bg-primary hover:bg-primary/90'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Company
          </Button>
        )}
      </div>

      <div className='flex items-center gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
          <Input
            type='search'
            placeholder='Search companies...'
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
      ) : error ? (
        <div className='rounded-md bg-red-50 p-4'>
          <div className='flex'>
            <div className='text-sm text-red-700'>
              Error loading companies. Please try again later.
            </div>
          </div>
        </div>
      ) : (
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Drivers</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className='w-[80px]'></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompanies?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className='h-24 text-center'>
                    No companies found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies?.map((company) => (
                  <TableRow
                    key={company._id}
                    className='cursor-pointer hover:bg-gray-50'
                    onClick={() => navigate(`/companies/${company._id}`)}
                  >
                    <TableCell className='font-medium'>
                      {company.companyName}
                    </TableCell>
                    <TableCell>{company.email}</TableCell>
                    <TableCell>{company.phone}</TableCell>
                    <TableCell>{company.assetCount}</TableCell>
                    <TableCell>{company.driverCount}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          company.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    {isAdmin && (
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
                                navigate(`/companies/${company._id}/edit`)
                              }}
                            >
                              <Edit className='mr-2 h-4 w-4' />
                              Edit
                            </DropdownMenuItem>
                            {isAdmin && (
                              <DropdownMenuItem
                                className='text-red-600'
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setIsDeleteDialogOpen(true)
                                  setCompanyToDelete(company._id)
                                }}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

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
    </div>
  )
}
