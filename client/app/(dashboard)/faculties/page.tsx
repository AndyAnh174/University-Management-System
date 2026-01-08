'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { AdminOnly } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FacultyTable, 
  FacultyModal,
  type Faculty,
  type FacultyCreateInput,
  type FacultyUpdateInput,
} from '@/features/academics';
import { facultyApi } from '@/features/academics/api/faculty.api';
import { useResource } from '@/hooks/useResource';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';

export default function FacultiesPage() {
  const [search, setSearch] = useState('');
  
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
  } = useResource<Faculty, FacultyCreateInput, FacultyUpdateInput, { search?: string }>({
    api: facultyApi,
    name: 'Khoa',
    defaultFilters: { search: '' },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);

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

  // Open modal for create
  const handleCreate = () => {
    setSelectedFaculty(null);
    setIsModalOpen(true);
  };

  // Open modal for edit
  const handleEdit = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteClick = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setIsDeleteModalOpen(true);
  };

  // Submit create/update
  const handleSubmit = async (formData: any) => { // formData type is handled by Zod in modal
    if (selectedFaculty) {
      await updateItem(selectedFaculty.id, formData);
    } else {
      await createItem(formData);
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedFaculty) return;
    await deleteItem(selectedFaculty.id);
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
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Quản lý Khoa</h1>
            <p className="text-sm text-stone-500">
              Danh sách tất cả các khoa trong hệ thống
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
              Thêm khoa
            </Button>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm theo mã hoặc tên khoa..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            Lỗi: {error}
          </div>
        )}

        {/* Table */}
        <FacultyTable
          data={data}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          pageCount={pageCount}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
        />
        
        {/* Pagination integrated in Table via DataTable is clearer, but FacultyTable wraps DataTable which handles it? 
            Wait, FacultyTable currently renders DataTable, but DataTable needs pagination props.
            We need to update FacultyTable to accept and pass pagination props.
        */}
      </div>

      {/* Create/Edit Modal */}
      <FacultyModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        faculty={selectedFaculty}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Xác nhận xóa khoa"
        description={`Bạn có chắc muốn xóa khoa "${selectedFaculty?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
      />
    </AdminOnly>
  );
}
