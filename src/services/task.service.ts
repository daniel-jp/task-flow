import api from './api';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  createdAt?: string;
  updatedAt?: string;
  doneDate?: string | null;
  userName?: string;
  user: { userId: string; };
}

export interface CreateTaskData {
  title: string;
  description: string;
  userId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
}

export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await api.post<Task>("/tasks", data);
  return response.data;
};

export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};

export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};

export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/user/${userId}`);
  return response.data;
};

export const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, {
    title: data.title,
    description: data.description,
  });
  return response.data;
};

export const toggleTask = async (taskId: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}/toggle`);
  return response.data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};
