/**
 * Major API functions
 */

import { apiClient } from '@/lib/api-client';
import type { 
  Major, 
  MajorMinimal, 
  MajorCreateInput, 
  MajorUpdateInput,
  PaginatedResponse 
} from '../types';

const BASE_URL = '/v1/majors';

export interface MajorListParams {
  page?: number;
  search?: string;
  is_active?: boolean;
  faculty?: number; // Filter by faculty
  ordering?: string;
}

/**
 * Get paginated list of majors
 */
export async function getMajors(params?: MajorListParams): Promise<PaginatedResponse<Major>> {
  const response = await apiClient.get<PaginatedResponse<Major>>(BASE_URL + '/', { params });
  return response.data;
}

/**
 * Get major by ID
 */
export async function getMajorById(id: number): Promise<Major> {
  const response = await apiClient.get<Major>(`${BASE_URL}/${id}/`);
  return response.data;
}

/**
 * Create a new major
 */
export async function createMajor(data: MajorCreateInput): Promise<Major> {
  const response = await apiClient.post<Major>(BASE_URL + '/', data);
  return response.data;
}

/**
 * Update major (partial)
 */
export async function updateMajor(id: number, data: MajorUpdateInput): Promise<Major> {
  const response = await apiClient.patch<Major>(`${BASE_URL}/${id}/`, data);
  return response.data;
}

/**
 * Delete major
 */
export async function deleteMajor(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}/`);
}

/**
 * Get majors for dropdown
 */
export async function getMajorsDropdown(facultyId?: number): Promise<MajorMinimal[]> {
  const params: { faculty?: number } = {};
  if (facultyId) params.faculty = facultyId;
  
  const response = await apiClient.get<MajorMinimal[]>(`${BASE_URL}/dropdown/`, { params });
  return response.data;
}

// Export object for useResource
export const majorApi = {
    list: getMajors,
    create: createMajor,
    update: updateMajor,
    delete: deleteMajor,
    getById: getMajorById,
    getDropdown: getMajorsDropdown,
};
