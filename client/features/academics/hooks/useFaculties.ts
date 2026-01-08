'use client';

import { useState, useCallback } from 'react';
import * as facultyApi from '../api/faculty.api';
import type { Faculty, FacultyCreateInput, FacultyUpdateInput, PaginatedResponse } from '../types';

interface UseFacultiesState {
  data: Faculty[];
  count: number;
  isLoading: boolean;
  error: string | null;
}

interface UseFacultiesReturn extends UseFacultiesState {
  fetchFaculties: (params?: facultyApi.FacultyListParams) => Promise<void>;
  createFaculty: (data: FacultyCreateInput) => Promise<Faculty>;
  updateFaculty: (id: number, data: FacultyUpdateInput) => Promise<Faculty>;
  deleteFaculty: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useFaculties(): UseFacultiesReturn {
  const [state, setState] = useState<UseFacultiesState>({
    data: [],
    count: 0,
    isLoading: false,
    error: null,
  });
  
  const [lastParams, setLastParams] = useState<facultyApi.FacultyListParams>({});

  const fetchFaculties = useCallback(async (params?: facultyApi.FacultyListParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setLastParams(params || {});
    
    try {
      const response: PaginatedResponse<Faculty> = await facultyApi.getFaculties(params);
      setState({
        data: response.results,
        count: response.count,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      const message = getErrorMessage(error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, []);

  const createFaculty = useCallback(async (data: FacultyCreateInput): Promise<Faculty> => {
    const faculty = await facultyApi.createFaculty(data);
    // Refresh list after create
    await fetchFaculties(lastParams);
    return faculty;
  }, [fetchFaculties, lastParams]);

  const updateFaculty = useCallback(async (id: number, data: FacultyUpdateInput): Promise<Faculty> => {
    const faculty = await facultyApi.updateFaculty(id, data);
    // Refresh list after update
    await fetchFaculties(lastParams);
    return faculty;
  }, [fetchFaculties, lastParams]);

  const deleteFaculty = useCallback(async (id: number): Promise<void> => {
    await facultyApi.deleteFaculty(id);
    // Refresh list after delete
    await fetchFaculties(lastParams);
  }, [fetchFaculties, lastParams]);

  const refetch = useCallback(async () => {
    await fetchFaculties(lastParams);
  }, [fetchFaculties, lastParams]);

  return {
    ...state,
    fetchFaculties,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    refetch,
  };
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: { message?: string }; detail?: string } } };
    return axiosError.response?.data?.error?.message 
      || axiosError.response?.data?.detail 
      || 'Có lỗi xảy ra';
  }
  return 'Có lỗi xảy ra';
}
