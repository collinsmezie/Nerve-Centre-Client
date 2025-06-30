import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchCompanies } from '@/api/companies'
import { fetchVehicles } from '@/api/vehicles'
import { Company } from '@/types/company'
import { AutoComplete } from '@/components/ui/autocomplete'
import { Switch } from '@/components/ui/switch'
import { fetchICEContacts } from '@/api/ice-contacts'
import type { ICEContact } from '@/types/ice-contact'
import { camelCaseString, cn } from '@/lib/utils'
import { LiveViewMap } from '@/components/map'

export function LiveViewPage() {
  const [expandedClients, setExpandedClients] = useState<
    Record<string, boolean>
  >({})
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>(
    {}
  )
  const [cameraWidth, setCameraWidth] = useState(50)
  const [selectedVehicle, setSelectedVehicle] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fetch companies
  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery({
    queryKey: ['companies'],
    queryFn: fetchCompanies
  })

  // Fetch ICE contacts for all companies
  const { data: iceContacts = {}, isLoading: isLoadingIceContacts } = useQuery({
    queryKey: ['iceContacts', companies],
    queryFn: async () => {
      const iceMap: Record<string, ICEContact[]> = {}
      await Promise.all(
        companies.map(async (company) => {
          try {
            const contacts = await fetchICEContacts(company._id)
            iceMap[company._id] = contacts
          } catch (err) {
            console.error(
              `Failed to fetch ICE contacts for ${company.companyName}`,
              err
            )
            iceMap[company._id] = []
          }
        })
      )
      return iceMap
    },
    enabled: companies.length > 0
  })

  // Fetch vehicles for all companies
  const { data: companyVehicles = {}, isLoading: isLoadingVehicles } = useQuery(
    {
      queryKey: ['vehicles', companies],
      queryFn: async () => {
        const allVehicles: Record<string, any[]> = {}
        await Promise.all(
          companies.map(async (company) => {
            try {
              const vehicles = await fetchVehicles(company._id)
              allVehicles[company._id] = vehicles
            } catch (err) {
              console.error(
                `Failed to fetch vehicles for ${company.companyName}`,
                err
              )
              allVehicles[company._id] = []
            }
          })
        )
        return allVehicles
      },
      enabled: companies.length > 0
    }
  )

  // Combine loading states
  const loading =
    isLoadingCompanies || isLoadingIceContacts || isLoadingVehicles

  // Setup resizer functionality - this is a UI effect, not a data fetch,
  // so we keep it as a regular useEffect
  useEffect(() => {
    const resizer = document.getElementById('dragDivider')
    const container = document.getElementById('resizableRow')
    const camera = document.getElementById('cameraPanel')
    const map = document.getElementById('mapPanel')

    let isDragging = false
    const startDrag = () => (isDragging = true)
    const stopDrag = () => (isDragging = false)
    const doDrag = (e: MouseEvent) => {
      if (!isDragging || !container) return
      const rect = container.getBoundingClientRect()
      const offset = e.clientX - rect.left
      const percent = (offset / rect.width) * 100
      if (percent > 20 && percent < 80) {
        if (camera) camera.style.width = `${percent}%`
        if (map) map.style.width = `${100 - percent}%`
      }
    }

    resizer?.addEventListener('mousedown', startDrag)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('mousemove', doDrag)

    return () => {
      resizer?.removeEventListener('mousedown', startDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('mousemove', doDrag)
    }
  }, [])

  const toggleClient = (clientName: string) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientName]: !prev[clientName]
    }))
  }

  const toggleVehicleType = (client: string, type: string) => {
    const key = `${client}_${type}`
    setExpandedTypes((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const expandAllForClient = (client: string, types: { type: string }[]) => {
    const newState: Record<string, boolean> = { ...expandedTypes }
    types.forEach(({ type }) => {
      newState[`${client}_${type}`] = true
    })
    setExpandedClients((prev) => ({
      ...prev,
      [client]: true
    }))
    setExpandedTypes(newState)
  }

  const closeAllForClient = (client: string, types: { type: string }[]) => {
    const newState: Record<string, boolean> = { ...expandedTypes }
    types.forEach(({ type }) => {
      newState[`${client}_${type}`] = false
    })
    setExpandedClients((prev) => ({
      ...prev,
      [client]: false
    }))
    setExpandedTypes(newState)
  }

  const isClientFullyExpanded = (client: string, types: { type: string }[]) => {
    if (!expandedClients[client]) return false

    return types.every(
      ({ type }) => expandedTypes[`${client}_${type}`] === true
    )
  }

  return (
    <div className='bg-[#111827]'>
      <div className='flex !h-[calc(100vh-72px)]'>
        <aside className='md:w-80 md:block hidden bg-white text-black border-r border-primary p-4 overflow-y-auto'>
          <div className='mb-4'>
            <AutoComplete
              id='client-search'
              placeholder='Search clients'
              options={companies.map((client) => ({
                value: client._id,
                label: client.companyName
              }))}
              value={searchTerm}
              onValueChange={(value) => setSearchTerm(value)}
            />
          </div>
          {loading ? (
            <p className='text-gray-400 text-sm'>Loading companies...</p>
          ) : (
            companies
              .filter((client) =>
                searchTerm
                  ? client.companyName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    client._id === searchTerm
                  : true
              )
              .map((client) => {
                const isClientExpanded =
                  expandedClients[client.companyName] || false
                const rawVehicles = companyVehicles[client._id] || []

                const vehicleList = rawVehicles.reduce(
                  (acc: any, vehicle: any) => {
                    const type = vehicle.vehicleCategory || 'Unknown'
                    const reg = vehicle.licenseNumber || 'Unregistered'
                    if (!acc[type]) acc[type] = []
                    acc[type].push(reg)
                    return acc
                  },
                  {}
                )

                const groupedVehicles = Object.entries(vehicleList).map(
                  ([type, registrations]) => ({
                    type,
                    registrations: registrations as string[]
                  })
                )

                return (
                  <div key={client._id} className='mb-4'>
                    <div
                      className='flex items-center justify-between cursor-pointer mb-1 space-x-2'
                      onClick={() => toggleClient(client.companyName)}
                    >
                      <span className='font-bold text-primary'>
                        {client.companyName}
                      </span>
                      {isClientFullyExpanded(
                        client.companyName,
                        groupedVehicles
                      ) ? (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            closeAllForClient(
                              client.companyName,
                              groupedVehicles
                            )
                          }}
                          className='flex items-center gap-1 text-xs text-gray-400 hover:underline cursor-pointer'
                        >
                          <div className='w-3 h-3 rounded-full border border-gray-400 bg-gray-400' />
                          Close All
                        </div>
                      ) : (
                        <div
                          onClick={(e) => {
                            e.stopPropagation()
                            expandAllForClient(
                              client.companyName,
                              groupedVehicles
                            )
                          }}
                          className='flex items-center gap-1 text-xs text-gray-400 hover:underline cursor-pointer'
                        >
                          <div className='w-3 h-3 rounded-full border border-gray-400' />
                          Show All
                        </div>
                      )}
                    </div>
                    {isClientExpanded &&
                      groupedVehicles.map(({ type, registrations }) => {
                        const key = `${client.companyName}_${type}`
                        const isTypeExpanded = expandedTypes[key] || false
                        return (
                          <div key={type} className='ml-4'>
                            <div
                              className='cursor-pointer text-sm font-semibold text-gray-700 mb-1'
                              onClick={() =>
                                toggleVehicleType(client.companyName, type)
                              }
                            >
                              ▸ {camelCaseString(type)}
                            </div>
                            {isTypeExpanded && (
                              <div
                                className={cn(
                                  'ml-5 flex flex-col gap-1 text-gray-600 text-sm'
                                )}
                              >
                                {registrations.map((reg: string) => (
                                  <ul
                                    key={reg}
                                    className='pl-2 cursor-pointer hover:text-primary list-disc list-inside'
                                    onClick={() => {
                                      const fullVehicle = rawVehicles.find(
                                        (v) => v.licenseNumber === reg
                                      )
                                      if (fullVehicle)
                                        setSelectedVehicle(fullVehicle)
                                    }}
                                  >
                                    <li
                                      className={cn(
                                        selectedVehicle?.licenseNumber === reg
                                          ? 'text-primary'
                                          : ''
                                      )}
                                    >
                                      {reg}
                                    </li>
                                  </ul>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                  </div>
                )
              })
          )}
        </aside>

        <div className='flex-1 p-4 flex flex-col gap-4 overflow-hidden'>
          <div className='flex gap-2 h-[65%]' id='resizableRow'>
            <div
              id='cameraPanel'
              style={{ width: `${cameraWidth}%` }}
              className='bg-white rounded-lg overflow-y-auto p-4 text-black'
            >
              <div className='grid grid-cols-2 gap-4'>
                {Array.from({ length: 8 }, (_, i) => (
                  <div
                    key={i}
                    className='bg-gray-300 rounded-lg flex items-center justify-center text-black'
                    style={{ aspectRatio: '294 / 152' }}
                  >
                    Camera {i + 1}
                  </div>
                ))}
              </div>
            </div>
            <div id='dragDivider' className='w-1 bg-primary cursor-ew-resize' />
            <div
              id='mapPanel'
              style={{ width: `${100 - cameraWidth}%` }}
              className='bg-white rounded-lg p-4 flex items-center justify-center text-black'
            >
              <div className='w-full h-full bg-gray-200 rounded-lg flex items-center justify-center'>
                <LiveViewMap
                  currentLocation={
                    selectedVehicle
                      ? {
                          lat: -33.9249 + Math.random() * 0.02,
                          lng: 18.4241 + Math.random() * 0.02
                        }
                      : undefined
                  }
                >
                  {selectedVehicle && (
                    <div className='absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-10'>
                      <h3 className='font-medium text-sm'>Current Location</h3>
                      <p className='text-xs text-gray-500'>
                        Lat: {(-33.9249 + Math.random() * 0.02).toFixed(4)}
                      </p>
                      <p className='text-xs text-gray-500'>
                        Lng: {(18.4241 + Math.random() * 0.02).toFixed(4)}
                      </p>
                    </div>
                  )}
                </LiveViewMap>
              </div>
            </div>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-[250px] overflow-y-auto'>
            <div className='flex-1 bg-white text-black rounded-lg p-4 flex flex-col overflow-hidden min-h-[250px]'>
              <h3 className='text-lg font-semibold mb-4'>Vehicle Details</h3>

              {selectedVehicle ? (
                <div className='flex-1 overflow-y-auto pr-2'>
                  <div className='grid grid-cols-2 gap-x-8 gap-y-2 mb-4 text-sm'>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 font-medium'>Make</span>
                      <span className='text-black'>
                        {camelCaseString(selectedVehicle.vehicleMake) || 'N/A'}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 font-medium'>Model</span>
                      <span className='text-black'>
                        {camelCaseString(selectedVehicle.vehicleModel) || 'N/A'}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 font-medium'>Type</span>
                      <span className='text-black'>
                        {camelCaseString(selectedVehicle.vehicleCategory) ||
                          'N/A'}
                      </span>
                    </div>
                    <div className='flex flex-col'>
                      <span className='text-gray-500 font-medium'>License</span>
                      <span className='text-black'>
                        {selectedVehicle.licenseNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className='flex items-center justify-between gap-4 w-full'>
                    <div className='flex flex-col items-center'>
                      <Switch
                        name='Camera'
                        checked={!!selectedVehicle.cameraDevice?.exists}
                      />
                      <p className='text-muted-foreground text-sm mt-1'>
                        Camera
                      </p>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Switch
                        name='Telematics'
                        checked={!!selectedVehicle.telematicsDevice?.exists}
                      />
                      <p className='text-muted-foreground text-sm mt-1'>
                        Telematics
                      </p>
                    </div>
                    <div className='flex flex-col items-center'>
                      <Switch
                        name='SVR'
                        checked={!!selectedVehicle.svrDevice?.exists}
                      />
                      <p className='text-muted-foreground text-sm mt-1'>SVR</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-gray-400 text-sm'>
                  Select a vehicle to view details.
                </div>
              )}
            </div>

            <div className='flex-1 bg-white text-black rounded-lg p-4 flex flex-col overflow-hidden min-h-[250px]'>
              {/* Linked Driver */}
              <h3 className='text-lg font-semibold mb-2'>Linked Driver</h3>
              <div className='flex items-center bg-[#F9FAFB] rounded-lg p-4 shadow-md'>
                <div className='w-14 h-14 bg-gray-300 rounded-full flex-shrink-0 mr-4' />
                <div className='flex flex-col'>
                  <span className='font-semibold'>John Mokoena</span>
                  <span className='text-primary text-sm'>Driver</span>
                  <span className='text-gray-600 text-sm'>+27 82 123 4567</span>
                </div>
              </div>
            </div>

            {/* ICE Contacts */}
            <div className='flex-1 bg-white text-black rounded-lg p-4 flex flex-col overflow-hidden min-h-[250px]'>
              <h3 className='text-lg font-semibold mb-4'>ICE Contacts</h3>
              <div className='flex-1 flex flex-col gap-4 overflow-y-auto pr-2'>
                {selectedVehicle ? (
                  (iceContacts[selectedVehicle.companyId] || []).length > 0 ? (
                    iceContacts[selectedVehicle.companyId].map((contact) => (
                      <div
                        key={contact._id}
                        className='flex items-center bg-[#F9FAFB] rounded-lg p-4 shadow-md'
                      >
                        <div className='w-14 h-14 bg-gray-300 rounded-full flex-shrink-0 mr-4' />
                        <div className='flex flex-col'>
                          <span className='font-semibold'>{contact.name}</span>
                          <span className='text-primary text-sm'>
                            Priority {contact.priority}
                          </span>
                          <span className='text-gray-600 text-sm'>
                            {contact.phone || 'No number'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className='text-gray-500 text-sm'>
                      No ICE contacts found.
                    </p>
                  )
                ) : (
                  <p className='text-gray-400 text-sm'>
                    Select a vehicle to view ICE contacts.
                  </p>
                )}
              </div>
            </div>

            {/* Device Attributes */}
            <div className='lg:col-span-3 bg-white text-black rounded-lg p-4 flex flex-col overflow-hidden min-h-[250px]'>
              <h3 className='text-lg font-semibold mb-4'>Device Attributes</h3>
              <div className='flex-1 bg-[#F9FAFB] rounded-lg flex flex-col overflow-hidden'>
                <div className='flex'>
                  <div className='flex-1 bg-primary text-white p-2 text-center font-semibold rounded-tl-lg'>
                    Telematics
                  </div>
                  <div className='flex-1 bg-primary text-white p-2 text-center font-semibold'>
                    SVR
                  </div>
                  <div className='flex-1 bg-primary text-white p-2 text-center font-semibold rounded-tr-lg'>
                    Video
                  </div>
                </div>
                <div className='flex-1 overflow-y-auto'>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} className='flex'>
                      <div className='flex-1 p-2 border-t border-gray-200 text-center bg-white'>
                        Field {i + 1}
                      </div>
                      <div className='flex-1 p-2 border-t border-gray-200 text-center bg-white'>
                        Value {i + 1}
                      </div>
                      <div className='flex-1 p-2 border-t border-gray-200 text-center bg-white'>
                        Data {i + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
