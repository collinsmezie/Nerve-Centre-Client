import { EVENT_GROUP_TYPES } from '@/lib/constants'
import { useEffect } from 'react'

export function useEventWebSocket(onEvent: (event: any) => void) {
  useEffect(() => {
    // Simulate receiving events every 5 seconds
    const interval = setInterval(() => {
      const categories = EVENT_GROUP_TYPES.map((a) => a.value)
      // const randomCategory =
      //   categories[Math.floor(Math.random() * categories.length)]
      onEvent({
        _id: Math.random().toString(),
        companyId: '1',
        company: {
          companyName: 'Cybele Fleet',
          _id: '1',
          companyIdNo: '1234567890',
          companyAbbreviation: 'CF',
          legalPerson: 'John Doe',
          phone: '+27 82 123 4567',
          email: 'john.doe@example.com',
          industry: 'Transport',
          businessLicenseNumber: '1234567890',
          accountDepartmentPerson: 'John Doe',
          accountDepartmentName: 'Accounting Department',
          accountDepartmentEmail: 'accounting@example.com',
          regions: ['gauteng'],
          address: '123 Main St, Johannesburg',
          registeredCapital: '1000000',
          isActive: true,
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01'
        },
        vehicle: {
          _id: '1',
          companyId: '1',
          company: {
            companyName: 'Cybele Fleet',
            _id: '1',
            companyIdNo: '1234567890',
            companyAbbreviation: 'CF',
            legalPerson: 'John Doe',
            phone: '+27 82 123 4567',
            email: 'john.doe@example.com',
            industry: 'Transport',
            businessLicenseNumber: '1234567890',
            accountDepartmentPerson: 'John Doe',
            accountDepartmentName: 'Accounting Department',
            accountDepartmentEmail: 'accounting@example.com',
            regions: ['gauteng'],
            address: '123 Main St, Johannesburg',
            registeredCapital: '1000000',
            isActive: true,
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01'
          },
          assetId: 'ASSET-PHUQ3TVD5R',
          assetNumber: 'AN-224324764',
          vehicleCategory: 'forklift',
          subVehicleType: 'forklift',
          vehicleMaxSpeed: 120,
          engineType: 'petrol',
          vehicleMake: 'iveco',
          vehicleModel: 'r-5000',
          vehicleYear: 2025,
          vehicleRegisterNumber: '',
          licenseNumber: 'GP 234234',
          fleetNumber: '226',
          riskGroup: 'medium',
          showFleet: 'combination-of-both',
          vin: '32423423423',
          driven: 'self-propelled',
          engineNumber: '234 324',
          vehicleDescription: 'asd fasdf asd fasd fsadfd',
          tare: 0,
          gvm: 1344,
          nvc: 0,
          regAuthority: '',
          controlNumber: '',
          prDpCategories: {
            goods: true,
            passengers: false,
            dangerousGoods: false
          },
          vehicleColour: 'black',
          specialMarkings: '-',
          subGroup1: '2nd-group',
          region: 'kwazulu-natal',
          subGroup2: '2nd-group',
          cameraDevice: {
            exists: false,
            deviceId: ''
          },
          telematicsDevice: {
            exists: false,
            provider: 'pf',
            deviceId: ''
          },
          svrDevice: {
            exists: true,
            deviceId: '2342342342',
            caseNumber: ''
          },
          isActive: true,
          dateOfPurchase: new Date('2024-08-15T00:00:00.000Z').toISOString(),
          dateOfExpiry: new Date('2024-08-15T00:00:00.000Z').toISOString(),
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01'
        },
        dateTime: '2025-04-16T08:30:00Z',
        driver: {
          _id: '1',
          companyId: '1',
          company: {
            companyName: 'Cybele Fleet',
            _id: '1',
            companyIdNo: '1234567890',
            companyAbbreviation: 'CF',
            legalPerson: 'John Doe',
            phone: '+27 82 123 4567',
            email: 'john.doe@example.com',
            industry: 'Transport',
            businessLicenseNumber: '1234567890',
            accountDepartmentPerson: 'John Doe',
            accountDepartmentName: 'Accounting Department',
            accountDepartmentEmail: 'accounting@example.com',
            regions: ['gauteng'],
            address: '123 Main St, Johannesburg',
            registeredCapital: '1000000',
            isActive: true,
            createdAt: '2021-01-01',
            updatedAt: '2021-01-01'
          },
          driverNumber: 'DRIVER-QPI3H2A9II',
          gender: 'male',
          firstName: 'Daniel',
          lastName: 'Mabuza',
          phoneNumber: '234234234234',
          whatsappNumber: '234234234234',
          dateOfBirth: new Date('2025-05-16T00:00:00.000Z').toISOString(),
          email: '',
          idNumber: '324234 234 234',
          licenseNumber: '234234234',
          licenseCode: ['code-ec'],
          vehicleRestrictions: 3,
          driverRestrictions: 0,
          issuingAuthority: 'za',
          address: 'a asdf asf adf a',
          region: 'kwazulu-natal',
          nationality: 'South African',
          licenseValidFrom: new Date('2025-05-16T00:00:00.000Z').toISOString(),
          licenseValidTo: new Date('2025-05-16T00:00:00.000Z').toISOString(),
          prDpCategories: {
            goods: true,
            passengers: true,
            dangerousGoods: true
          },
          photoUrl:
            'https://nerve-centre-drivers-documents-sdlc.s3.af-south-1.amazonaws.com/324234 234 234/id-photo.jpg',
          licenseFrontUrl:
            'https://nerve-centre-drivers-documents-sdlc.s3.af-south-1.amazonaws.com/324234 234 234/license-front.jpg',
          licenseBackUrl:
            'https://nerve-centre-drivers-documents-sdlc.s3.af-south-1.amazonaws.com/324234 234 234/license-back.jpg',
          isActive: true,
          prDpExpiryDate: new Date('2025-05-16T00:00:00.000Z').toISOString(),
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01'
        },
        eventGroupType: 'HIJACKING',
        actionTaken: undefined,
        createdAt: '2025-04-16T08:35:00Z',
        updatedAt: '2025-04-16T08:40:00Z'
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [onEvent])
}
