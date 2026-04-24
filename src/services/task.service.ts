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
  userIdd: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  userId: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  userId: string;
}

// Create a new task
export const createTask = async (data: CreateTaskData): Promise<Task> => {
  console.log("Sending task:", data);
  const response = await api.post<Task>("/tasks", data);
  console.log("Response:", response.data);
  return response.data;
};

export const getTasksByUserId = async (id: string): Promise<Task[]> => {
  const response = await api.get(`/tasks/user/${id}`);
  return response.data;
};
// Get all tasks
export const getAllTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>("/tasks");
  return response.data;
};

// Get task by ID
export const getTaskById = async (taskId: string): Promise<Task> => {
  const response = await api.get<Task>(`/tasks/${taskId}`);
  return response.data;
};
// Get tasks by user ID


export const updateTask = async (taskId: string, data: UpdateTaskData): Promise<Task> => {
  const response = await api.put<Task>(`/tasks/${taskId}`, {
    title: data.title,
    description: data.description,
    userId: data.userId
  });
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