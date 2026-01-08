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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { FormInput, FormTextarea, FormCheckbox, FormSelect } from '@/components/shared/FormControls';
import type { Class, FacultyMinimal, MajorMinimal } from '../types';
import { getFacultiesDropdown } from '../api/faculty.api';
import { getMajorsDropdown } from '../api/major.api';

// Zod Schema
const classSchema = z.object({
  code: z.string().min(2, 'Mã lớp phải có ít nhất 2 ký tự').nonempty('Mã lớp không được để trống'),
  name: z.string().min(3, 'Tên lớp phải có ít nhất 3 ký tự').nonempty('Tên lớp không được để trống'),
  description: z.string().optional(),
  major_id: z.coerce.number().min(1, 'Vui lòng chọn ngành'),
  academic_year: z.coerce.number().min(2000, 'Năm học không hợp lệ'),
  max_students: z.coerce.number().min(1, 'Sĩ số phải lớn hơn 0'),
  is_active: z.boolean().default(true),
});

type ClassFormValues = z.infer<typeof classSchema>;

interface ClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classObj?: Class | null;
  onSubmit: (data: ClassFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

export function ClassModal({ open, onOpenChange, classObj, onSubmit, isSubmitting }: ClassModalProps) {
  // Data for dropdowns
  const [faculties, setFaculties] = useState<FacultyMinimal[]>([]);
  const [majors, setMajors] = useState<MajorMinimal[]>([]);
  
  // Selection states (manage faculty selection outside of form/schema as it's just a filter for majors)
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [isLoadingMajors, setIsLoadingMajors] = useState(false);

  const methods = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      code: '',
      name: '',
      description: '',
      major_id: 0,
      academic_year: new Date().getFullYear(),
      max_students: 50,
      is_active: true,
    },
  });

  const { reset, handleSubmit, setValue, setError } = methods;

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

  // Initial Form Data
  useEffect(() => {
    if (open) {
      if (classObj) {
        reset({
          code: classObj.code,
          name: classObj.name,
          description: classObj.description || '',
          major_id: classObj.major_id || classObj.major.id,
          academic_year: classObj.academic_year,
          max_students: classObj.max_students,
          is_active: classObj.is_active,
        });
        
        // Pre-select faculty based on existing major
        if (classObj.faculty?.id) {
          setSelectedFacultyId(String(classObj.faculty.id));
        } else if (classObj.faculty_id) {
            setSelectedFacultyId(String(classObj.faculty_id));
        }
      } else {
        reset({
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
    }
  }, [open, classObj, reset]);

  const onFormSubmit = async (data: ClassFormValues) => {
    try {
      await onSubmit(data);
      onOpenChange(false);
    } catch (error: any) {
       if (error?.response?.data?.error?.details) {
         const details = error.response.data.error.details;
         Object.keys(details).forEach((key) => {
           if (['code', 'name', 'description', 'major_id', 'academic_year', 'max_students'].includes(key)) {
              setError(key as any, { 
                type: 'manual', 
                message: details[key][0] 
              });
           }
         });
       }
    }
  };

  const isEditing = !!classObj;
  
  const majorOptions = majors.map(m => ({
    value: m.id,
    label: m.name
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onFormSubmit)}>
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
                {/* Faculty Select (Helper) */}
                <div className="space-y-2">
                  <Label>Khoa trực thuộc <span className="text-red-500">*</span></Label>
                  <Select
                    value={selectedFacultyId}
                    onValueChange={(value) => {
                      setSelectedFacultyId(value);
                      setValue('major_id', 0); // Reset major when faculty changes
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
                <FormSelect
                  name="major_id"
                  label="Ngành học"
                  placeholder={isLoadingMajors ? "Đang tải..." : "Chọn ngành"}
                  options={majorOptions}
                  disabled={!selectedFacultyId || isSubmitting || isLoadingMajors}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                  name="code" 
                  label="Mã lớp" 
                  placeholder="VD: KTPM2021"
                  className="uppercase"
                  disabled={isSubmitting}
                />
                
                <FormInput 
                  name="name" 
                  label="Tên lớp" 
                  placeholder="VD: Kỹ thuật phần mềm K21"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInput 
                    name="academic_year" 
                    label="Khóa (Năm bắt đầu)"
                    type="number"
                    disabled={isSubmitting}
                />
                
                <FormInput 
                    name="max_students" 
                    label="Sĩ số tối đa"
                    type="number"
                    disabled={isSubmitting}
                />
              </div>
              
              <FormTextarea 
                name="description" 
                label="Mô tả" 
                placeholder="Mô tả..."
                rows={2}
                disabled={isSubmitting}
              />
              
              <FormCheckbox 
                name="is_active" 
                label="Đang hoạt động"
                disabled={isSubmitting}
              />
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
