export const APP_NAME = 'Student-Teacher Management';

export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  STUDENTS: '/students',
  TEACHERS: '/teachers',
  COURSES: '/courses',
  CLASSES: '/classes',
  SCHEDULES: '/schedules',
  SETTINGS: '/settings',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const siteConfig = {
  name: APP_NAME,
  description: 'Hệ thống quản lý sinh viên và giảng viên',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  keywords: ['student', 'teacher', 'management', 'education', 'university'],
} as const;
