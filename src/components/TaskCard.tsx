  import { Task } from "@/services/task.service";
  import { cn } from "@/lib/utils";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import {
    Check,

    Trash2,
    MoreVertical,
    Edit2,
  } from "lucide-react";

  import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
  } from "@/components/ui/dropdown-menu";

  interface Props {
    task: Task;
    onComplete: (taskId: string) => void;
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
  }
  const TaskCard = ({ task, onComplete, onEdit, onDelete }: Props) => {
    const isPending = task.status === "PENDING";
    const isProcessing = task.status === "PROCESSING";
    const isCompleted = task.status === "COMPLETED";

    const formatDate = (date?: string | null) =>
      date
        ? new Date(date).toLocaleDateString("pt-PT") +
          " - " +
          new Date(date).toLocaleTimeString("pt-PT", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "";

    return (
      <Card
        className={cn(
          "group relative transition hover:shadow-md animate-fade-in",
          isCompleted && "opacity-60"
        )}
      >
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            
            {/* Checkbox */}
            <button
              onClick={() => onComplete(task.taskId)}
              className={cn(
                "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isCompleted
                  ? "border-green-500 bg-green-500"
                  : "border-muted-foreground/30 hover:border-primary"
              )}
            >
              
              {isCompleted && <Check className="h-3 w-3 text-white" />}
            </button>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  "font-semibold text-sm",
                  isCompleted && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </h3>

              {/* User */}
              {task.userName && (
                <p className="text-xs text-muted-foreground pt-3">
                  Created by: {task.userName}
                </p>
              )}

              {/* Description */}
              {task.description && (
                <p
                  className={cn(
                    "text-sm text-muted-foreground mt-4 line-clamp-2 ",
                    isCompleted && "line-through"
                  )}>
                  {task.description}
                </p>
              )}

              {/* Data */}
              <p className="text-xs text-muted-foreground mt-1">
                {isCompleted && task.doneDate
                  ? `Completed: ${formatDate(task.doneDate)}`
                  : `Created: ${formatDate(task.createdAt)}`}
              </p>
            </div>

            {/* Menu de ações */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => onDelete(task.taskId)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão completar */}
          <Button
            variant="outline"
            onClick={() => onComplete(task.taskId)}
            className="mt-2">

            {task.status === "PENDING" && "Mark Processing"}
            {task.status === "PROCESSING" && "Mark Complete"}
            {task.status === "COMPLETED" && "Completed"}        
            
          </Button>

          {/* Status Badge */}
          <div className="absolute right-4 bottom-4 text-right">
            {isCompleted && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                <Check className="h-3 w-3" />
                Completed
              </span>
            )}

            {isProcessing && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-500">
                Processing
              </span>
            )}

            {isPending && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                Pending
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  export default TaskCard;