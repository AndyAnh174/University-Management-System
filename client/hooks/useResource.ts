'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ResourceOptions<T, TCreate, TUpdate, TFilter> {
  api: {
    list: (params?: any) => Promise<PaginatedResponse<T>>;
    create?: (data: TCreate) => Promise<T>;
    update?: (id: number, data: TUpdate) => Promise<T>;
    delete?: (id: number) => Promise<void>;
  };
  defaultFilters?: Partial<TFilter>;
  name?: string; // Resource name for toast messages (e.g. "Khoa", "Ngành")
}

export function useResource<T, TCreate, TUpdate, TFilter = Record<string, any>>({
  api,
  defaultFilters = {},
  name = 'Mục',
}: ResourceOptions<T, TCreate, TUpdate, TFilter>) {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering state
  const [pagination, setPagination] = useState({
    pageIndex: 1,
    pageSize: 20,
  });
  
  const [filters, setFilters] = useState<Partial<TFilter>>(defaultFilters);

  const apiRef = useRef(api);
  
  // Update ref if api prop changes (though it should ideally be stable)
  useEffect(() => {
    apiRef.current = api;
  }, [api]);

  // Fetch Logic
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.pageIndex,
        page_size: pagination.pageSize, 
        ...filters,
      };
      // Use ref to access latest api actions without triggering effect
      const response = await apiRef.current.list(params);
      setData(response.results);
      setCount(response.count);
    } catch (err: any) {
      console.error('Fetch error:', err);
      const message = err.response?.data?.detail 
        || err.response?.data?.error?.message 
        || 'Không thể tải dữ liệu';
      setError(message);
      toast.error(`Lỗi tải dữ liệu: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, [pagination, filters]); // api removed from dependency using ref pattern

  // Initial Fetch & Refetch on params change
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  // Create
  const createItem = async (data: TCreate) => {
    if (!api.create) return;
    setIsSubmitting(true);
    try {
      await api.create(data);
      toast.success(`Thêm mới ${name} thành công`);
      await fetchData(); // Refresh list
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      toast.error(`Thêm mới thất bại: ${message}`);
      throw err; // Let consumer handle field errors if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update
  const updateItem = async (id: number, data: TUpdate) => {
    if (!api.update) return;
    setIsSubmitting(true);
    try {
      await api.update(id, data);
      toast.success(`Cập nhật ${name} thành công`);
      await fetchData();
      return true;
    } catch (err: any) {
      const message = getErrorMessage(err);
      toast.error(`Cập nhật thất bại: ${message}`);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete
  const deleteItem = async (id: number) => {
    if (!api.delete) return;
    try {
      await api.delete(id);
      toast.success(`Xóa ${name} thành công`);
      
      // Handle page empty after delete
      if (data.length === 1 && pagination.pageIndex > 1) {
        setPagination(prev => ({ ...prev, pageIndex: prev.pageIndex - 1 }));
      } else {
        await fetchData();
      }
    } catch (err: any) {
      const message = getErrorMessage(err);
      toast.error(`Xóa thất bại: ${message}`);
      // Don't rethrow delete error usually, just toast
    }
  };

  const handlePageChange = (updater: any) => {
      setPagination((prev) => {
         const newPagination = typeof updater === 'function' ? updater(prev) : updater;
         return { ...prev, ...newPagination };
      });
  };

  const handleSetFilters = useCallback((newFilters: Partial<TFilter>) => {
    setFilters((prev) => {
      // Basic shallow comparison to avoid unnecessary updates if possible, 
      // but typically we just merge. 
      // Implementing a simple equality check might be safer but `...newFilters` implies change.
      return { ...prev, ...newFilters };
    });
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  }, []);

  return {
    // Data State
    data,
    count,
    isLoading,
    isSubmitting,
    error,
    
    // Actions
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchData,
    
    // Pagination & Filters
    pagination,
    setPagination,
    onPaginationChange: handlePageChange,
    filters,
    setFilters: handleSetFilters,
  };
}

// Helper to extract error message
function getErrorMessage(err: any): string {
  if (err?.response?.data?.detail) return err.response.data.detail;
  if (err?.response?.data?.error?.message) return err.response.data.error.message;
  return 'Có lỗi xảy ra';
}
