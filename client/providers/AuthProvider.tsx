'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import * as authApi from '@/features/auth/api';
import { setTokens, removeTokens, getAccessToken, getRefreshToken, isAuthenticated } from '@/features/auth/utils';
import type { User, LoginCredentials, AuthState } from '@/features/auth/types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  canAccess: (requiredRoles?: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Routes configuration
const PUBLIC_ROUTES = ['/', '/login', '/forgot-password', '/reset-password', '/terms'];
const ROLE_ROUTES: Record<string, string[]> = {
  '/teachers': ['ADMIN'],
  '/students': ['ADMIN', 'TEACHER'],
  '/courses': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/schedules': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/dashboard': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/settings': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/profile': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/notifications': ['ADMIN', 'TEACHER', 'STUDENT'],
  '/resources': ['ADMIN', 'TEACHER', 'STUDENT'],
};

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname?.startsWith(`${route}?`)
  );

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated()) {
        setState(prev => ({ ...prev, isLoading: false }));
        
        // Redirect to login if on protected route
        if (!isPublicRoute && pathname) {
          router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
        return;
      }

      try {
        const user = await authApi.getCurrentUser();
        setState({
          user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        
        // Check role-based access
        checkRoleAccess(user);
      } catch {
        removeTokens();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
        
        if (!isPublicRoute) {
          router.push('/login');
        }
      }
    };

    initAuth();
  }, [pathname]);

  // Check if user has required role for current route
  const checkRoleAccess = (user: User) => {
    if (!pathname || isPublicRoute) return;
    
    // Find matching route config
    const matchedRoute = Object.keys(ROLE_ROUTES).find(route => 
      pathname === route || pathname?.startsWith(`${route}/`)
    );
    
    if (matchedRoute) {
      const requiredRoles = ROLE_ROUTES[matchedRoute];
      if (!requiredRoles.includes(user.role)) {
        // Redirect to dashboard with error
        router.push('/dashboard?error=unauthorized');
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login(credentials);
      setTokens(response.access, response.refresh);
      
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
      
      // Get redirect URL from query params or default to dashboard
      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    } catch (error: unknown) {
      let message = 'Đăng nhập thất bại';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        message = axiosError.response?.data?.detail || message;
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Ignore logout errors
    } finally {
      removeTokens();
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null,
      });
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    if (!isAuthenticated()) return;

    try {
      const user = await authApi.getCurrentUser();
      setState(prev => ({ ...prev, user }));
    } catch {
      // Ignore refresh errors
    }
  };

  // Check if user has specific role(s)
  const hasRole = (roles: string | string[]): boolean => {
    if (!state.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  };

  // Check if user can access route with required roles
  const canAccess = (requiredRoles?: string[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!state.user) return false;
    return requiredRoles.includes(state.user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
        hasRole,
        canAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
