'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pageCount?: number;
  pagination?: {
    pageIndex: number;
    pageSize: number;
  };
  onPaginationChange?: (updater: any) => void;
  onPageSizeChange?: (size: number) => void;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  pageCount,
  pagination,
  onPaginationChange,
  onPageSizeChange,
  emptyMessage = 'Không có dữ liệu',
  emptyIcon,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Manual pagination settings if external control is needed
    pageCount: pageCount ?? -1,
    state: {
      pagination: pagination,
    },
    onPaginationChange: onPaginationChange,
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white h-[400px] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600 mb-2" />
        <span className="text-stone-500">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white h-[400px] flex flex-col items-center justify-center">
         {emptyIcon && <div className="mb-4 text-stone-300">{emptyIcon}</div>}
        <p className="text-lg font-medium text-stone-800">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-stone-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-stone-700">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className="hover:bg-amber-50/30 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination && pageCount && pageCount > 1 && (
         <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-2 text-sm text-stone-500">
             <span>Hiển thị</span>
             <Select
                value={String(pagination.pageSize)}
                onValueChange={(value) => onPageSizeChange?.(Number(value))}
             >
               <SelectTrigger className="h-8 w-[70px]">
                 <SelectValue placeholder={pagination.pageSize} />
               </SelectTrigger>
               <SelectContent side="top">
                 {[10, 20, 30, 50, 100].map((pageSize) => (
                   <SelectItem key={pageSize} value={`${pageSize}`}>
                     {pageSize}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
             <span>kết quả mỗi trang</span>
           </div>

           <div className="flex items-center gap-2">
              <span className="text-sm text-stone-500 mr-2">
                Trang {pagination.pageIndex} / {pageCount}
              </span>
             <Button
               variant="outline"
               size="sm"
               onClick={() => table.previousPage()}
               disabled={!table.getCanPreviousPage()}
               className="h-8 w-8 p-0"
             >
               <ChevronLeft className="h-4 w-4" />
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => table.nextPage()}
               disabled={!table.getCanNextPage()}
               className="h-8 w-8 p-0"
             >
               <ChevronRight className="h-4 w-4" />
             </Button>
           </div>
         </div>
      )}
    </div>
  );
}
