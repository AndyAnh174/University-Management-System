'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Class, ClassCreateInput, FacultyMinimal, MajorMinimal } from '../types';
import { getFacultiesDropdown } from '../api/faculty.api';
import { getMajorsDropdown } from '../api/major.api';

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classObj?: Class | null;
  onSubmit: (data: ClassCreateInput) => Promise<void>;
}

export function ClassModal({ open, onOpenChange, classObj, onSubmit }: ClassModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Data for dropdowns
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  const [majors, setMajors] = useState<MajorMinimal[]>([]);
  
  // Selection states
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);

  const [formData, setFormData] = useState<ClassCreateInput>({
    code: '',
    name: '',
    description: '',
    major_id: 0,
    academic_year: new Date().getFullYear(),
    max_students: 50,
    is_active: true,
  });

  // Fetch faculties on open
  useEffect(() => {
    if (open) {
      getFacultiesDropdown().then(setFaculties).catch(console.error);
    }
  }, [open]);

  // Fetch majors when faculty changes
  useEffect(() => {
    if (selectedFacultyId) {
      setIsLoadingMajors(true);
      getMajorsDropdown(Number(selectedFacultyId))
        .then(setMajors)
        .catch(console.error)
        .finally(() => setIsLoadingMajors(false));
    } else {
      setMajors([]);
    }
  }, [selectedFacultyId]);

  // Handle form initialization
  useEffect(() => {
    if (open) {
      if (classObj) {
        setFormData({
          code: classObj.code,
          name: classObj.name,
          description: classObj.description || '',
          major_id: classObj.major_id || classObj.major.id,
          academic_year: classObj.academic_year,
          max_students: classObj.max_students,
          is_active: classObj.is_active,
        });
        // Pre-select faculty based on existing major
        // Note: In real app, we might need to fetch faculty ID from major details if not present
        if (classObj.faculty?.id) {
          setSelectedFacultyId(String(classObj.faculty.id));
        } else if (classObj.faculty_id) {
            setSelectedFacultyId(String(classObj.faculty_id));
        }
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          major_id: 0,
          academic_year: new Date().getFullYear(),
          max_students: 50,
          is_active: true,
        });
        setSelectedFacultyId('');
      }
      setErrors({});
    }
  }, [open, classObj]);

  const handleChange = (field: keyof ClassCreateInput, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã lớp không được để trống';
    } 
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên lớp không được để trống';
    }
    
    if (!formData.major_id) {
      newErrors.major_id = 'Vui lòng chọn ngành';
    }

    if (!formData.academic_year || formData.academic_year < 2000) {
      newErrors.academic_year = 'Năm học không hợp lệ';
    }

    if (!formData.max_students || formData.max_students < 1) {
      newErrors.max_students = 'Sĩ số không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { 
          response?: { data?: { error?: { details?: Record<string, string[]> } } } 
        };
        const details = axiosError.response?.data?.error?.details;
        if (details) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(details).forEach(([key, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              fieldErrors[key] = messages[0];
            }
          });
          setErrors(fieldErrors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditing = !!classObj;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Chỉnh sửa Lớp' : 'Thêm Lớp mới'}
            </DialogTitle>
            <DialogDescription>
              {isEditing ? 'Cập nhật thông tin lớp học.' : 'Thêm một lớp học mới vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Faculty Select */}
              <div className="space-y-2">
                <Label>Khoa trực thuộc <span className="text-red-500">*</span></Label>
                <Select
                  value={selectedFacultyId}
                  onValueChange={(value) => {
                    setSelectedFacultyId(value);
                    handleChange('major_id', 0); // Reset major when faculty changes
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoa" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((f) => (
                      <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Major Select - Dependent */}
              <div className="space-y-2">
                <Label>Ngành học <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.major_id ? String(formData.major_id) : undefined}
                  onValueChange={(value) => handleChange('major_id', Number(value))}
                  disabled={!selectedFacultyId || isSubmitting || isLoadingMajors}
                >
                  <SelectTrigger className={errors.major_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={isLoadingMajors ? "Đang tải..." : "Chọn ngành"} />
                  </SelectTrigger>
                  <SelectContent>
                    {majors.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.major_id && <p className="text-sm text-red-500">{errors.major_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Mã lớp <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="VD: KTPM2021"
                  className={errors.code ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.code && <p className="text-sm text-red-500">{errors.code}</p>}
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Tên lớp <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="VD: Kỹ thuật phần mềm K21"
                  className={errors.name ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Academic Year */}
              <div className="space-y-2">
                <Label htmlFor="year">Khóa (Năm bắt đầu) <span className="text-red-500">*</span></Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.academic_year}
                  onChange={(e) => handleChange('academic_year', Number(e.target.value))}
                  className={errors.academic_year ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                {errors.academic_year && <p className="text-sm text-red-500">{errors.academic_year}</p>}
              </div>
              
              {/* Max Students */}
              <div className="space-y-2">
                 <Label htmlFor="max">Sĩ số tối đa</Label>
                <Input
                  id="max"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => handleChange('max_students', Number(e.target.value))}
                  className={errors.max_students ? 'border-red-500' : ''}
                  disabled={isSubmitting}
                />
                 {errors.max_students && <p className="text-sm text-red-500">{errors.max_students}</p>}
              </div>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả..."
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            
            {/* Is Active */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                className="h-4 w-4 rounded border-stone-300"
                disabled={isSubmitting}
              />
              <Label htmlFor="is_active" className="font-normal">Đang hoạt động</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
