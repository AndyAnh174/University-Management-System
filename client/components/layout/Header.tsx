'use client';

import { Bell, Search, ChevronDown, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';

interface HeaderProps {
  user?: {
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  description?: string;
}

export function Header({ user, title, description }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, isLoading } = useAuthContext();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6">
      {/* Page title */}
      <div>
        {title && <h1 className="text-xl font-semibold text-stone-800">{title}</h1>}
        {description && <p className="text-sm text-stone-500">{description}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-64 pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-stone-500 hover:bg-stone-50 rounded-lg transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
        </button>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1.5 hover:bg-stone-50 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 text-sm font-medium">
              {user?.firstName?.[0] || 'U'}
            </div>
            <ChevronDown size={16} className="text-stone-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-stone-100">
                <p className="text-sm font-medium text-stone-700">
                  {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
                </p>
                <p className="text-xs text-stone-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <a href="/profile" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
                Hồ sơ cá nhân
              </a>
              <a href="/settings" className="block px-4 py-2 text-sm text-stone-600 hover:bg-stone-50">
                Cài đặt
              </a>
              <hr className="my-1 border-stone-100" />
              <button 
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading && <Loader2 size={14} className="animate-spin" />}
                {isLoading ? 'Đang đăng xuất...' : 'Đăng xuất'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
