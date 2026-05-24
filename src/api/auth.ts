import { api } from '../lib/axios';
import type { AuthUser } from '../store/auth';

export interface AuthResponse {
  token: string;
  user_id: string;
}

export interface UserResponse extends AuthUser {
  created_at: string;
}

export const authApi = {
  register: (
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    display_name: string,
  ) =>
    api.post<AuthResponse>('/auth/register', {
      email,
      password,
      first_name,
      last_name,
      display_name,
    }),

  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),

  me: () => api.get<UserResponse>('/auth/me'),

  logout: () => api.post('/auth/logout'),
};
