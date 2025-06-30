import type { ICEContact } from '../types/ice-contact'
import apiClient from './api-client'
import type {
  CreateIceContactDto,
  UpdateIceContactDto
} from '@/types/ice-contact'

export const fetchICEContacts = async (
  companyId: string
): Promise<ICEContact[]> => {
  try {
    const response = await apiClient.get(`/ice-contacts/company/${companyId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching ICE contacts:', error)
    throw error
  }
}

export async function fetchICEContact(
  iceContactId: string
): Promise<ICEContact> {
  const response = await apiClient.get(`/ice-contacts/${iceContactId}`)
  return response.data
}

export const createICEContact = async (
  companyId: string,
  data: CreateIceContactDto
): Promise<ICEContact> => {
  try {
    const response = await apiClient.post(`/ice-contacts/new`, {
      ...data,
      companyId
    })
    return response.data
  } catch (error) {
    console.error('Error creating ICE contact:', error)
    throw error
  }
}

export const updateICEContact = async (
  id: string,
  data: UpdateIceContactDto
): Promise<ICEContact> => {
  try {
    const response = await apiClient.patch(`/ice-contacts/update/${id}`, data)
    return response.data
  } catch (error) {
    console.error('Error updating ICE contact:', error)
    throw error
  }
}

export const deleteICEContact = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/ice-contacts/${id}`)
  } catch (error) {
    console.error('Error deleting ICE contact:', error)
    throw error
  }
}
