'use client';

import { AuthProvider } from '@/providers/AuthProvider';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}
