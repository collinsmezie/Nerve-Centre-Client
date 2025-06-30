import { Company } from './company'

export interface Driver {
  _id: string
  company: Company
  companyId: string
  driverNumber: string

  // Basic information
  firstName: string
  lastName: string
  photoUrl?: string
  address?: string
  gender: 'male' | 'female' | 'other'
  nationality: string
  email?: string
  phoneNumber: string
  whatsappNumber?: string
  idNumber: string
  dateOfBirth: string
  region: string
  // License details
  licenseNumber: string
  licenseValidFrom: string
  licenseValidTo: string
  licenseCode: string[]
  issuingAuthority: string
  vehicleRestrictions?: number
  driverRestrictions?: number
  licenseFrontUrl?: string
  licenseBackUrl?: string

  prDpCategories: {
    goods: boolean
    passengers: boolean
    dangerousGoods: boolean
  }
  prDpExpiryDate?: string

  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type CreateDriverDto = Omit<
  Driver,
  | 'id'
  | '_id'
  | 'driverNumber'
  | 'company'
  | 'companyId'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
>
export type UpdateDriverDto = Partial<CreateDriverDto>
