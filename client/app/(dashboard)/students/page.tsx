import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Quản lý Sinh viên</h1>
          <p className="text-sm text-stone-500">Danh sách tất cả sinh viên trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Thêm sinh viên
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm sinh viên..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
          <Filter size={16} />
          Bộ lọc
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Mã SV</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Họ tên</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Email</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Lớp</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Trạng thái</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="hover:bg-stone-50 transition-colors">
                <td className="px-5 py-4 text-sm text-stone-600 font-medium">SV{String(i).padStart(4, '0')}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-medium">
                      N
                    </div>
                    <span className="text-sm text-stone-700">Nguyễn Văn {String.fromCharCode(64 + i)}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-stone-500">sv{i}@example.com</td>
                <td className="px-5 py-4 text-sm text-stone-600">CNTT-K{45 + i}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full">
                    Đang học
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 hover:bg-stone-100 rounded-lg text-stone-400 hover:text-stone-600">
                    <MoreHorizontal size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100">
          <p className="text-sm text-stone-500">Hiển thị 1-5 của 100 sinh viên</p>
          <div className="flex gap-1">
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 rounded">Trước</button>
            <button className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded">1</button>
            <button className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded">2</button>
            <button className="px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-100 rounded">3</button>
            <button className="px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-100 rounded">Sau</button>
          </div>
        </div>
      </div>
    </div>
  );
}
