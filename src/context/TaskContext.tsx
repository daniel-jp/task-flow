import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { Task, getTasksByUserId, getAllTasks } from '@/services/task.service';
import { useToast } from '@/hooks/use-toast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  fetchTasks: (userId: string) => Promise<void>;
  fetchAllTasks: () => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('tasks');
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (e) {
        console.error("Erro ao ler tasks do storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const fetchTasks = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      const data = await getTasksByUserId(userId);
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to load tasks.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchAllTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllTasks();
      setTasks(data);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to fetch tasks.' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, fetchAllTasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used inside TaskProvider");
  return context;
};
