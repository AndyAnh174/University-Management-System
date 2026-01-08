'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - Wrap components that require authentication
 * 
 * @param children - Content to render when authorized
 * @param requiredRoles - Array of roles that can access this route (e.g., ['ADMIN', 'TEACHER'])
 * @param fallback - Custom loading component
 * @param redirectTo - Custom redirect path when unauthorized
 */
export function ProtectedRoute({
  children,
  requiredRoles,
  fallback,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isLoading, isAuthenticated, user, canAccess } = useAuthContext();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store current path for redirect after login
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  // Check role access after auth check
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && requiredRoles) {
      if (!canAccess(requiredRoles)) {
        router.push('/dashboard?error=unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, requiredRoles, canAccess, router]);

  // Show loading state
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600 mx-auto" />
          <p className="mt-2 text-stone-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Check role access
  if (requiredRoles && !canAccess(requiredRoles)) {
    return null;
  }

  return <>{children}</>;
}

/**
 * RoleGate - Conditionally render content based on user role
 * 
 * @param children - Content to render when user has required role
 * @param allowedRoles - Roles that can see this content
 * @param fallback - Optional fallback content for unauthorized users
 */
interface RoleGateProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user, hasRole } = useAuthContext();

  if (!user || !hasRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * AdminOnly - Shorthand for RoleGate with admin role only
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate allowedRoles={['ADMIN']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}

/**
 * TeacherOrAdmin - Shorthand for RoleGate with teacher or admin roles
 */
export function TeacherOrAdmin({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleGate allowedRoles={['ADMIN', 'TEACHER']} fallback={fallback}>
      {children}
    </RoleGate>
  );
}
