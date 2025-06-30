import apiClient from './api-client'
import type { User, CreateUserDto, UpdateUserDto } from '@/types/user'

// Users
export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get(`/users/all`)
  return response.data
}

export async function fetchUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}

export async function createUser(data: CreateUserDto): Promise<User> {
  const response = await apiClient.post(`/users/new`, data)
  return response.data
}

export async function updateUser(
  id: string,
  data: UpdateUserDto
): Promise<User> {
  const response = await apiClient.patch(`/users/update/${id}`, data)
  return response.data
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`)
}
