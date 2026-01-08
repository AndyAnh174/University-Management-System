'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  Bell,
  UserCircle,
  FolderOpen,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/providers/AuthProvider';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Home', href: '/dashboard', icon: <LayoutDashboard size={22} /> },
  { label: 'Sinh viên', href: '/students', icon: <GraduationCap size={22} />, roles: ['admin', 'teacher'] },
  { label: 'Giảng viên', href: '/teachers', icon: <Users size={22} />, roles: ['admin'] },
  { label: 'Môn học', href: '/courses', icon: <BookOpen size={22} /> },
  { label: 'Lịch học', href: '/schedules', icon: <Calendar size={22} /> },
  { label: 'Tài liệu', href: '/resources', icon: <FolderOpen size={22} /> },
  { label: 'Hồ sơ', href: '/profile', icon: <UserCircle size={22} /> },
  { label: 'Thông báo', href: '/notifications', icon: <Bell size={22} />, badge: 3 },
  { label: 'Cài đặt', href: '/settings', icon: <Settings size={22} /> },
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(userRole)
  );

  return (
    <aside className="w-64 h-screen bg-white border-r border-stone-200 flex flex-col">
      {/* Logo */}
      <div className="h-20 flex items-center px-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <span className="text-amber-700 font-bold text-lg">S</span>
          </div>
          <span className="font-semibold text-stone-800 text-lg">Student Teacher Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl text-base font-medium transition-colors relative',
                isActive
                  ? 'bg-amber-50 text-amber-800'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
              )}
            >
              <span className={isActive ? 'text-amber-700' : 'text-stone-400'}>
                {item.icon}
              </span>
              {item.label}
              {item.badge && (
                <span className="absolute right-4 w-6 h-6 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <LogoutButton />
    </aside>
  );
}

function LogoutButton() {
  const { logout, isLoading } = useAuthContext();
  
  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="p-4 border-t border-stone-100">
      <button 
        onClick={handleLogout}
        disabled={isLoading}
        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 text-base transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 size={22} className="animate-spin" />
        ) : (
          <LogOut size={22} />
        )}
        <span>{isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
      </button>
    </div>
  );
}
