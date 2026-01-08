import { apiClient } from '@/lib/api-client';
import type { LoginCredentials, RegisterData, AuthResponse, User } from '../types';

const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login/',
  REGISTER: '/v1/auth/register/',
  LOGOUT: '/v1/auth/logout/',
  REFRESH: '/v1/auth/refresh/',
  ME: '/v1/auth/me/',
  CHANGE_PASSWORD: '/v1/auth/change-password/',
} as const;

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
  return response.data;
}

export async function register(data: RegisterData): Promise<{ user: User; message: string }> {
  const response = await apiClient.post<{ user: User; message: string }>(AUTH_ENDPOINTS.REGISTER, data);
  return response.data;
}

export async function logout(refreshToken: string): Promise<void> {
  await apiClient.post(AUTH_ENDPOINTS.LOGOUT, { refresh: refreshToken });
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access: string }> {
  const response = await apiClient.post<{ access: string }>(AUTH_ENDPOINTS.REFRESH, { refresh: refreshToken });
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
  return response.data;
}

export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await apiClient.patch<User>(AUTH_ENDPOINTS.ME, data);
  return response.data;
}
