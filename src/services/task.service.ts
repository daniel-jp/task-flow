import api from './api';

export interface Task {
  taskId: string;
  title: string;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED';
  userName?: string;
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
  console.log("Fetched tasks:", response.data);
  return response.data;
};

// Get tasks by user ID
export const getTasksByUserId = async (userId: string): Promise<Task[]> => {
  const response = await api.get<Task[]>(`/tasks/user/${userId}`);
  return response.data;
};

// Update task
export const updateTask = async (
  taskId: string,
  data: UpdateTaskData):
  Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, data);
  return response.data;
};



export const toggleTask = async (taskId: string): Promise<Task> => {
  const response = await api.patch<Task>(`/tasks/${taskId}/toggle`);
  return response.data;
};


// Delete task
export const deleteTask = async (taskId: string): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};