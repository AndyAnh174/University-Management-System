'use client';

import { useState, useCallback } from 'react';
import * as classApi from '../api/class.api';
import type { Class, ClassCreateInput, ClassUpdateInput, PaginatedResponse } from '../types';

interface UseClassesState {
  data: Class[];
  count: number;
  isLoading: boolean;
  error: string | null;
}

interface UseClassesReturn extends UseClassesState {
  fetchClasses: (params?: classApi.ClassListParams) => Promise<void>;
  createClass: (data: ClassCreateInput) => Promise<Class>;
  updateClass: (id: number, data: ClassUpdateInput) => Promise<Class>;
  deleteClass: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useClasses(): UseClassesReturn {
  const [state, setState] = useState<UseClassesState>({
    data: [],
    count: 0,
    isLoading: false,
    error: null,
  });
  
  const [lastParams, setLastParams] = useState<classApi.ClassListParams>({});

  const fetchClasses = useCallback(async (params?: classApi.ClassListParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setLastParams(params || {});
    
    try {
      const response: PaginatedResponse<Class> = await classApi.getClasses(params);
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

  const createClass = useCallback(async (data: ClassCreateInput): Promise<Class> => {
    const classObj = await classApi.createClass(data);
    await fetchClasses(lastParams);
    return classObj;
  }, [fetchClasses, lastParams]);

  const updateClass = useCallback(async (id: number, data: ClassUpdateInput): Promise<Class> => {
    const classObj = await classApi.updateClass(id, data);
    await fetchClasses(lastParams);
    return classObj;
  }, [fetchClasses, lastParams]);

  const deleteClass = useCallback(async (id: number): Promise<void> => {
    await classApi.deleteClass(id);
    await fetchClasses(lastParams);
  }, [fetchClasses, lastParams]);

  const refetch = useCallback(async () => {
    await fetchClasses(lastParams);
  }, [fetchClasses, lastParams]);

  return {
    ...state,
    fetchClasses,
    createClass,
    updateClass,
    deleteClass,
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
