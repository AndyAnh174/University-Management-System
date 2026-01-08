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
import { Pencil, Trash2, Loader2, Calendar, BookOpen, Users } from 'lucide-react';
import type { Class } from '../types';

interface ClassTableProps {
  data: Class[];
  isLoading: boolean;
  onEdit: (classObj: Class) => void;
  onDelete: (classObj: Class) => void;
}

export function ClassTable({ data, isLoading, onEdit, onDelete }: ClassTableProps) {
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
          <span className="text-2xl">👥</span>
        </div>
        <h3 className="text-lg font-medium text-stone-800">Chưa có lớp nào</h3>
        <p className="text-sm text-stone-500 mt-1">
          Bấm nút &quot;Thêm lớp&quot; để tạo lớp học mới.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-stone-200 bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-stone-50">
            <TableHead className="w-24">Mã lớp</TableHead>
            <TableHead>Tên lớp</TableHead>
            <TableHead>Ngành</TableHead>
            <TableHead className="text-center w-28">Khóa</TableHead>
            <TableHead className="text-center w-28">Sĩ số</TableHead>
            <TableHead className="text-center w-28">Trạng thái</TableHead>
            <TableHead className="text-right w-28">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-stone-50/50">
              <TableCell className="font-mono font-medium text-amber-700">
                {item.code}
              </TableCell>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <BookOpen size={14} className="text-stone-400" />
                  {item.major?.name}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
                  <Calendar size={12} />
                  {item.academic_year}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-sm text-stone-600">
                  <Users size={14} className="text-stone-400" />
                  {item.max_students}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {item.is_active ? (
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
                    onClick={() => onEdit(item)}
                    className="h-8 w-8 p-0 text-stone-500 hover:text-amber-600"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(item)}
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
