/**
 * Faculty Types
 */

export interface Faculty {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  majors_count: number;
  created_at: string;
  updated_at: string;
}

export interface FacultyMinimal {
  id: number;
  code: string;
  name: string;
}

export interface FacultyCreateInput {
  code: string;
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface FacultyUpdateInput {
  code?: string;
  name?: string;
  description?: string;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// Major Types
export interface Major {
  id: number;
  code: string;
  name: string;
  description?: string;
  faculty: {
    id: number;
    code: string;
    name: string;
  };
  faculty_id?: number; // For form handling
  is_active: boolean;
  classes_count: number;
  created_at: string;
  updated_at: string;
}

export interface MajorMinimal {
  id: number;
  code: string;
  name: string;
}

export interface MajorCreateInput {
  code: string;
  name: string;
  description?: string;
  faculty_id: number;
  is_active?: boolean;
}

export interface MajorUpdateInput {
  code?: string;
  name?: string;
  description?: string;
  faculty_id?: number;
  is_active?: boolean;
}

// Class Types
export interface Class {
  id: number;
  code: string;
  name: string;
  description?: string;
  major: {
    id: number;
    code: string;
    name: string;
  };
  faculty: {
    id: number;
    code: string;
    name: string;
  };
  major_id?: number;
  faculty_id?: number; // Read-only from API, but useful
  academic_year: number;
  max_students: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClassCreateInput {
  code: string;
  name: string;
  description?: string;
  major_id: number;
  academic_year: number;
  max_students?: number;
  is_active?: boolean;
}

export interface ClassUpdateInput {
  code?: string;
  name?: string;
  description?: string;
  major_id?: number;
  academic_year?: number;
  max_students?: number;
  is_active?: boolean;
}

export interface ClassMinimal {
  id: number;
  code: string;
  name: string;
  academic_year: number;
}
