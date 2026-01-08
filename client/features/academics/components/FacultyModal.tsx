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
import { Loader2 } from 'lucide-react';
import type { Faculty, FacultyCreateInput } from '../types';

interface FacultyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Faculty | null;
  onSubmit: (data: FacultyCreateInput) => Promise<void>;
}

export function FacultyModal({ open, onOpenChange, faculty, onSubmit }: FacultyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FacultyCreateInput>({
    code: '',
    name: '',
    description: '',
    is_active: true,
  });

  // Reset form when modal opens/closes or faculty changes
  useEffect(() => {
    if (open) {
      if (faculty) {
        setFormData({
          code: faculty.code,
          name: faculty.name,
          description: faculty.description || '',
          is_active: faculty.is_active,
        });
      } else {
        setFormData({
          code: '',
          name: '',
          description: '',
          is_active: true,
        });
      }
      setErrors({});
    }
  }, [open, faculty]);

  const handleChange = (field: keyof FacultyCreateInput, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Mã khoa không được để trống';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Mã khoa phải có ít nhất 2 ký tự';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Tên khoa không được để trống';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Tên khoa phải có ít nhất 3 ký tự';
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

  const isEditing = !!faculty;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
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
            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Mã khoa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                placeholder="VD: CNTT, KT, QT..."
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
                Tên khoa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="VD: Khoa Công nghệ thông tin"
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
                placeholder="Mô tả ngắn về khoa..."
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
