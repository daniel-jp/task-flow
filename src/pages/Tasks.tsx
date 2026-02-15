import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  Task,
  getTasksByUserId,
  getAllTasks,
  createTask,
  updateTask,
  toggleTask ,
  deleteTask,
} from '@/services/task.service';

import Layout from '@/components/Layout';
import TaskCard from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, ListFilter, Search } from 'lucide-react';

type FilterType = 'all' | 'pending'|'completed';

const Tasks = () => {

  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();


  useEffect(() => {
  fetchTasks();
}, []);

  
  const fetchTasks = async () => {
    try {
    
    const data = await getAllTasks();
    setTasks(data);

  } catch (error) {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to load tasks.',
    });
  } finally {
    setLoading(false);
  }
};



  
  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({ title: task.title, description: task.description || '' });
    } else {
      setEditingTask(null);
      setFormData({ title: '', description: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
    setFormData({ title: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;

    setSubmitting(true);

    try {
      if (editingTask) {
         console.log("Updating task:", editingTask.taskId, formData);

        const updated = await updateTask(editingTask.taskId, formData);
        console.log("Response:", updated);

        //  setTasks(tasks.map((t) => (t.taskId === updated.taskId ? updated : t)));
        
        setTasks((prevTasks) =>
                 prevTasks.map((t) => String(t.taskId) === String(updated.taskId)
      ? { ...t, ...updated }
      : t));

     

        toast({ title: 'Task updated successfully' });
      } else {
        const newTask = await createTask({
          ...formData,
          userId: user.id,
        });
        setTasks([newTask, ...tasks]);
        toast({ title: 'Task created successfully' });
      }
      handleCloseDialog();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: editingTask ? 'Failed to update task.' : 'Failed to create task.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  
const handleComplete = async (taskId: string) => {
  try {

    
    const updatedTask = await toggleTask(taskId);

    if (!updatedTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === updatedTask.taskId ? updatedTask : t
        )
      );

      toast({ title: 'Task status completed' });
    }
    else {

      setTasks((prev) =>
        prev.map((t) =>
          t.taskId === updatedTask.taskId ? updatedTask : t
        )
      );
            toast({ title: 'Task status in processing' });

       }

  } catch {
    toast({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed to update task.',
    });
  }
};


  const handleDelete = async (taskId: string) => {
    try {
      await deleteTask(taskId);

      //setTasks(tasks.filter((t) => t.taskId !== taskId));

      setTasks((prevTasks) =>
          prevTasks.filter((t) => String(t.taskId) !== String(taskId))
        );
      toast({ title: 'Task deleted successfully' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete task.',
      });
    }
  };

  const filteredTasks = tasks
    .filter((task) => {
      if (filter === 'pending') return task.status !== 'COMPLETED';
      if (filter === 'completed') return task.status === 'COMPLETED';
      return true;
    })
    .filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );




  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground">Manage and organize your tasks</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Task list */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <ListFilter className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
            <p className="mt-1 text-muted-foreground">
              {tasks.length === 0
                ? 'Create your first task to get started.'
                : 'Try adjusting your search or filter.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.taskId}
                task={task}
                onComplete={handleComplete}
                onEdit={handleOpenDialog}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Task dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter task title..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter task description..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit"
                  className="gradient-primary" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingTask ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingTask ? ('Update Task') : ('Create Task')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Tasks;