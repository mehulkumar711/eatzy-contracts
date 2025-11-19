// apps/admin-panel/src/api/users.ts
import { api } from '@/lib/api';

export interface User {
  id: string;
  username: string | null;
  phone: string | null;
  role: 'admin' | 'customer' | 'vendor' | 'rider';
  is_active: boolean;
  created_at: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export const usersApi = {
  // Fetch users with pagination and filtering
  getAll: async (params: UserQueryParams) => {
    const { data } = await api.get<PaginatedResponse<User>>('/auth/users', { params });
    return data;
  },
};