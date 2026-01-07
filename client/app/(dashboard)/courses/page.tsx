import { BookOpen, Plus, Search, Users, Clock } from 'lucide-react';

const courses = [
  { code: 'IT001', name: 'Nhập môn lập trình', credits: 3, students: 45 },
  { code: 'IT002', name: 'Cấu trúc dữ liệu', credits: 4, students: 38 },
  { code: 'IT003', name: 'Cơ sở dữ liệu', credits: 3, students: 42 },
  { code: 'IT004', name: 'Mạng máy tính', credits: 3, students: 35 },
  { code: 'IT005', name: 'Phát triển web', credits: 4, students: 50 },
  { code: 'IT006', name: 'Trí tuệ nhân tạo', credits: 3, students: 28 },
];

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Quản lý Môn học</h1>
          <p className="text-sm text-stone-500">Danh sách tất cả môn học trong hệ thống</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Thêm môn học
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
        <input
          type="text"
          placeholder="Tìm kiếm môn học..."
          className="w-full pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>

      {/* Courses grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div key={course.code} className="bg-white rounded-xl p-5 border border-stone-200 hover:shadow-sm transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-50 rounded-lg">
                <BookOpen className="text-amber-600" size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-stone-400 font-medium">{course.code}</p>
                <h3 className="font-medium text-stone-800 mt-0.5">{course.name}</h3>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {course.credits} tín chỉ
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {course.students} SV
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-stone-100">
              <button className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Xem chi tiết →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
