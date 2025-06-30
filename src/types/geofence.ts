export type CircleData = {
  id: string
  type: 'circle'
  center: google.maps.LatLngLiteral
  radius: number
  groupId: string
}

export type PolygonData = {
  id: string
  type: 'polygon'
  paths: google.maps.LatLngLiteral[]
  groupId: string
}

export type GeofenceData = CircleData | PolygonData

export interface LatLng {
  lat: number
  lng: number
}

export interface GeoFenceShapeCircle {
  id: string
  type: 'circle'
  center: LatLng
  radius: number
}

export interface GeoFenceShapePolygon {
  id: string
  type: 'polygon'
  paths: LatLng[]
}

export type GeoFenceShape = GeoFenceShapeCircle | GeoFenceShapePolygon

export interface CreateGeoFenceGroupDto {
  name: string
  description: string
  riskScore: number
  isSpecialGroup: boolean
}

export interface GeoFenceGroup {
  _id: string
  name: string
  description: string
  riskScore: number
  isSpecial: boolean
  createdAt: string
  updatedAt: string
  geoFencesDetails: GeoFence[]
}

export interface CreateGeoFenceDto {
  name: string
  description: string
  type: 'regular' | 'special'
  hour?: number
  groupId?: string
  geoFenceShapes: GeoFenceShape[]
}

export interface GeoFence {
  _id: string
  name: string
  description: string
  type: 'regular' | 'special'
  hour?: number
  groupId?: string
  geoFenceShapes: GeoFenceShape[]
  createdAt: string
  updatedAt: string
}
