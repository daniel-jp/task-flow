import api from './api';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  userId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  completed?: boolean;
}

// Create a new task
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  const response = await api.post<Task>("/tasks", data);
  return response.data;
};

// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};

// Get tasks by user ID
export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/user/${userId}`);
  return response.data;
};

// Update task
export const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, data);
  return response.data;
};

// Mark task as complete
export const completeTask = async (taskId: string): Promise<string> => {
  const response = await api.patch<string>(`/tasks/${taskId}/complete`);
  return response.data;
};

// Delete task
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};