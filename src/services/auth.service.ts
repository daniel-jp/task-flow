import api from './api';

export interface User {
  id: string;
  name: string;
  email: string;
  enabled: boolean;
  locked: boolean;
  roles: Role[];
}

export interface Role {
  id: string;
  name: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Register new user
export const register = async (data: RegisterData): Promise<User> => {
  const response = await api.post<User>("/users", data);
  return response.data;
};

// Login user
export const login = async (data: LoginData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/users/auth", data);
  return response.data;
};

// Get all users (admin only)
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>("/users");
  return response.data;
};

// Get user by ID
export const getUserById = async (userId: string): Promise<User> => {
  const response = await api.get<User>(`/users/${userId}`);
  return response.data;
};

// Update user
export const updateUser = async (userId: string, data: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`/users/${userId}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

export const lockUser = async (userId: string): Promise<void> => {
  await api.put(`/users/${userId}/lock`);
};

export const unlockUser = async (userId: string): Promise<void> => {
  await api.put(`/users/${userId}/unlock`);
};

export const enableUser = async (userId: string): Promise<void> => {
  await api.put(`/users/${userId}/enable`);
};

export const disableUser = async (userId: string): Promise<void> => {
  await api.put(`/users/${userId}/disable`);
};

// Store auth data
export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get stored user
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

// Get stored token
export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};

// Clear auth data
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  return user?.roles?.some(role =>
    role.name === 'ADMIN' || role.name === 'ROLE_ADMIN') ?? false;
};
