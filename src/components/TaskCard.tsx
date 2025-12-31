import { Task } from '@/services/task.service';
import { cn } from '@/lib/utils';
import { Check, Trash2, Edit2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onComplete, onEdit, onDelete }) => {
  return (
    <div
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:shadow-md animate-fade-in",
        task.completed && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onComplete(task.id)}
          className={cn(
            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
            task.completed
              ? "border-success bg-success"
              : "border-muted-foreground/30 hover:border-primary"
          )}
        >
          {task.completed && <Check className="h-3 w-3 text-success-foreground" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "text-sm font-medium text-card-foreground",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={cn(
                "mt-1 text-sm text-muted-foreground line-clamp-2",
                task.completed && "line-through"
              )}
            >
              {task.description}
            </p>
          )}
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Status badge */}
      {task.completed && (
        <div className="absolute right-4 bottom-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <Check className="h-3 w-3" />
            Completed
          </span>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
