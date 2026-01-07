import { ChevronLeft, ChevronRight } from 'lucide-react';

const scheduleData = [
  { time: '07:00 - 09:00', mon: 'IT001', tue: '', wed: 'IT001', thu: '', fri: 'IT003' },
  { time: '09:00 - 11:00', mon: '', tue: 'IT002', wed: '', thu: 'IT002', fri: '' },
  { time: '13:00 - 15:00', mon: 'IT004', tue: '', wed: 'IT004', thu: '', fri: 'IT005' },
  { time: '15:00 - 17:00', mon: '', tue: 'IT003', wed: '', thu: 'IT005', fri: '' },
];

export default function SchedulesPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Lịch học</h1>
          <p className="text-sm text-stone-500">Xem lịch học theo tuần</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600">
            <ChevronLeft size={16} />
          </button>
          <span className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm font-medium text-stone-700">
            Tuần 15 (06/01 - 12/01)
          </span>
          <button className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Schedule table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase w-28">Thời gian</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase">Thứ 2</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase">Thứ 3</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase">Thứ 4</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase">Thứ 5</th>
              <th className="px-4 py-3 text-xs font-medium text-stone-500 uppercase">Thứ 6</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {scheduleData.map((row, i) => (
              <tr key={i}>
                <td className="px-4 py-4 text-sm font-medium text-stone-600 bg-stone-50">
                  {row.time}
                </td>
                {['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => {
                  const value = row[day as keyof typeof row];
                  return (
                    <td key={day} className="px-4 py-4">
                      {value && (
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-center">
                          <p className="text-sm font-medium text-amber-800">{value}</p>
                          <p className="text-xs text-amber-600 mt-0.5">Phòng A{i + 1}01</p>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-50 border border-amber-200 rounded" />
          <span className="text-stone-600">Có lịch học</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-stone-200 rounded" />
          <span className="text-stone-600">Trống</span>
        </div>
      </div>
    </div>
  );
}
