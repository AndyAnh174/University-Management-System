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
  useClasses, 
  ClassTable, 
  ClassModal, 
  DeleteConfirmModal,
  getFacultiesDropdown,
  getMajorsDropdown,
  getAcademicYears,
  type Class,
  type ClassCreateInput,
  type FacultyMinimal,
  type MajorMinimal,
} from '@/features/academics';
import * as classApi from '@/features/academics/api/class.api';

export default function ClassesPage() {
  const { data, count, isLoading, error, fetchClasses, createClass, updateClass, deleteClass, refetch } = useClasses();
  
  // States for filters
  const [search, setSearch] = useState('');
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  const [majors, setMajors] = useState<MajorMinimal[]>([]);
  const [years, setYears] = useState<number[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState<string>('all');
  const [selectedMajor, setSelectedMajor] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

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
      setSelectedMajor('all');
    }
  }, [selectedFaculty]);

  // Fetch classes with filters
  useEffect(() => {
    const params: any = { page: currentPage };
    if (search) params.search = search;
    
    if (selectedFaculty && selectedFaculty !== 'all') {
      params.major__faculty = Number(selectedFaculty);
    }
    
    if (selectedMajor && selectedMajor !== 'all') {
      params.major = Number(selectedMajor);
    }

    if (selectedYear && selectedYear !== 'all') {
      params.academic_year = Number(selectedYear);
    }
    
    fetchClasses(params);
  }, [fetchClasses, currentPage, search, selectedFaculty, selectedMajor, selectedYear]);

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setCurrentPage(1);
  }, []);

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

  const handleSubmit = async (formData: ClassCreateInput) => {
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, formData);
        toast.success('Cập nhật lớp thành công!');
      } else {
        await createClass(formData);
        toast.success('Thêm lớp mới thành công!');
      }
    } catch {
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
      throw new Error('Submit failed');
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    await deleteClass(selectedClass.id);
    toast.success('Xóa lớp thành công!');
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
            <h1 className="text-xl font-semibold text-stone-800">Quản lý Lớp học</h1>
            <p className="text-sm text-stone-500">
              Danh sách các lớp sinh hoạt ({count} lớp)
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
          <Select value={selectedFaculty} onValueChange={(v) => { setSelectedFaculty(v); setCurrentPage(1); }}>
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
            onValueChange={(v) => { setSelectedMajor(v); setCurrentPage(1); }}
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
           <Select value={selectedYear} onValueChange={(v) => { setSelectedYear(v); setCurrentPage(1); }}>
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
      <ClassModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        classObj={selectedClass}
        onSubmit={handleSubmit}
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
