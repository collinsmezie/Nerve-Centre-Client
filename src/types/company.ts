export interface Company {
  _id: string
  companyIdNo: string
  companyName: string
  companyAbbreviation: string
  legalPerson: string
  phone: string
  email: string
  industry: string
  businessLicenseNumber: string
  accountDepartmentPerson: string
  accountDepartmentName: string
  accountDepartmentEmail: string
  vatNumber?: string
  regions: string[]
  address: string
  registeredCapital: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  assetCount?: number
  driverCount?: number
  deviceCount?: number
  activeDeviceCount?: number
}

export type CreateCompanyDto = Omit<
  Company,
  | 'id'
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | 'isActive'
  | 'assetCount'
  | 'driverCount'
  | 'deviceCount'
  | 'activeDeviceCount'
>

export type UpdateCompanyDto = Partial<CreateCompanyDto>
