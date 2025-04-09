import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { 
  ArrowLeftIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  BarChartIcon,
  FileIcon,
  MessageSquareIcon,
  LucideLoader2,
  PlusIcon
} from "lucide-react";
import { 
  RiUserAddLine,
  RiDeleteBinLine,
  RiFileCopyLine,
  RiArchiveLine
} from "react-icons/ri";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

export default function CampaignDetails({ params }: { params: { id: string } }) {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const campaignId = parseInt(params.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: new Date(),
    priority: "medium",
    assigneeId: 0
  });
  const [newComment, setNewComment] = useState("");
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  // Fetch campaign data
  const { data: campaign, isLoading, error } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}`],
  });

  // Fetch campaign members
  const { data: members } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/members`],
    enabled: !!campaign,
  });

  // Fetch campaign tasks
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/tasks`],
    enabled: !!campaign,
  });

  // Fetch campaign activities
  const { data: activities } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/activities`],
    enabled: !!campaign,
  });

  // Fetch campaign metrics
  const { data: metrics } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/metrics`],
    enabled: !!campaign && activeTab === "performance",
  });

  // Fetch campaign assets
  const { data: assets } = useQuery({
    queryKey: [`/api/campaigns/${campaignId}/assets`],
    enabled: !!campaign && activeTab === "assets",
  });

  // Fetch all users for task assignment
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
    enabled: !!campaign,
  });

  // Set form data when campaign data is loaded
  useEffect(() => {
    if (campaign) {
      setFormData({
        name: campaign.name,
        description: campaign.description,
        status: campaign.status,
        startDate: new Date(campaign.startDate),
        endDate: new Date(campaign.endDate),
        budget: campaign.budget,
        targetAudience: campaign.targetAudience,
        progress: campaign.progress,
        channels: campaign.channels
      });
    }
  }, [campaign]);

  // Update campaign mutation
  const updateCampaign = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('PATCH', `/api/campaigns/${campaignId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      setIsEditing(false);
      toast({
        title: "Campaign updated",
        description: "Campaign details have been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update campaign: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Delete campaign mutation
  const deleteCampaign = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/campaigns/${campaignId}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/campaigns'] });
      navigate("/campaigns");
      toast({
        title: "Campaign deleted",
        description: "Campaign has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete campaign: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Add task mutation
  const addTask = useMutation({
    mutationFn: async (taskData: any) => {
      return await apiRequest('POST', `/api/tasks`, {
        ...taskData,
        campaignId,
        completed: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/tasks`] });
      setNewTask({
        title: "",
        description: "",
        dueDate: new Date(),
        priority: "medium",
        assigneeId: 0
      });
      setShowNewTaskForm(false);
      toast({
        title: "Task added",
        description: "New task has been added to the campaign",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add task: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Toggle task completion mutation
  const toggleTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      return await apiRequest('PATCH', `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/tasks`] });
      toast({
        title: "Task updated",
        description: "Task status has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update task: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Add comment mutation
  const addComment = useMutation({
    mutationFn: async (comment: string) => {
      return await apiRequest('POST', '/api/activities', {
        userId: 1, // Assuming current user is Jane Doe with ID 1
        campaignId,
        actionType: 'comment',
        content: comment
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/activities`] });
      setNewComment("");
      toast({
        title: "Comment added",
        description: "Your comment has been added to the activity feed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Add team member mutation
  const addTeamMember = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('POST', `/api/campaigns/${campaignId}/members`, { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/members`] });
      toast({
        title: "Team member added",
        description: "New team member has been added to the campaign",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add team member: ${error}`,
        variant: "destructive",
      });
    },
  });

  // Handle form submission for campaign updates
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCampaign.mutate(formData);
  };

  // Handle new task creation
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask.mutate(newTask);
  };

  // Handle new comment submission
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment.mutate(newComment);
    }
  };

  // Handle task completion toggle
  const handleToggleTask = (id: number, currentStatus: boolean) => {
    toggleTaskMutation.mutate({ id, completed: !currentStatus });
  };

  // Prepare chart data if metrics are available
  const chartData = metrics ? metrics.map((metric: any) => ({
    date: format(new Date(metric.date), 'MMM d'),
    leads: metric.leads,
    views: metric.views,
    clicks: metric.clicks,
    conversions: metric.conversions
  })) : [];

  // Map members to avatar format for AvatarGroup
  const teamMembers = members?.map((member: any) => ({
    name: member.user.name,
    initials: member.user.initials
  })) || [];

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    const statusMap: Record<string, string> = {
      active: 'success',
      draft: 'default',
      completed: 'secondary',
      archived: 'outline',
      attention: 'warning',
      new: 'primary'
    };
    return statusMap[status.toLowerCase()] || 'default';
  };

  // Get priority badge variant
  const getPriorityVariant = (priority: string) => {
    const priorityMap: Record<string, string> = {
      urgent: 'urgent',
      high: 'high',
      medium: 'medium',
      low: 'low'
    };
    return priorityMap[priority.toLowerCase()] || 'default';
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign not found</h1>
        <p className="text-gray-500 mb-4">The campaign you're looking for doesn't exist or you don't have access to it.</p>
        <Button asChild>
          <Link href="/campaigns">Back to Campaigns</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Page Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2 p-0 h-9 w-9"
            onClick={() => navigate("/campaigns")}
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{campaign.name}</h1>
              <Badge variant={getStatusVariant(campaign.status) as any}>
                {campaign.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Created {formatDistanceToNow(new Date(campaign.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="border-gray-200 bg-white"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this campaign? This action cannot be undone.")) {
                    deleteCampaign.mutate();
                  }
                }}
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          ) : (
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="border-gray-200 bg-white"
            >
              Cancel Editing
            </Button>
          )}
        </div>
      </div>
      
      {/* Campaign Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Campaign Details */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <Input 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <Textarea 
                            value={formData.description} 
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            required
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <Select 
                              value={formData.status}
                              onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="100"
                              value={formData.progress} 
                              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {formData.startDate ? (
                                    format(formData.startDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={formData.startDate}
                                  onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full justify-start text-left font-normal"
                                >
                                  {formData.endDate ? (
                                    format(formData.endDate, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={formData.endDate}
                                  onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                            <Input 
                              type="number" 
                              min="0"
                              value={formData.budget} 
                              onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                            <Input 
                              value={formData.targetAudience || ''} 
                              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                              placeholder="e.g. First-time home buyers"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Marketing Channels</label>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {["email", "social", "print", "web", "events", "direct"].map((channel) => (
                              <div key={channel} className="flex items-center space-x-2">
                                <Checkbox 
                                  id={`channel-${channel}`}
                                  checked={formData.channels?.includes(channel)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData({ 
                                        ...formData, 
                                        channels: [...(formData.channels || []), channel] 
                                      });
                                    } else {
                                      setFormData({ 
                                        ...formData, 
                                        channels: formData.channels.filter((c: string) => c !== channel)
                                      });
                                    }
                                  }}
                                />
                                <label 
                                  htmlFor={`channel-${channel}`}
                                  className="text-sm font-medium capitalize cursor-pointer"
                                >
                                  {channel}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                          <Button 
                            type="submit"
                            disabled={updateCampaign.isPending}
                          >
                            {updateCampaign.isPending && (
                              <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Save Changes
                          </Button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                        <p className="mt-1 text-gray-900">{campaign.description}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Status</h3>
                          <p className="mt-1 text-gray-900">{campaign.status}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                          <div className="mt-2">
                            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                              <span>Completion</span>
                              <span>{campaign.progress}%</span>
                            </div>
                            <Progress value={campaign.progress} className="h-2" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                          <p className="mt-1 text-gray-900">{format(new Date(campaign.startDate), "PPP")}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                          <p className="mt-1 text-gray-900">{format(new Date(campaign.endDate), "PPP")}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                          <p className="mt-1 text-gray-900">${campaign.budget.toLocaleString()}</p>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500">Target Audience</h3>
                          <p className="mt-1 text-gray-900">{campaign.targetAudience || "Not specified"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Marketing Channels</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {campaign.channels.map((channel: string) => (
                            <Badge key={channel} variant="outline" className="capitalize">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Team and Quick Stats */}
            <div className="space-y-6">
              {/* Team */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Team</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/campaigns/${campaignId}?tab=team`} onClick={() => setActiveTab("team")}>
                      View all
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members?.length > 0 ? (
                      <div className="flex flex-col space-y-3">
                        {members.slice(0, 5).map((member: any) => (
                          <div key={member.id} className="flex items-center">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-white">
                                {member.user.initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium">{member.user.name}</p>
                              <p className="text-xs text-gray-500">{member.user.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No team members assigned yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Tasks</span>
                      <span className="text-sm font-medium">{tasks?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Team Members</span>
                      <span className="text-sm font-medium">{members?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Assets</span>
                      <span className="text-sm font-medium">{assets?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Duration</span>
                      <span className="text-sm font-medium">
                        {formatDistanceToNow(new Date(campaign.endDate), { addSuffix: false })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/campaigns/${campaignId}?tab=tasks`} onClick={() => setActiveTab("tasks")}>
                        <PlusIcon className="mr-2 h-4 w-4" />
                        Add Task
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/campaigns/${campaignId}?tab=team`} onClick={() => setActiveTab("team")}>
                        <RiUserAddLine className="mr-2 h-4 w-4" />
                        Add Team Member
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link href={`/campaigns/${campaignId}?tab=assets`} onClick={() => setActiveTab("assets")}>
                        <RiFileCopyLine className="mr-2 h-4 w-4" />
                        Add Asset
                      </Link>
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-amber-600" onClick={() => {
                      setFormData({ ...formData, status: "archived" });
                      updateCampaign.mutate({ ...formData, status: "archived" });
                    }}>
                      <RiArchiveLine className="mr-2 h-4 w-4" />
                      Archive Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* New Comment Form */}
                <div className="border border-gray-200 rounded-md p-3">
                  <form onSubmit={handleAddComment}>
                    <Textarea 
                      placeholder="Add a comment or update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px] mb-3"
                    />
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={!newComment.trim() || addComment.isPending}
                      >
                        {addComment.isPending && <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Post Comment
                      </Button>
                    </div>
                  </form>
                </div>
                
                {/* Activity List */}
                {activities && activities.length > 0 ? (
                  <div className="space-y-6">
                    {activities.map((activity: any) => {
                      // Find the user for this activity
                      const user = users?.find((u: any) => u.id === activity.userId);
                      if (!user) return null;
                      
                      return (
                        <div key={activity.id} className="flex">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="ml-3 flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-gray-900">{user.name}</span>
                              <span className="text-gray-500"> {
                                activity.actionType === 'comment' ? 'commented on' : 
                                activity.actionType === 'create' ? 'created' : 
                                activity.actionType === 'update' ? 'updated' : 
                                activity.actionType
                              } the campaign</span>
                            </p>
                            
                            {activity.actionType === 'comment' && (
                              <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-600">
                                {activity.content.split(':')[1] || activity.content}
                              </div>
                            )}
                            
                            <span className="text-xs text-gray-500">
                              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No activity yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Tasks</CardTitle>
              <Button onClick={() => setShowNewTaskForm(!showNewTaskForm)}>
                {showNewTaskForm ? "Cancel" : "Add Task"}
              </Button>
            </CardHeader>
            <CardContent>
              {/* New Task Form */}
              {showNewTaskForm && (
                <div className="border border-gray-200 rounded-md p-4 mb-6">
                  <h3 className="text-lg font-medium mb-4">New Task</h3>
                  <form onSubmit={handleAddTask} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <Input 
                        value={newTask.title} 
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="Task title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <Textarea 
                        value={newTask.description} 
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Task description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                        <Select 
                          value={newTask.assigneeId ? newTask.assigneeId.toString() : ""}
                          onValueChange={(value) => setNewTask({ ...newTask, assigneeId: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            {users?.map((user: any) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className="w-full justify-start text-left font-normal"
                            >
                              {newTask.dueDate ? (
                                format(newTask.dueDate, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={newTask.dueDate}
                              onSelect={(date) => date && setNewTask({ ...newTask, dueDate: date })}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <Select 
                          value={newTask.priority}
                          onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <Button 
                        type="submit"
                        disabled={!newTask.title || addTask.isPending}
                      >
                        {addTask.isPending && <LucideLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Task
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Tasks List */}
              {isLoadingTasks ? (
                <div className="space-y-2">
                  {Array(3).fill(null).map((_, index) => (
                    <div key={index} className="animate-pulse flex p-3 border border-gray-200 rounded-md">
                      <div className="h-5 w-5 bg-gray-200 rounded-sm mr-3"></div>
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : tasks && tasks.length > 0 ? (
                <div className="space-y-2">
                  {tasks.map((task: any) => {
                    const assignee = users?.find((user: any) => user.id === task.assigneeId);
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`p-3 border border-gray-200 rounded-md ${task.completed ? 'bg-gray-50' : 'hover:bg-gray-50'} transition-colors`}
                      >
                        <div className="flex items-start">
                          <Checkbox 
                            id={`task-${task.id}`}
                            checked={task.completed} 
                            onCheckedChange={() => handleToggleTask(task.id, task.completed)}
                            className="mt-1"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <label 
                                htmlFor={`task-${task.id}`}
                                className={`text-sm font-medium cursor-pointer ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}
                              >
                                {task.title}
                              </label>
                              <div className="flex items-center gap-2">
                                <Badge variant={getPriorityVariant(task.priority) as any}>
                                  {task.priority}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  Due {format(new Date(task.dueDate), "MMM d")}
                                </span>
                              </div>
                            </div>
                            {task.description && (
                              <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                {task.description}
                              </p>
                            )}
                            {assignee && (
                              <div className="mt-2 flex items-center">
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[10px]">
                                    {assignee.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="ml-2 text-xs text-gray-500">
                                  Assigned to {assignee.name}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No tasks for this campaign yet</p>
                  <Button onClick={() => setShowNewTaskForm(true)}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    Add Your First Task
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Select onValueChange={(value) => value && addTeamMember.mutate(parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Add team member" />
                </SelectTrigger>
                <SelectContent>
                  {users?.filter((user: any) => {
                    // Filter out users already in the team
                    const memberIds = members?.map((m: any) => m.userId) || [];
                    return !memberIds.includes(user.id);
                  }).map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {members && members.length > 0 ? (
                <div className="space-y-4">
                  {members.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-white">
                            {member.user.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">{member.user.name}</p>
                          <p className="text-sm text-gray-500">{member.user.role}</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          if (window.confirm(`Remove ${member.user.name} from this campaign?`)) {
                            apiRequest('DELETE', `/api/campaigns/${campaignId}/members/${member.userId}`, undefined)
                              .then(() => {
                                queryClient.invalidateQueries({ queryKey: [`/api/campaigns/${campaignId}/members`] });
                                toast({
                                  title: "Team member removed",
                                  description: `${member.user.name} has been removed from the campaign`,
                                });
                              })
                              .catch((error) => {
                                toast({
                                  title: "Error",
                                  description: `Failed to remove team member: ${error}`,
                                  variant: "destructive",
                                });
                              });
                          }
                        }}
                      >
                        <RiDeleteBinLine className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UsersIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No team members assigned to this campaign yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full">
                {metrics && metrics.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                      <Bar dataKey="views" fill="#94a3b8" name="Views" />
                      <Bar dataKey="clicks" fill="#f97316" name="Clicks" />
                      <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <BarChartIcon className="h-12 w-12 text-gray-300 mb-4" />
                    <p className="text-gray-500">No performance data available yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics && metrics.length > 0 ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
                        <p className="text-2xl font-semibold mt-1">
                          {metrics.reduce((sum: number, metric: any) => sum + metric.leads, 0)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                        <p className="text-2xl font-semibold mt-1">
                          {metrics.reduce((sum: number, metric: any) => sum + metric.views, 0)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
                        <p className="text-2xl font-semibold mt-1">
                          {((metrics.reduce((sum: number, metric: any) => sum + metric.conversions, 0) / 
                             metrics.reduce((sum: number, metric: any) => sum + metric.views, 0)) * 100).toFixed(2)}%
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 py-4">No stats available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics && metrics.length > 0 ? (
                    <>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Cost per Lead</h3>
                        <p className="text-2xl font-semibold mt-1">
                          ${(campaign.budget / metrics.reduce((sum: number, metric: any) => sum + metric.leads, 0)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Cost per Conversion</h3>
                        <p className="text-2xl font-semibold mt-1">
                          ${(campaign.budget / metrics.reduce((sum: number, metric: any) => sum + metric.conversions, 0)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Estimated ROI</h3>
                        <p className="text-2xl font-semibold mt-1 text-success">
                          {(metrics.reduce((sum: number, metric: any) => sum + metric.conversions, 0) * 5000 / campaign.budget * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-gray-500">Based on average property value</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 py-4">No ROI data available yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campaign Assets</CardTitle>
              <Button>Upload Asset</Button>
            </CardHeader>
            <CardContent>
              {assets && assets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.map((asset: any) => {
                    const uploadedBy = users?.find((user: any) => user.id === asset.uploadedBy);
                    
                    return (
                      <div key={asset.id} className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="bg-gray-100 p-2 rounded-md">
                            <FileIcon className="h-6 w-6 text-gray-500" />
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {asset.type}
                          </Badge>
                        </div>
                        
                        <h3 className="font-medium mb-1 truncate">{asset.name}</h3>
                        <a 
                          href={asset.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate block mb-3"
                        >
                          {asset.url}
                        </a>
                        
                        {uploadedBy && (
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Uploaded by {uploadedBy.name}</span>
                            <span className="mx-1">•</span>
                            <span>{formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No assets for this campaign yet</p>
                  <Button>Upload Your First Asset</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
