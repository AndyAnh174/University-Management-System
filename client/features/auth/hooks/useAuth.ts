'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '../api';
import { setTokens, removeTokens, getRefreshToken, isAuthenticated as checkAuth } from '../utils';
import type { User, AuthState, LoginCredentials } from '../types';

interface UseAuthReturn extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!checkAuth()) {
        setState(prev => ({ ...prev, isLoading: false }));
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
      } catch {
        removeTokens();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
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
      
      // Redirect to dashboard after successful login
      router.push('/dashboard');
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
  }, [router]);

  const logout = useCallback(async () => {
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
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (!checkAuth()) return;

    try {
      const user = await authApi.getCurrentUser();
      setState(prev => ({ ...prev, user }));
    } catch {
      // Ignore refresh errors
    }
  }, []);

  return {
    ...state,
    login,
    logout,
    refreshUser,
  };
}
