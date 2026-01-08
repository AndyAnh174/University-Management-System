'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { AdminOnly } from '@/components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  useFaculties, 
  FacultyTable, 
  FacultyModal, 
  DeleteConfirmModal,
  type Faculty,
  type FacultyCreateInput,
} from '@/features/academics';

export default function FacultiesPage() {
  const { data, count, isLoading, error, fetchFaculties, createFaculty, updateFaculty, deleteFaculty, refetch } = useFaculties();
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch on mount and when page/search changes
  useEffect(() => {
    fetchFaculties({ page: currentPage, search: search || undefined });
  }, [fetchFaculties, currentPage, search]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  }, []);

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
  const handleSubmit = async (formData: FacultyCreateInput) => {
    try {
      if (selectedFaculty) {
        await updateFaculty(selectedFaculty.id, formData);
        toast.success('Cập nhật khoa thành công!');
      } else {
        await createFaculty(formData);
        toast.success('Thêm khoa mới thành công!');
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      throw new Error('Submit failed'); // Re-throw to let modal handle
    }
  };

  // Confirm delete
  const handleDelete = async () => {
    if (!selectedFaculty) return;
    await deleteFaculty(selectedFaculty.id);
    toast.success('Xóa khoa thành công!');
  };

  // Pagination
  const totalPages = Math.ceil(count / 20);

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
              Danh sách tất cả các khoa trong hệ thống ({count} khoa)
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
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              Trước
            </Button>
            <span className="text-sm text-stone-600">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isLoading}
            >
              Sau
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <FacultyModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        faculty={selectedFaculty}
        onSubmit={handleSubmit}
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
