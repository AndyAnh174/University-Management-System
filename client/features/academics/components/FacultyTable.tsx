'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Building2 } from 'lucide-react';
import type { Faculty } from '../types';
import { DataTable } from '@/components/shared/DataTable';

interface FacultyTableProps {
  data: Faculty[];
  isLoading: boolean;
  onEdit: (faculty: Faculty) => void;
  onDelete: (faculty: Faculty) => void;
  // Pagination props
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (updater: any) => void;
}

export function FacultyTable({ 
  data, 
  isLoading, 
  onEdit, 
  onDelete,
  pageCount,
  pagination,
  onPaginationChange 
}: FacultyTableProps) {
  
  const columns: ColumnDef<Faculty>[] = [
    {
      accessorKey: 'code',
      header: 'Mã khoa',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-amber-700">
          {row.getValue('code')}
        </span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Tên khoa',
      cell: ({ row }) => <span className="font-medium">{row.getValue('name')}</span>,
    },
    {
      accessorKey: 'description',
      header: 'Mô tả',
      cell: ({ row }) => (
        <span className="text-stone-500 max-w-[200px] truncate block">
          {row.getValue('description') || '-'}
        </span>
      ),
    },
    {
      accessorKey: 'majors_count',
      header: () => <div className="text-center">Số ngành</div>,
      cell: ({ row }) => (
        <div className="flex justify-center">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-sm font-medium">
            {row.getValue('majors_count')}
            </span>
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
        const faculty = row.original;
        return (
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
      emptyMessage="Chưa có khoa nào. Bấm nút 'Thêm khoa' để tạo mới."
      emptyIcon={
         <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">🏫</span>
        </div>
      }
    />
  );
}
