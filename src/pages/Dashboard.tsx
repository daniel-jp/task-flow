import { useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTasks } from '@/context/TaskContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ListTodo, Loader2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { tasks, loading, fetchTasks } = useTasks();

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) return;
    fetchTasks(user.id);
  }, [user?.userId, authLoading, fetchTasks]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();
      return dateB - dateA;
    });
  }, [tasks]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
  const processingTasks = tasks.filter(t => t.status === 'PROCESSING').length;
  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const recentTasks = sortedTasks.slice(0, 5);

  const formatDate = (date?: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleString('pt-PT', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome back 👋</h1>
            <p className="text-muted-foreground">Here's your productivity overview</p>
          </div>
          <Link to="/tasks">
            <Button className="gradient-primary">Manage Tasks</Button>
          </Link>
        </div>

        {/* Progress Card */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completion Progress</CardTitle>
              <span className="text-2xl font-bold text-foreground">{loading ? '...' : `${completionRate}%`}</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={completionRate} className="h-2 mb-3" />
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{completedTasks} Completed</span>
              <span>{processingTasks} In Progress</span>
              <span>{pendingTasks} Pending</span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="animate-slide-up">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              <ListTodo className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{loading ? '...' : totalTasks}</div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{loading ? '...' : completedTasks}</div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{loading ? '...' : processingTasks}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {authLoading || loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No tasks yet</p>
                <Link to="/tasks">
                  <Button variant="link" className="text-primary">Create your first task</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  const isProcessing = task.status === 'PROCESSING';

                  return (
                    <div
                      key={task.taskId}
                      className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? 'border-green-500 bg-green-500'
                            : isProcessing
                            ? 'border-orange-500'
                            : 'border-muted-foreground/30'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                          {task.title}
                        </p>
                        {isCompleted && task.doneDate && (
                          <p className="text-xs text-muted-foreground">Completed at {formatDate(task.doneDate)}</p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isCompleted
                          ? 'bg-green-500/10 text-green-500'
                          : isProcessing
                          ? 'bg-orange-500/10 text-orange-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
