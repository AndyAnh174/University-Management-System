'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { toast } from 'sonner';
import { 
  useMajors, 
  MajorTable, 
  MajorModal, 
  DeleteConfirmModal,
  getFacultiesDropdown,
  type Major,
  type MajorCreateInput,
  type FacultyMinimal,
} from '@/features/academics';

export default function MajorsPage() {
  const { data, count, isLoading, error, fetchMajors, createMajor, updateMajor, deleteMajor, refetch } = useMajors();
  
  const [search, setSearch] = useState('');
  const [selectedFacultyFilter, setSelectedFacultyFilter] = useState<string>('all');
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMajor, setSelectedMajor] = useState<Major | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Load faculties for filter on mount
  useEffect(() => {
    getFacultiesDropdown().then(setFaculties).catch(console.error);
  }, []);

  // Fetch majors (debounced search handled by effect dependency)
  useEffect(() => {
    const params: any = { page: currentPage };
    if (search) params.search = search;
    if (selectedFacultyFilter && selectedFacultyFilter !== 'all') {
      params.faculty = Number(selectedFacultyFilter);
    }
    
    fetchMajors(params);
  }, [fetchMajors, currentPage, search, selectedFacultyFilter]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

  // Filter change
  const handleFilterChange = useCallback((value: string) => {
    setSelectedFacultyFilter(value);
    setCurrentPage(1);
  }, []);

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

  const handleSubmit = async (formData: MajorCreateInput) => {
    try {
      if (selectedMajor) {
        await updateMajor(selectedMajor.id, formData);
        toast.success('Cập nhật ngành thành công!');
      } else {
        await createMajor(formData);
        toast.success('Thêm ngành mới thành công!');
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      throw new Error('Submit failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedMajor) return;
    await deleteMajor(selectedMajor.id);
    toast.success('Xóa ngành thành công!');
  };

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-stone-800">Quản lý Ngành</h1>
            <p className="text-sm text-stone-500">
              Danh sách tất cả các ngành học trực thuộc các khoa ({count} ngành)
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

      {/* Modals */}
      <MajorModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        major={selectedMajor}
        onSubmit={handleSubmit}
        preselectedFacultyId={selectedFacultyFilter !== 'all' ? Number(selectedFacultyFilter) : undefined}
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
