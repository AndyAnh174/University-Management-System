'use client';

import { DashboardLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { useAuthContext } from '@/providers/AuthProvider';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  
  // Map user data for DashboardLayout
  const layoutUser = user ? {
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role.toLowerCase(),
    avatar: user.avatar,
  } : undefined;

  return (
    <ProtectedRoute>
      <DashboardLayout user={layoutUser}>
        {children}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
