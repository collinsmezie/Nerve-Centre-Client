import { Company } from './company'

export interface Vehicle {
  _id: string
  assetId: string
  assetNumber: string
  fleetNumber?: string
  licenseNumber: string
  vehicleMake: string
  vehicleCategory: string
  vehicleModel: string
  subVehicleType: string
  engineNumber?: string
  vehicleYear: number
  vehicleColour: string | undefined
  specialMarkings?: string
  vehicleMaxSpeed: number

  // Additional information
  engineType?: string
  dateOfPurchase?: string
  vehicleRegisterNumber?: string
  showFleet: 'fleet' | 'license-number' | 'combination-of-both'
  vin: string
  driven:
    | 'self-propelled'
    | 'trailer'
    | 'semi-trailer'
    | 'trailer-drawn-by-tractor'
  vehicleDescription?: string
  tare?: number
  gvm?: number
  nvc?: number
  regAuthority?: string
  dateOfExpiry?: string
  controlNumber?: string
  prDpCategories: {
    goods: boolean
    passengers: boolean
    dangerousGoods: boolean
  }

  // Company linked information
  company: Company
  companyId: string
  riskGroup: 'low' | 'medium' | 'high'
  region: string
  subGroup1?: '1st-group' | '2nd-group' | '3rd-group'
  subGroup2?: '1st-group' | '2nd-group' | '3rd-group'

  // Hardware devices
  cameraDevice: {
    exists: boolean
    provider?: 'pf' | 'icar' | undefined
    deviceId?: string
  }

  telematicsDevice: {
    exists: boolean
    provider?: 'pf' | 'teltonika' | undefined
    deviceId?: string
  }

  svrDevice: {
    exists: boolean
    deviceId?: string
    caseNumber?: string
  }

  createdAt: string
  updatedAt: string
  isActive: boolean
}

export type CreateVehicleDto = Omit<
  Vehicle,
  | 'id'
  | '_id'
  | 'company'
  | 'companyId'
  | 'assetId'
  | 'assetNumber'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>
export type UpdateVehicleDto = Partial<CreateVehicleDto>
