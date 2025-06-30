import { formatOptions } from '@/lib/utils'
import apiClient from './api-client'
import type { Driver, CreateDriverDto, UpdateDriverDto } from '@/types/driver'
import axios from 'axios'

export const getDriverLicenseCodes = (): { label: string; value: string }[] => {
  try {
    return [
      { label: 'Code A - Motorcycles', value: 'code-a' },
      {
        label: 'Code B - Light motor vehicles (cars) under 3,500 kg',
        value: 'code-b'
      },
      {
        label:
          'Code C1 - Vehicles (between 3,500kg and 16,000kg) with trailer up to 750kg',
        value: 'code-c1'
      },
      {
        label:
          'Code C - Rigid vehicles (over 16,000kg) with trailer up to 750kg',
        value: 'code-c'
      },
      {
        label: 'Code EB - Light vehicle with a trailer up to 3500kg',
        value: 'code-eb'
      },
      {
        label:
          'Code EC1 - Ariticulated vehicle up to 16,000 or Rigid vehicle between 3,500kg and 16,000 with trailer above 750kg',
        value: 'code-ec1'
      },
      {
        label:
          'Code EC - Articulated or Rigid vehicles above 16,000kg with trailer above 750kg',
        value: 'code-ec'
      }
    ]
  } catch (error) {
    console.error('Error fetching driver license codes:', error)
    throw error
  }
}

export const getVehicleRestrictions = (): {
  label: string
  value: number
}[] => {
  try {
    return [
      { label: '0 (None)', value: 0 },
      { label: '1 (Automatic transmission)', value: 1 },
      { label: '2 (Electrically powered)', value: 2 },
      { label: '3 (Physically disabled)', value: 3 },
      { label: '4 (Bus above 16,000 kg GVM - on EC1 license)', value: 4 },
      { label: '5 (Tractor only - on B license)', value: 5 },
      { label: '7 (Mobile equipment only - on B license)', value: 7 }
    ]
  } catch (error) {
    console.error('Error fetching vehicle restrictions:', error)
    throw error
  }
}

export const getDriverRestrictions = (): {
  label: string
  value: number
}[] => {
  try {
    return [
      { label: '0 (None)', value: 0 },
      { label: '1 (Glasses/contact lenses)', value: 1 },
      { label: '2 (Artificial limb)', value: 2 }
    ]
  } catch (error) {
    console.error('Error fetching driver restrictions:', error)
    throw error
  }
}

export const getIssuingAuthorities = (): {
  label: string
  value: string
}[] => {
  try {
    return formatOptions(['ZA', 'Custom'])
  } catch (error) {
    console.error('Error fetching issuing authorities:', error)
    throw error
  }
}

// Drivers
export async function fetchDrivers(companyId: string): Promise<Driver[]> {
  const response = await apiClient.get(`/drivers/company/${companyId}`)
  return response.data
}

export async function fetchDriver(driverId: string): Promise<Driver> {
  const response = await apiClient.get(`/drivers/${driverId}`)
  return response.data
}

export async function createDriver(
  companyId: string,
  data: CreateDriverDto
): Promise<Driver> {
  const response = await apiClient.post(`/drivers/new`, {
    ...data,
    companyId
  })
  return response.data
}

export async function updateDriver(
  driverId: string,
  data: UpdateDriverDto
): Promise<Driver> {
  const response = await apiClient.patch(`/drivers/update/${driverId}`, {
    ...data,
    prDpExpiryDate: data.prDpExpiryDate || undefined
  })
  return response.data
}

export async function deleteDriver(driverId: string): Promise<void> {
  await apiClient.delete(`/drivers/${driverId}`)
}

export async function reassignDriver(
  driverId: string,
  newCompanyId: string
): Promise<Driver> {
  const response = await apiClient.patch(`/drivers/update/${driverId}`, {
    companyId: newCompanyId
  })
  return response.data
}

export async function getUploadUrl(
  driverId: string,
  type: 'license-front' | 'license-back' | 'id-photo'
): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const response = await apiClient.post(
    `/drivers/${driverId}/upload-url/${type}`
  )
  return response.data
}

export async function updateLicenseUrls({
  driverId,
  licenseFrontUrl,
  licenseBackUrl
}: {
  driverId: string
  licenseFrontUrl?: string
  licenseBackUrl?: string
}): Promise<{ uploadUrl: string; fileUrl: string; key: string }> {
  const response = await apiClient.post(`/drivers/${driverId}/license/urls`, {
    licenseFrontUrl,
    licenseBackUrl
  })
  return response.data
}

export async function uploadImage(
  url: string,
  file: File,
  fileUrl: string
): Promise<string> {
  try {
    await axios.put(url, file, {
      headers: {
        'Content-Type': file.type
      }
    })
    return fileUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}
