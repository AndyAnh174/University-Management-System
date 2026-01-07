import { apiClient } from '@/lib/api-client';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
  return response.data;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
  return response.data;
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, { token, newPassword });
}
