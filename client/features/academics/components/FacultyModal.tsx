'use client';

import { useEffect } from 'react';
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
import { FormInput, FormTextarea, FormCheckbox } from '@/components/shared/FormControls';
import type { Faculty } from '../types';

// Zod Schema
const facultySchema = z.object({
  code: z.string().min(2, 'Mã khoa phải có ít nhất 2 ký tự').nonempty('Mã khoa không được để trống'),
  name: z.string().min(3, 'Tên khoa phải có ít nhất 3 ký tự').nonempty('Tên khoa không được để trống'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

interface FacultyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Faculty | null;
  onSubmit: (data: FacultyFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function FacultyModal({ 
  open, 
  onOpenChange, 
  faculty, 
  onSubmit, 
  isSubmitting 
}: FacultyModalProps) {
  
  const methods = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      is_active: true,
    },
  });

  const { reset, handleSubmit, setError } = methods;

  // Reset form when modal opens/closes or faculty changes
  useEffect(() => {
    if (open) {
      if (faculty) {
        reset({
          code: faculty.code,
          name: faculty.name,
          description: faculty.description || '',
          is_active: faculty.is_active,
        });
      } else {
        reset({
          code: '',
          name: '',
          description: '',
          is_active: true,
        });
      }
    }
  }, [open, faculty, reset]);

  const onFormSubmit = async (data: FacultyFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error: any) {
       // Handle API field errors (if backend returns details object)
       if (error?.response?.data?.error?.details) {
         const details = error.response.data.error.details;
         Object.keys(details).forEach((key) => {
           if (['code', 'name', 'description'].includes(key)) {
              setError(key as any, { 
                type: 'manual', 
                message: details[key][0] 
              });
           }
         });
       }
    }
  };

  const isEditing = !!faculty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Chỉnh sửa Khoa' : 'Thêm Khoa mới'}
              </DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Cập nhật thông tin khoa trong hệ thống.'
                  : 'Thêm một khoa mới vào hệ thống.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <FormInput 
                name="code" 
                label="Mã khoa" 
                placeholder="VD: CNTT" 
                className="uppercase"
                disabled={isSubmitting}
              />
              
              <FormInput 
                name="name" 
                label="Tên khoa" 
                placeholder="VD: Công nghệ thông tin"
                disabled={isSubmitting}
              />
              
              <FormTextarea 
                name="description" 
                label="Mô tả" 
                placeholder="Mô tả ngắn về khoa..."
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
