'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Calendar, BookOpen, Users } from 'lucide-react';
import type { Class } from '../types';
import { DataTable } from '@/components/shared/DataTable';

interface ClassTableProps {
  data: Class[];
  isLoading: boolean;
  onEdit: (classObj: Class) => void;
  onDelete: (classObj: Class) => void;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (updater: any) => void;
}

export function ClassTable({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete,
  pageCount,
  pagination,
  onPaginationChange
}: ClassTableProps) {
  
  const columns: ColumnDef<Class>[] = [
    {
      accessorKey: 'code',
      header: 'Mã lớp',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-amber-700">
          {row.getValue('code')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Tên lớp',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'major',
      header: 'Ngành',
      cell: ({ row }) => {
        const major = row.original.major;
        return (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <BookOpen size={14} className="text-stone-400" />
            {major?.name || '-'}
          </div>
        );
      },
    },
    {
      accessorKey: 'academic_year',
      header: () => <div className="text-center">Khóa</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
          <Calendar size={12} />
          {row.getValue('academic_year')}
        </div>
        </div>
      ),
    },
    {
      accessorKey: 'max_students',
      header: () => <div className="text-center">Sĩ số</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
        <div className="flex items-center justify-center gap-1.5 text-sm text-stone-600">
            <Users size={14} className="text-stone-400" />
            {row.getValue('max_students')}
        </div>
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: () => <div className="text-center">Trạng thái</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
            {row.getValue('is_active') ? (
            <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                Hoạt động
            </Badge>
            ) : (
            <Badge variant="secondary" className="bg-stone-100 text-stone-500">
                Tạm dừng
            </Badge>
            )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Thao tác</div>,
      cell: ({ row }) => {
        const item = row.original;
        return (
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
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageCount={pageCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      emptyMessage="Chưa có lớp nào. Bấm nút 'Thêm lớp' để tạo mới."
      emptyIcon={
         <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">👥</span>
        </div>
      }
    />
  );
}
