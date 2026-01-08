'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setError(null);
    
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      // Handle API error
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { 
          response?: { data?: { detail?: string; error?: { message?: string } } } 
        };
        setError(
          axiosError.response?.data?.detail 
          || axiosError.response?.data?.error?.message
          || 'Không thể xóa. Vui lòng thử lại.'
        );
      } else {
        setError('Không thể xóa. Vui lòng thử lại.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="pt-2 text-stone-600">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="text-stone-500 hover:text-stone-800 hover:bg-stone-100"
          >
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 font-medium"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Xác nhận xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
