/**
 * Faculty API functions
 */

import { apiClient } from '@/lib/api-client';
import type { 
  Faculty, 
  FacultyMinimal, 
  FacultyCreateInput, 
  FacultyUpdateInput,
  PaginatedResponse 
} from '../types';

const BASE_URL = '/v1/faculties';

export interface FacultyListParams {
  page?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

/**
 * Get paginated list of faculties
 */
export async function getFaculties(params?: FacultyListParams): Promise<PaginatedResponse<Faculty>> {
  const response = await apiClient.get<PaginatedResponse<Faculty>>(BASE_URL + '/', { params });
  return response.data;
}

/**
 * Get faculty by ID
 */
export async function getFacultyById(id: number): Promise<Faculty> {
  const response = await apiClient.get<Faculty>(`${BASE_URL}/${id}/`);
  return response.data;
}

/**
 * Create a new faculty
 */
export async function createFaculty(data: FacultyCreateInput): Promise<Faculty> {
  const response = await apiClient.post<Faculty>(BASE_URL + '/', data);
  return response.data;
}

/**
 * Update faculty (partial)
 */
export async function updateFaculty(id: number, data: FacultyUpdateInput): Promise<Faculty> {
  const response = await apiClient.patch<Faculty>(`${BASE_URL}/${id}/`, data);
  return response.data;
}

/**
 * Delete faculty
 */
export async function deleteFaculty(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}/`);
}

/**
 * Get faculties for dropdown
 */
export async function getFacultiesDropdown(): Promise<FacultyMinimal[]> {
  const response = await apiClient.get<FacultyMinimal[]>(`${BASE_URL}/dropdown/`);
  return response.data;
}
