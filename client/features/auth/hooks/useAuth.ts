'use client';

import { useState, useEffect, useCallback } from 'react';
import * as authApi from '../api';
import { setTokens, removeTokens, isAuthenticated as checkAuth } from '../utils';
import type { User, AuthState } from '../types';

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: Parameters<typeof authApi.register>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

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

  const login = useCallback(async (email: string, password: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.login({ email, password });
      setTokens(response.accessToken, response.refreshToken);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (data: Parameters<typeof authApi.register>[0]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await authApi.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
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
    }
  }, []);

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
    register,
    logout,
    refreshUser,
  };
}
