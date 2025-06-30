import apiClient from './api-client'
import type {
  Company,
  CreateCompanyDto,
  UpdateCompanyDto
} from '@/types/company'

// Companies
export async function fetchCompanies(): Promise<Company[]> {
  const response = await apiClient.get(`/companies/all`)
  return response.data
}

export async function fetchCompany(id: string): Promise<Company> {
  const response = await apiClient.get(`/companies/${id}`)
  return response.data
}

export async function createCompany(data: CreateCompanyDto): Promise<Company> {
  const response = await apiClient.post(`/companies/new`, data)
  return response.data
}

export async function updateCompany(
  id: string,
  data: UpdateCompanyDto
): Promise<Company> {
  const response = await apiClient.patch(`/companies/update/${id}`, data)
  return response.data
}

export async function deleteCompany(id: string): Promise<void> {
  await apiClient.delete(`/companies/${id}`)
}
