/**
 * Class API functions
 */

import { apiClient } from '@/lib/api-client';
import type { 
  Class, 
  ClassCreateInput, 
  ClassUpdateInput,
  ClassMinimal,
  PaginatedResponse 
} from '../types';

const BASE_URL = '/v1/classes';

export interface ClassListParams {
  page?: number;
  search?: string;
  is_active?: boolean;
  major?: number;
  academic_year?: number;
  major__faculty?: number; // Filter by faculty
  ordering?: string;
}

/**
 * Get paginated list of classes
 */
export async function getClasses(params?: ClassListParams): Promise<PaginatedResponse<Class>> {
  const response = await apiClient.get<PaginatedResponse<Class>>(BASE_URL + '/', { params });
  return response.data;
}

/**
 * Get class by ID
 */
export async function getClassById(id: number): Promise<Class> {
  const response = await apiClient.get<Class>(`${BASE_URL}/${id}/`);
  return response.data;
}

/**
 * Create a new class
 */
export async function createClass(data: ClassCreateInput): Promise<Class> {
  const response = await apiClient.post<Class>(BASE_URL + '/', data);
  return response.data;
}

/**
 * Update class (partial)
 */
export async function updateClass(id: number, data: ClassUpdateInput): Promise<Class> {
  const response = await apiClient.patch<Class>(`${BASE_URL}/${id}/`, data);
  return response.data;
}

/**
 * Delete class
 */
export async function deleteClass(id: number): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}/`);
}

/**
 * Get classes for dropdown
 */
export async function getClassesDropdown(params?: { major?: number; academic_year?: number }): Promise<ClassMinimal[]> {
  const response = await apiClient.get<ClassMinimal[]>(`${BASE_URL}/dropdown/`, { params });
  return response.data;
}

/**
 * Get distinct academic years
 */
export async function getAcademicYears(): Promise<number[]> {
  const response = await apiClient.get<number[]>(`${BASE_URL}/academic_years/`);
  return response.data;
}
