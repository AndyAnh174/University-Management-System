'use client';

import { useState, useCallback } from 'react';
import * as majorApi from '../api/major.api';
import type { Major, MajorCreateInput, MajorUpdateInput, PaginatedResponse } from '../types';

interface UseMajorsState {
  data: Major[];
  count: number;
  isLoading: boolean;
  error: string | null;
}

interface UseMajorsReturn extends UseMajorsState {
  fetchMajors: (params?: majorApi.MajorListParams) => Promise<void>;
  createMajor: (data: MajorCreateInput) => Promise<Major>;
  updateMajor: (id: number, data: MajorUpdateInput) => Promise<Major>;
  deleteMajor: (id: number) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useMajors(): UseMajorsReturn {
  const [state, setState] = useState<UseMajorsState>({
    data: [],
    count: 0,
    isLoading: false,
    error: null,
  });
  
  const [lastParams, setLastParams] = useState<majorApi.MajorListParams>({});

  const fetchMajors = useCallback(async (params?: majorApi.MajorListParams) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setLastParams(params || {});
    
    try {
      const response: PaginatedResponse<Major> = await majorApi.getMajors(params);
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

  const createMajor = useCallback(async (data: MajorCreateInput): Promise<Major> => {
    const major = await majorApi.createMajor(data);
    await fetchMajors(lastParams);
    return major;
  }, [fetchMajors, lastParams]);

  const updateMajor = useCallback(async (id: number, data: MajorUpdateInput): Promise<Major> => {
    const major = await majorApi.updateMajor(id, data);
    await fetchMajors(lastParams);
    return major;
  }, [fetchMajors, lastParams]);

  const deleteMajor = useCallback(async (id: number): Promise<void> => {
    await majorApi.deleteMajor(id);
    await fetchMajors(lastParams);
  }, [fetchMajors, lastParams]);

  const refetch = useCallback(async () => {
    await fetchMajors(lastParams);
  }, [fetchMajors, lastParams]);

  return {
    ...state,
    fetchMajors,
    createMajor,
    updateMajor,
    deleteMajor,
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
