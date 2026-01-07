import { DashboardLayout } from '@/components/layout';

// TODO: Replace with actual user data from auth
const mockUser = {
  firstName: 'Admin',
  lastName: 'User',
  role: 'admin',
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout user={mockUser}>
      {children}
    </DashboardLayout>
  );
}
