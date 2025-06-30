import { AutoComplete } from '@/components/ui/autocomplete'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { GeofenceMap } from '@/components/map'
import {
  GeofenceData,
  CreateGeoFenceDto,
  GeoFenceGroup,
  GeoFence,
  CreateGeoFenceGroupDto
} from '@/types/geofence'
import {
  ArrowLeft,
  Circle,
  Eraser,
  FolderPlus,
  Pencil,
  Pentagon,
  Plus,
  Redo,
  Square,
  Star,
  Undo
} from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  createGeofence,
  createGeofenceGroup,
  getGeofenceGroups
} from '../../api/geofences'

export function GeofencePage() {
  const [mode, setMode] = useState('home') // 'home', 'addGeoFenceGroup', 'addGeofence', 'addSpecialGeofence'
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupDescription, setNewGroupDescription] = useState('')
  const [riskScore, setRiskScore] = useState(0)
  const [isSpecialGroup, setIsSpecialGroup] = useState(false)
  const [newGeofenceName, setNewGeofenceName] = useState('')
  const [newGeofenceDescription, setNewGeofenceDescription] = useState('')
  const [assignGroup, setAssignGroup] = useState('')
  const [specialTimer, setSpecialTimer] = useState(3) // 3,6,9,12,24
  const [geofences, setGeofences] = useState<GeofenceData[]>([])
  const [geoFenceGroups, setGeoFenceGroups] = useState<GeoFenceGroup[]>([])

  // Fetch geofence groups using React Query
  useQuery<GeoFenceGroup[]>({
    queryKey: ['geofenceGroups'],
    queryFn: async () => {
      try {
        const geofenceGroups = await getGeofenceGroups()
        console.log('geofenceGroups', geofenceGroups)
        setGeoFenceGroups(geofenceGroups)

        // Extract and format all geofence shapes for the map
        const allGeofenceShapes = geofenceGroups.flatMap((group) =>
          group.geoFencesDetails.flatMap((fence) =>
            fence.geoFenceShapes.map((shape) => ({
              ...shape,
              // Add a reference to the parent geofence/group for identification
              geofenceId: fence._id,
              groupId: fence.groupId!
            }))
          )
        )

        setGeofences(allGeofenceShapes)
        return geofenceGroups
      } catch (error) {
        console.error('Error fetching geofence groups:', error)
        return []
      }
    }
  })

  const handleGeofencesChange = (updatedGeofences: GeofenceData[]) => {
    setGeofences(updatedGeofences)
  }

  const handleSaveGeoFenceGroup = async () => {
    if (newGroupName.trim() !== '') {
      try {
        const groupData: CreateGeoFenceGroupDto = {
          name: newGroupName,
          description: newGroupDescription,
          riskScore: riskScore,
          isSpecialGroup: isSpecialGroup
        }

        await createGeofenceGroup(groupData)

        // Refresh the groups list
        const updatedGroups = await getGeofenceGroups()
        setGeoFenceGroups(updatedGroups)

        // Clear form after successful save
        setNewGroupName('')
        setNewGroupDescription('')
        setRiskScore(0)
        setIsSpecialGroup(false)
        setMode('home')
        setAssignGroup('')

        // Show success message
        alert('Geofence group saved successfully!')
      } catch (error: any) {
        // Show error message
        alert(error.response?.data?.message || 'Error saving geofence group')
      }
    }
  }

  const handleSaveGeofence = async () => {
    try {
      const geofenceData: CreateGeoFenceDto = {
        name: newGeofenceName,
        description: newGeofenceDescription,
        type: 'regular',
        ...(assignGroup && { groupId: assignGroup }),
        geoFenceShapes: geofences
      }

      await createGeofence(geofenceData)

      // Refresh the groups list to show new geofence
      const updatedGroups = await getGeofenceGroups()
      setGeoFenceGroups(updatedGroups)

      // Clear form and shapes after successful save
      setNewGeofenceName('')
      setNewGeofenceDescription('')
      setAssignGroup('')
      setGeofences([])
      setMode('home')

      // Show success message
      alert('Geofence saved successfully!')
    } catch (error: any) {
      // Show error message
      alert(error.response?.data?.message || 'Error saving geofence')
    }
  }

  const handleSaveSpecialGeofence = async () => {
    if (newGeofenceName.trim() !== '' && assignGroup !== '') {
      try {
        const geofenceData: CreateGeoFenceDto = {
          name: newGeofenceName,
          description: newGeofenceDescription,
          type: 'special',
          hour: specialTimer,
          groupId: assignGroup,
          geoFenceShapes: geofences
        }

        await createGeofence(geofenceData)

        // Refresh the groups list to show new special geofence
        const updatedGroups = await getGeofenceGroups()
        setGeoFenceGroups(updatedGroups)

        // Clear form after successful save
        setNewGeofenceName('')
        setNewGeofenceDescription('')
        setAssignGroup('')
        setSpecialTimer(3)
        setGeofences([])
        setMode('home')

        // Show success message
        alert('Special geofence saved successfully!')
      } catch (error: any) {
        // Show error message
        alert(error.response?.data?.message || 'Error saving special geofence')
      }
    }
  }

  const getLocationIcon = (riskScore: number, isSpecial: boolean) => {
    if (isSpecial) return '/icons/purple-location.svg'
    if (riskScore <= 30) return '/icons/green-location.svg'
    if (riskScore <= 60) return '/icons/orange-location.svg'
    return '/icons/red-location.svg'
  }

  return (
    <div className='bg-[#111827]'>
      {/* Main Layout */}
      <div className='flex !h-[calc(100vh-72px)]'>
        {/* Sidebar */}
        <aside className='w-80 bg-white text-black border-l border-primary p-4 overflow-y-auto'>
          <div className='flex items-center mb-4 gap-2'>
            {mode !== 'home' && (
              <ArrowLeft
                className='w-4 h-4 cursor-pointer hover:text-primary'
                onClick={() => setMode('home')}
              />
            )}
            <h2 className='text-[24px] font-bold'>
              {mode === 'addGeoFenceGroup'
                ? 'Add Geofence Group'
                : mode === 'addGeofence'
                ? 'Add Geofence'
                : mode === 'addSpecialGeofence'
                ? 'Add Special Geo Fence'
                : 'Geofences'}
            </h2>
          </div>

          {mode === 'home' && (
            <div className='mb-4'>
              <AutoComplete
                id='geofence-search'
                placeholder='Search geofence groups'
                options={geoFenceGroups.map((group) => ({
                  value: group._id,
                  label: group.name
                }))}
                value={assignGroup}
                onValueChange={(value) => {
                  setAssignGroup(value)
                }}
              />
            </div>
          )}

          {/* Geo Fence Groups */}
          {mode === 'home' &&
            geoFenceGroups
              .filter((group) =>
                assignGroup ? group._id === assignGroup : true
              )
              .map((group) => (
                <div
                  key={group._id}
                  className='bg-[#F9FAFB] rounded-lg p-4 mb-4 shadow'
                >
                  <div className='flex justify-between items-center mb-2'>
                    <span className='text-[18px] font-semibold'>
                      {group.name}
                    </span>
                    <span
                      className={`text-[20px] font-bold ${
                        group.isSpecial
                          ? 'text-[#9c37c8]'
                          : group.riskScore <= 30
                          ? 'text-green-500'
                          : group.riskScore <= 60
                          ? 'text-orange-400'
                          : 'text-red-500'
                      }`}
                    >
                      {group.riskScore}
                    </span>
                  </div>
                  <div className='flex flex-col gap-2 mt-2'>
                    {group.geoFencesDetails
                      ?.slice(0, 5)
                      .map((geo: GeoFence) => (
                        <div key={geo._id} className='flex items-center gap-2'>
                          <img
                            src={getLocationIcon(
                              group.riskScore,
                              geo.type === 'special'
                            )}
                            alt='location'
                            className='h-4 w-4'
                          />
                          <span className='text-[14px] text-black'>
                            {geo.name}
                          </span>
                          {geo.type === 'special' && geo.hour && (
                            <span className='text-[10px] text-[#9c37c8] ml-auto'>
                              {geo.hour}hr
                            </span>
                          )}
                        </div>
                      ))}
                    {group.geoFencesDetails &&
                      group.geoFencesDetails.length > 5 && (
                        <div className='text-[12px] text-gray-500 mt-1'>
                          +{group.geoFencesDetails.length - 5} more geofences
                        </div>
                      )}
                  </div>
                </div>
              ))}

          {/* Forms */}
          {mode === 'addGeoFenceGroup' && (
            <div className='flex flex-col gap-4'>
              {/* Name */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Name
                </label>
                <Input
                  type='text'
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none'
                />
              </div>
              {/* Description */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Description
                </label>
                <Textarea
                  rows={3}
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none resize-none'
                />
              </div>
              {/* Risk Score */}
              <div className='flex items-center justify-between'>
                <span className='text-[#1f2937] text-[14px] font-medium'>
                  Risk Score
                </span>
                <div className='flex items-end'>
                  <Input
                    type='number'
                    value={riskScore}
                    onChange={(e) => setRiskScore(parseInt(e.target.value))}
                    className='w-16 p-1 text-center text-[25px] font-bold text-[#a7a7a7] border border-[#9CA3AF] rounded-lg bg-white'
                  />
                  <span className='text-[#9ca3af] text-[17px] ml-2'>/ 100</span>
                </div>
              </div>
              {/* Special Group Toggle */}
              <div className='flex items-center justify-between mt-4'>
                <span className='text-[#1f2937] text-[14px] font-medium'>
                  Special Group
                </span>
                <div
                  className={`w-14 h-7 rounded-full flex items-center cursor-pointer px-1 ${
                    isSpecialGroup ? 'bg-primary' : 'bg-[#9CA3AF]'
                  }`}
                  onClick={() => setIsSpecialGroup(!isSpecialGroup)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      isSpecialGroup ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveGeoFenceGroup}>Save</Button>
            </div>
          )}

          {mode === 'addGeofence' && (
            <div className='flex flex-col gap-4'>
              {/* Normal Geo Fence */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Name
                </label>
                <Input
                  type='text'
                  value={newGeofenceName}
                  onChange={(e) => setNewGeofenceName(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none'
                />
              </div>

              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Description
                </label>
                <Textarea
                  value={newGeofenceDescription}
                  onChange={(e) => setNewGeofenceDescription(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none resize-none'
                />
              </div>

              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Assign to Geofence Group
                </label>
                <AutoComplete
                  id='geofence-group-select'
                  placeholder='Select group'
                  options={geoFenceGroups.map((group) => ({
                    value: group._id,
                    label: group.name
                  }))}
                  value={assignGroup}
                  onValueChange={(value) => {
                    setAssignGroup(value)
                  }}
                />
              </div>

              {/* Save */}
              <Button onClick={handleSaveGeofence}>Save</Button>
            </div>
          )}

          {/* Special Geo Fence Form */}
          {mode === 'addSpecialGeofence' && (
            <div className='flex flex-col gap-4'>
              {/* Name */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Name
                </label>
                <Input
                  type='text'
                  value={newGeofenceName}
                  onChange={(e) => setNewGeofenceName(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none'
                />
              </div>

              {/* Description */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Description
                </label>
                <Textarea
                  value={newGeofenceDescription}
                  onChange={(e) => setNewGeofenceDescription(e.target.value)}
                  className='w-full p-2 border border-[#E5E7EB] rounded-lg bg-white focus:outline-none resize-none'
                />
              </div>

              {/* Assign to Special Group */}
              <div>
                <label className='text-[#1f2937] text-[14px] font-medium mb-1 block'>
                  Assign to Special Geofence Group
                </label>
                <AutoComplete
                  id='geofence-group-select'
                  placeholder='Select group'
                  options={geoFenceGroups.map((group) => ({
                    value: group._id,
                    label: group.name
                  }))}
                  value={assignGroup}
                  onValueChange={(value) => {
                    setAssignGroup(value)
                  }}
                />
              </div>

              {/* Timer Selection Bar */}
              <div className='flex flex-col mt-4'>
                <div className='relative h-3 bg-[#9c37c8]/50 rounded-full mb-2'>
                  <div
                    style={{ width: `${(specialTimer / 24) * 100}%` }}
                    className='absolute left-0 top-0 h-full bg-[#9c37c8] rounded-full transition-all'
                  ></div>
                </div>
                <div className='flex justify-between text-xs text-gray-400'>
                  {[3, 6, 9, 12, 24].map((hour) => (
                    <div
                      key={hour}
                      className={`cursor-pointer ${
                        specialTimer === hour ? 'text-[#9c37c8] font-bold' : ''
                      }`}
                      onClick={() => setSpecialTimer(hour)}
                    >
                      {hour}hr
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <Button onClick={handleSaveSpecialGeofence}>Save</Button>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className='flex-1 p-4 bg-[#111827] relative flex flex-col'>
          {mode === 'home' && (
            <div className='flex gap-4 mb-4'>
              <Button
                onClick={() => setMode('addGeoFenceGroup')}
                className='bg-primary text-white py-2 px-4 rounded-lg flex items-center gap-2'
              >
                <FolderPlus className='h-5 w-5' />
                Add Geofence Group
              </Button>
              <Button
                onClick={() => setMode('addGeofence')}
                className='bg-primary text-white py-2 px-4 rounded-lg flex items-center gap-2'
              >
                <Plus className='h-5 w-5' />
                Add Geofence
              </Button>
              <Button
                onClick={() => setMode('addSpecialGeofence')}
                className='bg-[#9c37c8] text-white py-2 px-4 rounded-lg flex items-center gap-2'
              >
                <Star className='h-5 w-5' fill='white' />
                Add Special Geofence
              </Button>
            </div>
          )}

          <div className='flex-1 bg-gray-300 rounded-lg flex items-center justify-center text-black'>
            <GeofenceMap
              geofences={
                // If in add/edit mode and a group is selected, only show geofences from that group
                assignGroup
                  ? geofences.filter(
                      (geofence) => geofence.groupId === assignGroup
                    )
                  : geofences
              }
              onGeofencesChange={handleGeofencesChange}
              enableDrawing={mode !== 'home'}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
