'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import type { Faculty } from '../types';

interface FacultyTableProps {
  data: Faculty[];
  isLoading: boolean;
  onEdit: (faculty: Faculty) => void;
  onDelete: (faculty: Faculty) => void;
}

export function FacultyTable({ data, isLoading, onEdit, onDelete }: FacultyTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
        <span className="ml-2 text-stone-500">Đang tải...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🏫</span>
        </div>
        <h3 className="text-lg font-medium text-stone-800">Chưa có khoa nào</h3>
        <p className="text-sm text-stone-500 mt-1">
          Bấm nút &quot;Thêm khoa&quot; để tạo khoa mới.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50">
            <TableHead className="w-24">Mã khoa</TableHead>
            <TableHead>Tên khoa</TableHead>
            <TableHead className="hidden md:table-cell">Mô tả</TableHead>
            <TableHead className="text-center w-24">Số ngành</TableHead>
            <TableHead className="text-center w-28">Trạng thái</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((faculty) => (
            <TableRow key={faculty.id} className="hover:bg-stone-50/50">
              <TableCell className="font-mono font-medium text-amber-700">
                {faculty.code}
              </TableCell>
              <TableCell className="font-medium">{faculty.name}</TableCell>
              <TableCell className="hidden md:table-cell text-stone-500 max-w-[200px] truncate">
                {faculty.description || '-'}
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-sm font-medium">
                  {faculty.majors_count}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {faculty.is_active ? (
                  <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                    Hoạt động
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-stone-100 text-stone-500">
                    Tạm dừng
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(faculty)}
                    className="h-8 w-8 p-0 text-stone-500 hover:text-amber-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(faculty)}
                    className="h-8 w-8 p-0 text-stone-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
