import { Calendar } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Insights</h1>
          <p className="text-sm text-stone-500">Tổng quan về hệ thống quản lý sinh viên - giảng viên</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 hover:bg-stone-50">
          <Calendar size={16} />
          Chọn ngày
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <p className="text-3xl font-bold text-stone-800">120</p>
          <p className="text-sm text-stone-500 mt-1">Sinh viên đang học</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <p className="text-3xl font-bold text-stone-800">14</p>
          <p className="text-sm text-stone-500 mt-1">Giảng viên</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <p className="text-3xl font-bold text-stone-800">15%</p>
          <p className="text-sm text-stone-500 mt-1">Tỷ lệ tốt nghiệp</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <p className="text-3xl font-bold text-stone-800">4%</p>
          <p className="text-sm text-stone-500 mt-1">Tỷ lệ bỏ học</p>
        </div>
      </div>

      {/* Tags row */}
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">CNTT</span>
              <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">Kinh tế</span>
            </div>
            <p className="text-xs text-stone-400">Khoa phổ biến nhất</p>
          </div>
          <div>
            <div className="flex gap-2 mb-2">
              <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">Lập trình</span>
              <span className="px-3 py-1 bg-stone-100 text-stone-600 text-sm rounded-full">Database</span>
            </div>
            <p className="text-xs text-stone-400">Môn học hot</p>
          </div>
        </div>
      </div>

      {/* Chart placeholder */}
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-stone-800">Thống kê theo tháng</h3>
          <div className="flex gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-sm"></span>
              Đăng ký
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-sky-400 rounded-sm"></span>
              Hoàn thành
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-stone-300 rounded-sm"></span>
              Khác
            </span>
          </div>
        </div>
        {/* Chart bars */}
        <div className="flex items-end justify-between h-40 gap-2">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col gap-0.5">
                <div className="bg-stone-200 rounded-sm" style={{ height: `${20 + Math.random() * 30}px` }}></div>
                <div className="bg-sky-300 rounded-sm" style={{ height: `${20 + Math.random() * 40}px` }}></div>
                <div className="bg-amber-400 rounded-sm" style={{ height: `${20 + Math.random() * 50}px` }}></div>
              </div>
              <span className="text-xs text-stone-400">{month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs + Table */}
      <div className="bg-white rounded-xl border border-stone-200">
        {/* Tabs */}
        <div className="flex border-b border-stone-200">
          <button className="px-5 py-3 text-sm font-medium text-amber-700 border-b-2 border-amber-600">
            Sinh viên
          </button>
          <button className="px-5 py-3 text-sm font-medium text-stone-500 hover:text-stone-700">
            Giảng viên
          </button>
          <button className="px-5 py-3 text-sm font-medium text-stone-500 hover:text-stone-700">
            Môn học
          </button>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Họ tên</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Trạng thái</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Môn học</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-stone-500 uppercase">Lớp</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 uppercase">Điểm TB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {[
              { name: 'Nguyễn Văn A', status: 'Đang học', subjects: ['CNTT', 'Web'], class: 'K45', score: '8.5' },
              { name: 'Trần Thị B', status: 'Nghỉ phép', subjects: ['Database', 'AI'], class: 'K46', score: '7.8' },
              { name: 'Lê Văn C', status: 'Đang học', subjects: ['Mobile', 'Cloud'], class: 'K45', score: '9.2' },
            ].map((student, i) => (
              <tr key={i} className="hover:bg-stone-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 text-sm">
                      {student.name[0]}
                    </div>
                    <span className="text-sm font-medium text-stone-700">{student.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm ${student.status === 'Đang học' ? 'text-stone-600' : 'text-amber-600'}`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-1.5">
                    {student.subjects.map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-stone-100 text-stone-600 text-xs rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-stone-600">{student.class}</td>
                <td className="px-5 py-4 text-sm text-stone-800 text-right font-medium">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 text-sm text-stone-500">
          <span>3 sinh viên</span>
          <span>Điểm TB: 8.5</span>
        </div>
      </div>
    </div>
  );
}
