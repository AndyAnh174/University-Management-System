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
  ClassTable, 
  ClassModal, 
  type Class,
  type ClassCreateInput,
  type ClassUpdateInput,
  type FacultyMinimal,
  type MajorMinimal,
} from '@/features/academics';
import { classApi } from '@/features/academics/api/class.api';
import { getFacultiesDropdown } from '@/features/academics/api/faculty.api';
import { getMajorsDropdown } from '@/features/academics/api/major.api';
import { useResource } from '@/hooks/useResource';
import { DeleteConfirmModal } from '@/components/shared/DeleteConfirmModal';

export default function ClassesPage() {
  const [search, setSearch] = useState('');
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  const [majors, setMajors] = useState<MajorMinimal[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  
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
  } = useResource<Class, ClassCreateInput, ClassUpdateInput, { 
      search?: string; 
      major__faculty?: number;
      major?: number;
      academic_year?: number 
  }>({
    api: classApi,
    name: 'Lớp học',
    defaultFilters: { search: '', major__faculty: undefined, major: undefined, academic_year: undefined },
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  // Initial Data Load
  useEffect(() => {
    getFacultiesDropdown().then(setFaculties).catch(console.error);
    classApi.getAcademicYears().then(setYears).catch(console.error);
  }, []);

  // Fetch majors when faculty filter changes
  useEffect(() => {
    if (selectedFaculty && selectedFaculty !== 'all') {
      getMajorsDropdown(Number(selectedFaculty)).then(setMajors).catch(console.error);
    } else {
      setMajors([]);
      if (selectedMajor !== 'all') {
          handleMajorChange('all');
      }
    }
  }, [selectedFaculty]);

  // Handle Search
  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  // Effect for debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
        setFilters({ search: search || undefined });
    }, 500);
    return () => clearTimeout(timer);
  }, [search, setFilters]);

  // Filter Handlers
  const handleFacultyChange = (value: string) => {
    setSelectedFaculty(value);
    setFilters({ major__faculty: value === 'all' ? undefined : Number(value) });
  };
  
  const handleMajorChange = (value: string) => {
      setSelectedMajor(value);
      setFilters({ major: value === 'all' ? undefined : Number(value) });
  };

  const handleYearChange = (value: string) => {
      setSelectedYear(value);
      setFilters({ academic_year: value === 'all' ? undefined : Number(value) });
  };

  // CRUD Actions
  const handleCreate = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Class) => {
    setSelectedClass(item);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: Class) => {
    setSelectedClass(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (formData: any) => {
    if (selectedClass) {
      await updateItem(selectedClass.id, formData);
    } else {
      await createItem(formData);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    await deleteItem(selectedClass.id);
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
            <h1 className="text-xl font-semibold text-stone-800">Quản lý Lớp học</h1>
            <p className="text-sm text-stone-500">
              Danh sách các lớp sinh hoạt
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={handleCreate} className="bg-amber-600 hover:bg-amber-700">
              <Plus className="h-4 w-4 mr-1" />
              Thêm lớp
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-stone-50 p-4 rounded-lg border border-stone-200">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Tìm mã hoặc tên lớp..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          
          {/* Faculty Filter */}
          <Select value={selectedFaculty} onValueChange={handleFacultyChange}>
            <SelectTrigger className="bg-white">
              <Filter className="h-4 w-4 mr-2 text-stone-400" />
              <SelectValue placeholder="Tất cả khoa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khoa</SelectItem>
              {faculties.map((f) => (
                <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Major Filter */}
          <Select 
            value={selectedMajor} 
            onValueChange={handleMajorChange}
            disabled={selectedFaculty === 'all' || majors.length === 0}
          >
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Tất cả ngành" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả ngành</SelectItem>
              {majors.map((m) => (
                <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

           {/* Year Filter */}
           <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="bg-white">
               <SelectValue placeholder="Tất cả khóa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả khóa</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>Khóa {y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-red-600 border border-red-200">
            Lỗi: {error}
          </div>
        )}

        {/* Table */}
        <ClassTable
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
      <ClassModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classObj={selectedClass}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Xác nhận xóa lớp"
        description={`Bạn có chắc muốn xóa lớp "${selectedClass?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
      />
    </AdminOnly>
  );
}
