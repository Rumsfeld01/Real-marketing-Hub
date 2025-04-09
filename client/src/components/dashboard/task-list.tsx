import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function TaskList() {
  const { toast } = useToast();
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  // Fetch upcoming tasks with campaign data
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['/api/tasks/upcoming'],
    queryFn: async () => {
      const tasksResponse = await fetch('/api/tasks/upcoming?limit=5');
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
      const tasks = await tasksResponse.json();
      
      // Fetch campaign data for each task
      const tasksWithCampaigns = await Promise.all(
        tasks.map(async (task: any) => {
          const campaignResponse = await fetch(`/api/campaigns/${task.campaignId}`);
          const campaign = await campaignResponse.json();
          return { ...task, campaign };
        })
      );
      
      return tasksWithCampaigns;
    }
  });
  
  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/upcoming'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  });
  
  const handleToggleTask = (id: number, currentStatus: boolean) => {
    toggleTaskMutation.mutate({ id, completed: !currentStatus });
  };
  
  // Map priority to variant
  const priorityVariant: Record<string, any> = {
    urgent: 'urgent',
    high: 'high',
    medium: 'medium',
    low: 'low'
  };
  
  const getDueText = (dueDate: string | Date) => {
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Due today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Due tomorrow';
    return `Due ${formatDistanceToNow(date, { addSuffix: true })}`;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Upcoming Tasks</h2>
        <button 
          className="text-sm text-primary font-medium hover:underline"
          onClick={() => setIsAddingTask(!isAddingTask)}
        >
          Add Task
        </button>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          // Loading state
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center p-2 animate-pulse">
              <div className="h-4 w-4 rounded bg-gray-200"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))
        ) : tasks && tasks.length > 0 ? (
          tasks.map((task: any) => (
            <div key={task.id} className="flex items-center p-2 hover:bg-gray-50 rounded transition-colors">
              <Checkbox 
                id={`task-${task.id}`}
                checked={task.completed} 
                onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.title}
                </p>
                <p className={`text-xs ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                  {task.campaign?.name || 'Unknown campaign'} • {getDueText(task.dueDate)}
                </p>
              </div>
              <div>
                <Badge variant={priorityVariant[task.priority]}>
                  {task.priority}
                </Badge>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming tasks</p>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-sm text-primary font-medium hover:underline">
          View all tasks
        </button>
      </div>
    </Card>
  );
}
