'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw, Filter } from 'lucide-react';
import { AdminOnly } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  MajorTable, 
  MajorModal, 
  type Major,
  type MajorCreateInput,
  type MajorUpdateInput,
  type FacultyMinimal,
} from '@/features/academics';
import { majorApi } from '@/features/academics/api/major.api';
import { getFacultiesDropdown } from '@/features/academics/api/faculty.api';
import { useResource } from '@/hooks/useResource';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';

export default function MajorsPage() {
  const [search, setSearch] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  
  // Use generic resource hook
  const {
    data,
    count,
    isLoading,
    isSubmitting,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch,
    pagination,
    onPaginationChange,
    setFilters,
  } = useResource<Major, MajorCreateInput, MajorUpdateInput, { search?: string; faculty?: number }>({
    api: majorApi,
    name: 'Ngành',
    defaultFilters: { search: '', faculty: undefined },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);

  // Load faculties for filter on mount
  useEffect(() => {
    getFacultiesDropdown().then(setFaculties).catch(console.error);
  }, []);

  // Handle Search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    // Debounce handled in effect below
  };

  // Effect for debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setFilters({ search: search || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [search, setFilters]);

  // Handle Filter Change
  const handleFilterChange = (value: string) => {
    setSelectedFacultyFilter(value);
    setFilters({ faculty: value === 'all' ? undefined : Number(value) });
  };

  // CRUD Actions
  const handleCreate = () => {
    setSelectedMajor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (major: Major) => {
    setSelectedMajor(major);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (major: Major) => {
    setSelectedMajor(major);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (formData: any) => { // Type handled by Zod
    if (selectedMajor) {
      await updateItem(selectedMajor.id, formData);
    } else {
      await createItem(formData);
    }
  };

  const handleDelete = async () => {
    if (!selectedMajor) return;
    await deleteItem(selectedMajor.id);
  };

  const pageCount = Math.ceil(count / pagination.pageSize);

  return (
    <AdminOnly
      fallback={
        <div className="text-center py-12">
          <p className="text-stone-500">Bạn không có quyền truy cập trang này.</p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Quản lý Ngành</h1>
            <p className="text-sm text-stone-500">
              Danh sách tất cả các ngành học trực thuộc các khoa
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-1" />
              Thêm ngành
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm theo mã hoặc tên ngành..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <div className="w-full md:w-[250px]">
            <Select value={selectedFacultyFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2 text-stone-400" />
                <SelectValue placeholder="Lọc theo khoa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khoa</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f.id} value={String(f.id)}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            Lỗi: {error}
          </div>
        )}

        {/* Table */}
        <MajorTable
          data={data}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
      </div>

      {/* Modals */}
      <MajorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        major={selectedMajor}
        onSubmit={handleSubmit}
        preselectedFacultyId={selectedFacultyFilter !== 'all' ? Number(selectedFacultyFilter) : undefined}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Xác nhận xóa ngành"
        description={`Bạn có chắc muốn xóa ngành "${selectedMajor?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
      />
    </AdminOnly>
  );
}
