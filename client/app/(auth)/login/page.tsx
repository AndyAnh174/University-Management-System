'use client';

import { LoginForm } from '@/features/auth/components/LoginForm';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-amber-500 to-amber-700 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <GraduationCap className="text-white" size={28} />
            </div>
            <span className="text-white font-bold text-2xl">Student Teacher Management System</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Hệ thống quản lý<br />
            Sinh viên - Giảng viên
          </h1>
          <p className="text-white/80 text-lg max-w-md">
            Giải pháp toàn diện cho việc quản lý thông tin sinh viên, giảng viên, 
            lịch học và điểm số một cách hiệu quả.
          </p>
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">1000+</p>
              <p className="text-white/70 text-sm">Sinh viên</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">50+</p>
              <p className="text-white/70 text-sm">Giảng viên</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="text-white/70 text-sm">Môn học</p>
            </div>
          </div>
        </div>
        
        <p className="text-white/60 text-sm">
          © 2026 Student Teacher Management System. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-stone-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="text-amber-700" size={24} />
            </div>
            <span className="text-stone-800 font-bold text-xl">Student Teacher Management System</span>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-stone-800">Đăng nhập</h2>
              <p className="text-stone-500 mt-1">
                Chào mừng bạn quay trở lại!
              </p>
            </div>
            
            <LoginForm 
              onForgotPassword={() => {
                // TODO: Navigate to forgot password
              }}
            />
            
            <div className="mt-6 text-center">
              <p className="text-sm text-stone-500">
                Có vấn đề về tài khoản?{' '}
                <a href="mailto:support@university.local" className="text-amber-600 hover:underline">
                  Liên hệ hỗ trợ
                </a>
              </p>
            </div>
          </div>
          
          <p className="text-center text-stone-400 text-sm mt-6">
            Bằng việc đăng nhập, bạn đồng ý với{' '}
            <Link href="/terms" className="text-amber-600 hover:underline">
              Điều khoản sử dụng
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
