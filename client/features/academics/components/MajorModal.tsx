'use client';

import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { FormInput, FormTextarea, FormCheckbox, FormSelect } from '@/components/shared/FormControls';
import type { Major, FacultyMinimal } from '../types';
import { getFacultiesDropdown } from '../api/faculty.api';

// Zod Schema
const majorSchema = z.object({
  code: z.string().min(2, 'Mã ngành phải có ít nhất 2 ký tự').nonempty('Mã ngành không được để trống'),
  name: z.string().min(3, 'Tên ngành phải có ít nhất 3 ký tự').nonempty('Tên ngành không được để trống'),
  description: z.string().optional(),
  faculty_id: z.coerce.number().min(1, 'Vui lòng chọn khoa'),
  is_active: z.boolean().default(true),
});

type MajorFormValues = z.infer<typeof majorSchema>;

interface MajorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  major?: Major | null;
  onSubmit: (data: MajorFormValues) => Promise<void>;
  preselectedFacultyId?: number;
  isSubmitting?: boolean;
}

export function MajorModal({ 
  open, 
  onOpenChange, 
  major, 
  onSubmit, 
  preselectedFacultyId,
  isSubmitting 
}: MajorModalProps) {
  
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);

  const methods = useForm<MajorFormValues>({
    resolver: zodResolver(majorSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      faculty_id: 0,
      is_active: true,
    },
  });

  const { reset, handleSubmit, setError } = methods;

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
        reset({
          code: major.code,
          name: major.name,
          description: major.description || '',
          faculty_id: major.faculty?.id || 0,
          is_active: major.is_active,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          faculty_id: preselectedFacultyId || 0,
          is_active: true,
        });
      }
    }
  }, [open, major, preselectedFacultyId, reset]);

  const onFormSubmit = async (data: MajorFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error: any) {
        if (error?.response?.data?.error?.details) {
            const details = error.response.data.error.details;
            Object.keys(details).forEach((key) => {
              // Map keys to form fields
              if (['code', 'name', 'description', 'faculty_id'].includes(key)) {
                setError(key as any, { 
                    type: 'manual', 
                    message: details[key][0] 
                });
              }
            });
        }
    }
  };

  const isEditing = !!major;
  
  const facultyOptions = faculties.map(f => ({
    value: f.id,
    label: f.name
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
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
              <FormSelect
                name="faculty_id"
                label="Khoa trực thuộc"
                placeholder={isLoadingFaculties ? "Đang tải..." : "Chọn khoa"}
                options={facultyOptions}
                disabled={isSubmitting || isLoadingFaculties}
              />
              
              <FormInput 
                name="code" 
                label="Mã ngành" 
                placeholder="VD: KHMT" 
                className="uppercase"
                disabled={isSubmitting}
              />
              
              <FormInput 
                name="name" 
                label="Tên ngành" 
                placeholder="VD: Khoa học máy tính"
                disabled={isSubmitting}
              />
              
              <FormTextarea 
                name="description" 
                label="Mô tả" 
                placeholder="Mô tả ngắn về ngành..."
                disabled={isSubmitting}
              />
              
              <FormCheckbox 
                name="is_active" 
                label="Đang hoạt động"
                disabled={isSubmitting}
              />
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
