import { User, Bell, Shield, Palette, ChevronRight } from 'lucide-react';

const settingsSections = [
  { title: 'Hồ sơ cá nhân', description: 'Cập nhật thông tin cá nhân của bạn', icon: User },
  { title: 'Thông báo', description: 'Quản lý cài đặt thông báo', icon: Bell },
  { title: 'Bảo mật', description: 'Đổi mật khẩu và bảo mật tài khoản', icon: Shield },
  { title: 'Giao diện', description: 'Tùy chỉnh giao diện hiển thị', icon: Palette },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Cài đặt</h1>
        <p className="text-sm text-stone-500">Quản lý tài khoản và tùy chỉnh hệ thống</p>
      </div>

      {/* Settings sections */}
      <div className="space-y-3">
        {settingsSections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-xl p-4 border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-stone-100 rounded-lg">
                <section.icon className="text-stone-600" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-stone-800">{section.title}</h3>
                <p className="text-sm text-stone-500">{section.description}</p>
              </div>
              <ChevronRight className="text-stone-400" size={20} />
            </div>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="font-medium text-stone-800 mb-4">Thông tin cá nhân</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Họ</label>
            <input
              type="text"
              defaultValue="Nguyễn"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Tên</label>
            <input
              type="text"
              defaultValue="Văn A"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-stone-600 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="user@example.com"
              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors">
            Lưu thay đổi
          </button>
          <button className="px-4 py-2 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-sm font-medium transition-colors">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
