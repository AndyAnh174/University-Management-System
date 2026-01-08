'use client';

import { Plus, Search, Mail, Phone } from 'lucide-react';
import { AdminOnly } from '@/components/auth';

export default function TeachersPage() {
  return (
    <AdminOnly
      fallback={
        <div className="text-center py-12">
          <p className="text-stone-500">Bạn không có quyền truy cập trang này.</p>
        </div>
      }
    >
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Quản lý Giảng viên</h1>
          <p className="text-sm text-stone-500">Danh sách tất cả giảng viên trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Thêm giảng viên
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm giảng viên..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-stone-200 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-lg font-medium">
                T
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-800 truncate">TS. Trần Văn {String.fromCharCode(64 + i)}</h3>
                <p className="text-sm text-stone-500 mt-0.5">Khoa Công nghệ thông tin</p>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Mail size={14} />
                <span className="truncate">gv{i}@university.edu.vn</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <Phone size={14} />
                <span>0123 456 78{i}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-sm text-stone-500">{3 + i} môn học</span>
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AdminOnly>
  );
}

