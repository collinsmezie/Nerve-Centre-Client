import apiClient from "./api-client"
import { CreateGeoFenceDto, GeoFence, CreateGeoFenceGroupDto, GeoFenceGroup } from "../types/geofence"

export async function createGeofence(data: CreateGeoFenceDto): Promise<GeoFence> {
  const response = await apiClient.post(`/geofences/new`, data)
  return response.data
}

export async function createGeofenceGroup(data: CreateGeoFenceGroupDto): Promise<GeoFenceGroup> {
  const response = await apiClient.post(`/geofence-groups/new`, data)
  return response.data
}

export async function getGeofenceGroups(): Promise<GeoFenceGroup[]> {
  const response = await apiClient.get(`/geofence-groups/all`)
  return response.data
}
