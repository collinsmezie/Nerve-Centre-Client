import type { Vehicle } from '../types/vehicle'
import type { CreateVehicleDto, UpdateVehicleDto } from '@/types/vehicle'
import apiClient from './api-client'
import { formatOptions } from '@/lib/utils'

export const getVehicleMakes = (): { label: string; value: string }[] => {
  try {
    return formatOptions([
      'Volvo',
      'Mercedes-Benz',
      'Scania',
      'MAN',
      'DAF',
      'Iveco',
      'Renault',
      'Toyota',
      'Ford',
      'Volkswagen'
    ])
  } catch (error) {
    console.error('Error fetching vehicle makes:', error)
    throw error
  }
}

export const getVehicleModels = (vehicleMake: string) => {
  try {
    const models: Record<string, { label: string; value: string }[]> = {
      volvo: formatOptions(['S-50', 'S-500']),
      'mercedes-benz': formatOptions(['R-50', 'R-500', 'R-5000']),
      scania: formatOptions(['R-50', 'R-500', 'R-5000']),
      man: formatOptions(['R-50', 'R-500', 'R-5000']),
      daf: formatOptions(['R-50', 'R-500', 'R-5000']),
      iveco: formatOptions(['R-50', 'R-500', 'R-5000']),
      renault: formatOptions(['R-50', 'R-500', 'R-5000']),
      toyota: formatOptions(['R-50', 'R-500', 'R-5000']),
      ford: formatOptions(['R-50', 'R-500', 'R-5000']),
      volkswagen: formatOptions(['R-50', 'R-500', 'R-5000'])
    }

    return models[vehicleMake] || []
  } catch (error) {
    console.error('Error fetching sub-vehicle categories:', error)
    throw error
  }
}

export const getEngineType = (): { label: string; value: string }[] => {
  try {
    return formatOptions([
      'Diesel',
      'Electric',
      'Hybrid',
      'Petrol',
      'Natural Gas'
    ])
  } catch (error) {
    console.error('Error fetching vehicle types:', error)
    throw error
  }
}

export const getVehicleCategories = (): { label: string; value: string }[] => {
  try {
    return formatOptions([
      'HVC',
      'Car',
      'Tractor',
      'Forklift',
      'Excavator',
      'Bike',
      'Bus',
      'Delivery van',
      'Bakkie',
      'Trailer'
    ])
  } catch (error) {
    console.error('Error fetching vehicle categories:', error)
    throw error
  }
}

export const getSubVehicleTypes = (vehicleCategory: string) => {
  try {
    const subTypes: Record<string, { label: string; value: string }[]> = {
      hvc: formatOptions(['Heavy Duty', 'Medium Duty', 'Light Duty']),
      car: formatOptions(['Sedan', 'SUV', 'Hatchback', 'Pickup']),
      tractor: formatOptions(['Tractor', 'Tractor with Trailer']),
      forklift: formatOptions(['Forklift', 'Forklift with Trailer']),
      excavator: formatOptions(['Excavator', 'Excavator with Trailer']),
      bike: formatOptions(['Bike']),
      bus: formatOptions(['Coach', 'City', 'School', 'Minibus']),
      deliveryVan: formatOptions(['Delivery van']),
      bakkie: formatOptions(['Bakkie']),
      trailer: formatOptions(['Flatbed', 'Box', 'Curtainsider', 'Tipper'])
    }

    return subTypes[vehicleCategory] || []
  } catch (error) {
    console.error('Error fetching sub-vehicle categories:', error)
    throw error
  }
}

export const getVehicleSpeedLimits = (): { label: string; value: number }[] => {
  try {
    return formatOptions(['120', '100', '80'], false).map((speed) => ({
      label: speed.label,
      value: parseInt(speed.value)
    }))
  } catch (error) {
    console.error('Error fetching vehicle speeds:', error)
    throw error
  }
}
export const getCameraProviders = (): { label: string; value: string }[] => {
  try {
    // In a real application, this would be an API call
    return formatOptions(['PF', 'ICAR'])
  } catch (error) {
    console.error('Error fetching camera providers:', error)
    throw error
  }
}

export const getTelematicsProviders = (): {
  label: string
  value: string
}[] => {
  try {
    // In a real application, this would be an API call
    return formatOptions(['PF', 'Teltonika'])
  } catch (error) {
    console.error('Error fetching telematics providers:', error)
    throw error
  }
}

export const getShowFleetOptions = (): { label: string; value: string }[] => {
  try {
    return formatOptions(['Fleet', 'License Number', 'Combination of Both'])
  } catch (error) {
    console.error('Error fetching show fleet options:', error)
    throw error
  }
}

export const getDrivenOptions = (): { label: string; value: string }[] => {
  try {
    return formatOptions([
      'Self-Propelled',
      'Trailer',
      'Semi-Trailer',
      'Trailer Drawn by Tractor'
    ])
  } catch (error) {
    console.error('Error fetching driven options:', error)
    throw error
  }
}

export const getVehicleColours = (): { label: string; value: string }[] => {
  try {
    return formatOptions([
      'Blue',
      'Yellow',
      'Black',
      'White',
      'Green',
      'Kelly',
      'Other'
    ])
  } catch (error) {
    console.error('Error fetching vehicle colours:', error)
    throw error
  }
}

export const getSubGroupOptions = (): { label: string; value: string }[] => {
  try {
    return formatOptions(['1st Group', '2nd Group', '3rd Group'])
  } catch (error) {
    console.error('Error fetching sub group options:', error)
    throw error
  }
}

export const getRiskGroupOptions = (): { label: string; value: string }[] => {
  try {
    return formatOptions(['Low', 'Medium', 'High'])
  } catch (error) {
    console.error('Error fetching risk group options:', error)
    throw error
  }
}
// // Vehicles
export async function fetchVehicles(companyId: string): Promise<Vehicle[]> {
  const response = await apiClient.get(`/assets/company/${companyId}`)
  return response.data
}

export async function fetchVehicle(vehicleId: string): Promise<Vehicle> {
  const response = await apiClient.get(`/assets/${vehicleId}`)
  return response.data
}

export async function createVehicle(
  companyId: string,
  data: CreateVehicleDto
): Promise<Vehicle> {
  const response = await apiClient.post(`/assets/new`, {
    ...data,
    companyId,
    dateOfPurchase: data.dateOfPurchase || undefined,
    dateOfExpiry: data.dateOfExpiry || undefined
  })
  return response.data
}

export async function updateVehicle(
  vehicleId: string,
  data: UpdateVehicleDto
): Promise<Vehicle> {
  const response = await apiClient.patch(`/assets/update/${vehicleId}`, {
    ...data,
    dateOfPurchase: data.dateOfPurchase || undefined,
    dateOfExpiry: data.dateOfExpiry || undefined
  })
  return response.data
}

export async function deleteVehicle(vehicleId: string): Promise<void> {
  await apiClient.delete(`/assets/${vehicleId}`)
}

export async function reassignVehicle(
  vehicleId: string,
  newCompanyId: string
): Promise<Vehicle> {
  const response = await apiClient.patch(`/assets/update/${vehicleId}`, {
    companyId: newCompanyId
  })
  return response.data
}
