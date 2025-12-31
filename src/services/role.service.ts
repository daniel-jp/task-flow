import api from './api';
import { Role } from './auth.service';

// Get all roles
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles');
  return response.data;
};

// Create a new role (admin only)
export const createRole = async (name: string): Promise<Role> => {
  const response = await api.post<Role>('/roles', { name });
  return response.data;
};

// Delete role (admin only)
export const deleteRole = async (roleId: string): Promise<void> => {
  await api.delete(`/roles/delete/${roleId}`);
};

// Assign role to user
export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
  await api.post(`/roles/assign-user-to-role?userId=${userId}&roleId=${roleId}`);
};

// Remove role from user
export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  await api.delete(`/roles/remove-user-from-role?userId=${userId}&roleId=${roleId}`);
};
