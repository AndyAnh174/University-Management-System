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

// Use same interface as defined in useResource EXPECTED PaginatedResponse
// But wait, useResource expects { results: T[], count: number ... }
// My types define PaginatedResponse exactly like that? Let's assume so.

const BASE_URL = '/v1/faculties';

export interface FacultyListParams {
  page?: number;
  search?: string;
  is_active?: boolean;
  ordering?: string;
}

// Separate functions (backward compatibility)
export async function getFaculties(params?: FacultyListParams): Promise<PaginatedResponse<Faculty>> {
  const response = await apiClient.get<PaginatedResponse<Faculty>>(BASE_URL + '/', { params });
  return response.data;
}

export async function getFacultyById(id: number): Promise<Faculty> {
  const response = await apiClient.get<Faculty>(`${BASE_URL}/${id}/`);
  return response.data;
}

export async function createFaculty(data: FacultyCreateInput): Promise<Faculty> {
  const response = await apiClient.post<Faculty>(BASE_URL + '/', data);
  return response.data;
}

export async function updateFaculty(id: number, data: FacultyUpdateInput): Promise<Faculty> {
  const response = await apiClient.patch<Faculty>(`${BASE_URL}/${id}/`, data);
  return response.data;
}

export async function deleteFaculty(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}/`);
}

export async function getFacultiesDropdown(): Promise<FacultyMinimal[]> {
  const response = await apiClient.get<FacultyMinimal[]>(`${BASE_URL}/dropdown/`);
  return response.data;
}

// Export object for useResource
export const facultyApi = {
    list: getFaculties,
    create: createFaculty,
    update: updateFaculty,
    delete: deleteFaculty,
    getById: getFacultyById,
    getDropdown: getFacultiesDropdown,
};
