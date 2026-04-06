import api from './api';
import { Role } from './auth.service';

// Get all roles
export const getAllRoles = async (): Promise<Role[]> => {
  const response = await api.get<Role[]>('/roles');
  return response.data;
};
// Find role by name
export const findRoleByName = async (name: string): Promise<Role> => {
  const response = await api.get<Role>(`/roles/name`, {params: { name }
  });
  return response.data;
};
// Create a new role (admin only)
export const createRole = async (data: { name: string }): Promise<Role> => {
  const response = await api.post<Role>('/roles',  data);
  return response.data;
};

// Delete role (admin only)
export const deleteRole = async (roleId: string): Promise<void> => {
  await api.delete(`/roles/delete/${roleId}`);
};

// Update role name
export const updateRole = async (roleId: string, name: string): Promise<Role> => {
  const response = await api.put<Role>(`/roles/${roleId}`, { name });
  return response.data;
};

// Assign role to user
export const assignRoleToUser = async (userId: string, roleId: string): Promise<void> => {
  await api.post(`/roles/assign-user-to-role?userId=${userId}&roleId=${roleId}`);
};

// Remove role from user
export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  await api.delete(`/roles/remove-role-from-user?userId=${userId}&roleId=${roleId}`);
};

// Remove all users from a role (admin only)
export const removeRoleFromAllUsers = async (roleId: string): Promise<void> => {
  await api.delete(`/roles/${roleId}/users`);
};