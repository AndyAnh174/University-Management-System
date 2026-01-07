'use client';

import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  title?: string;
  description?: string;
}

export function DashboardLayout({ children, user, title, description }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-stone-50">
      <Sidebar userRole={user?.role} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} title={title} description={description} />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
