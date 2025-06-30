import { Company } from './company'
import { Driver } from './driver'
import { Vehicle } from './vehicle'

export interface Event {
  _id: string
  company: Company
  companyId: string
  vehicle: Vehicle
  dateTime: string
  driver: Driver
  eventGroupType: string
  actionTaken: 'acknowledged' | 'suspended' | 'reallocated' | undefined
  createdAt: string
  updatedAt: string
}

export interface EventFilters {
  dateRange?: {
    from: Date | undefined
    to: Date | undefined
  }
  vehicleLicense?: string
  driverName?: string
  actionType?: string
  eventGroupType?: string
}
