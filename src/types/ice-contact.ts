import { Company } from './company'

export interface ICEContact {
  _id: string
  company: Company
  companyId: string
  name: string
  imageUrl?: string
  phone: string
  email?: string | null
  regions: string[]
  priority?: number
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type CreateIceContactDto = Omit<
  ICEContact,
  | '_id'
  | 'id'
  | 'company'
  | 'companyId'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>
export type UpdateIceContactDto = Partial<CreateIceContactDto>
