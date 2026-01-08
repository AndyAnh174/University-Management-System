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
import type { Major, MajorCreateInput, FacultyMinimal } from '../types';
import { getFacultiesDropdown } from '../api/faculty.api';

interface MajorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  major?: Major | null;
  onSubmit: (data: MajorCreateInput) => Promise<void>;
  preselectedFacultyId?: number; // Optional: prepopulate if we are in a Faculty context
}

export function MajorModal({ open, onOpenChange, major, onSubmit, preselectedFacultyId }: MajorModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<MajorCreateInput>({
    code: '',
    name: '',
    description: '',
    faculty_id: 0,
    is_active: true,
  });

  // Fetch faculties when modal opens
  useEffect(() => {
    if (open) {
      setIsLoadingFaculties(true);
      getFacultiesDropdown()
        .then(setFaculties)
        .catch(console.error)
        .finally(() => setIsLoadingFaculties(false));
    }
  }, [open]);

  // Reset form when modal opens/closes or major/faculty changes
  useEffect(() => {
    if (open) {
      if (major) {
        setFormData({
          code: major.code,
          name: major.name,
          description: major.description || '',
          faculty_id: major.faculty?.id || 0,
          is_active: major.is_active,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          faculty_id: preselectedFacultyId || 0,
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [open, major, preselectedFacultyId]);

  const handleChange = (field: keyof MajorCreateInput, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã ngành không được để trống';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Mã ngành phải có ít nhất 2 ký tự';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên ngành không được để trống';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên ngành phải có ít nhất 3 ký tự';
    }
    
    if (!formData.faculty_id) {
      newErrors.faculty_id = 'Vui lòng chọn khoa';
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
       // Handle API validation errors
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

  const isEditing = !!major;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Chỉnh sửa Ngành' : 'Thêm Ngành mới'}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Cập nhật thông tin ngành học.'
                : 'Thêm một ngành học mới vào hệ thống.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Faculty Select */}
            <div className="space-y-2">
              <Label htmlFor="faculty">
                Khoa trực thuộc <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.faculty_id ? String(formData.faculty_id) : undefined}
                onValueChange={(value) => handleChange('faculty_id', Number(value))}
                disabled={isSubmitting || isLoadingFaculties}
              >
                <SelectTrigger className={errors.faculty_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder={isLoadingFaculties ? "Đang tải danh sách khoa..." : "Chọn khoa"} />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty.id} value={String(faculty.id)}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.faculty_id && (
                <p className="text-sm text-red-500">{errors.faculty_id}</p>
              )}
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã ngành <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="VD: KTPM, HTTT..."
                className={errors.code ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code}</p>
              )}
            </div>
            
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Tên ngành <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Kỹ thuật phần mềm"
                className={errors.name ? 'border-red-500' : ''}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Mô tả ngắn về ngành..."
                rows={3}
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
              <Label htmlFor="is_active" className="font-normal">
                Đang hoạt động
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
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
