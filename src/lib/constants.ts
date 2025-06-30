export const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export const PROVINCES = [
  { label: 'Eastern Cape', value: 'eastern-cape' },
  { label: 'Free State', value: 'free-state' },
  { label: 'Gauteng', value: 'gauteng' },
  { label: 'KwaZulu-Natal', value: 'kwazulu-natal' },
  { label: 'Limpopo', value: 'limpopo' },
  { label: 'Mpumalanga', value: 'mpumalanga' },
  { label: 'North West', value: 'north-west' },
  { label: 'Northern Cape', value: 'northern-cape' },
  { label: 'Western Cape', value: 'western-cape' }
]

export const ICE_CONTACT_PRIORITIES = [
  { label: 'Primary (1)', value: 1 },
  { label: 'Secondary (2)', value: 2 },
  { label: 'Tertiary (3)', value: 3 }
]

export const ROLES = [
  { label: 'Admin', value: 'admin' },
  { label: 'Bureau', value: 'bureau' }
]

export const EVENT_GROUP_TYPES = [
  { label: 'Hijacking', value: 'HIJACKING' },
  { label: 'Fatigue', value: 'FATIGUE' },
  { label: 'No Valid Driver', value: 'NO_VALID_DRIVER' },
  { label: 'Device Abnormality', value: 'DEVICE_ABNORMALITY' },
  { label: 'Power Abnormality', value: 'POWER_ABNORMALITY' },
  { label: 'Camera Abnormality', value: 'CAMERA_ABNORMALITY' },
  { label: 'Vehicle Abnormality', value: 'VEHICLE_ABNORMALITY' },
  { label: 'High Risk', value: 'HIGH_RISK' },
  { label: 'No Go Zone', value: 'NO_GO_ZONE' }
]
