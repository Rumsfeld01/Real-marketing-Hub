import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Link } from "wouter";
import {
  SearchIcon,
  FilterIcon,
  MoreHorizontalIcon,
  FolderIcon,
  PhoneIcon,
  MailIcon,
  BarChartIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  LucideLoader2
} from "lucide-react";
import { RiTeamLine, RiUserAddLine } from "react-icons/ri";

export default function TeamPage() {
  const [filterRole, setFilterRole] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("team");
  
  // Fetch users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Fetch campaigns for the performance tab
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns'],
    enabled: activeTab === "performance",
  });
  
  // Fetch tasks to show tasks assigned to each team member
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['/api/tasks'],
  });
  
  // Filter users based on role and search query
  const filteredUsers = users?.filter((user: any) => {
    const matchesRole = filterRole === "all" || user.role.toLowerCase().includes(filterRole.toLowerCase());
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  }) || [];
  
  // Get tasks assigned to a specific user
  const getAssignedTasks = (userId: number) => {
    return tasks?.filter((task: any) => task.assigneeId === userId) || [];
  };
  
  // Get campaigns created by a specific user
  const getCampaignsByUser = (userId: number) => {
    return campaigns?.filter((campaign: any) => campaign.createdBy === userId) || [];
  };
  
  // Get completed tasks percentage for a user
  const getTaskCompletionRate = (userId: number) => {
    const userTasks = getAssignedTasks(userId);
    if (userTasks.length === 0) return 0;
    
    const completedTasks = userTasks.filter(task => task.completed);
    return Math.round((completedTasks.length / userTasks.length) * 100);
  };
  
  // Calculate performance metrics for a user
  const getUserPerformanceMetrics = (userId: number) => {
    const userCampaigns = getCampaignsByUser(userId);
    const userTasks = getAssignedTasks(userId);
    
    const activeCampaigns = userCampaigns.filter(campaign => campaign.status === 'active').length;
    const completedCampaigns = userCampaigns.filter(campaign => campaign.status === 'completed').length;
    const pendingTasks = userTasks.filter(task => !task.completed).length;
    const completedTasks = userTasks.filter(task => task.completed).length;
    const taskCompletionRate = getTaskCompletionRate(userId);
    
    return {
      activeCampaigns,
      completedCampaigns,
      pendingTasks,
      completedTasks,
      taskCompletionRate,
      totalCampaigns: userCampaigns.length
    };
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Team Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your team members and track their performance
        </p>
      </div>
      
      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-white hover:bg-primary-dark">
            <RiUserAddLine className="mr-2" />
            Add Team Member
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search team members..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[250px]"
            />
          </div>
          
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="bg-white w-full md:w-[150px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Team Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
        </TabsList>
        
        {/* Team Members Tab */}
        <TabsContent value="team">
          <Card>
            <CardContent className="p-0">
              {isLoadingUsers ? (
                <div className="flex justify-center items-center h-52">
                  <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredUsers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Active Campaigns</TableHead>
                      <TableHead>Tasks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user: any) => {
                      const metrics = getUserPerformanceMetrics(user.id);
                      
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-white">
                                  {user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="font-medium text-gray-900">{user.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">{user.username}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-gray-600">{metrics.activeCampaigns}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <span className="text-gray-600 mr-2">
                                {metrics.completedTasks}/{metrics.completedTasks + metrics.pendingTasks}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-primary rounded-full h-2" 
                                  style={{ width: `${metrics.taskCompletionRate}%` }}
                                ></div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <RiTeamLine className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No team members found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? `No results for "${searchQuery}"` : "Add team members to get started"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Overview Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Team Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Active Campaigns</p>
                        <h3 className="text-2xl font-semibold mt-1">
                          {campaigns?.filter((c: any) => c.status === 'active').length || 0}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FolderIcon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Team Members</p>
                        <h3 className="text-2xl font-semibold mt-1">
                          {users?.length || 0}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <RiTeamLine className="h-5 w-5 text-success" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Task Completion</p>
                        <h3 className="text-2xl font-semibold mt-1">
                          {tasks ? Math.round((tasks.filter((t: any) => t.completed).length / tasks.length) * 100) : 0}%
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 text-warning" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">Pending Tasks</p>
                        <h3 className="text-2xl font-semibold mt-1">
                          {tasks?.filter((t: any) => !t.completed).length || 0}
                        </h3>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-error" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Team Member Performance Table */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Individual Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingUsers || isLoadingCampaigns || isLoadingTasks ? (
                  <div className="flex justify-center items-center h-52">
                    <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Team Member</TableHead>
                        <TableHead>Campaigns Created</TableHead>
                        <TableHead>Task Completion</TableHead>
                        <TableHead>Active Projects</TableHead>
                        <TableHead>Performance Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user: any) => {
                        const metrics = getUserPerformanceMetrics(user.id);
                        const performanceRating = Math.min(
                          100, 
                          ((metrics.completedCampaigns * 20) + 
                           (metrics.taskCompletionRate) + 
                           (metrics.activeCampaigns * 10)) / 3
                        );
                        
                        let performanceBadge;
                        if (performanceRating >= 80) {
                          performanceBadge = <Badge variant="success">Excellent</Badge>;
                        } else if (performanceRating >= 60) {
                          performanceBadge = <Badge variant="primary">Good</Badge>;
                        } else if (performanceRating >= 40) {
                          performanceBadge = <Badge variant="warning">Average</Badge>;
                        } else {
                          performanceBadge = <Badge variant="error">Needs Improvement</Badge>;
                        }
                        
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary text-white">
                                    {user.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-3">
                                  <p className="font-medium text-gray-900">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <FolderIcon className="h-4 w-4 text-gray-400 mr-2" />
                                <span>{metrics.totalCampaigns}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <div className="flex items-center">
                                  <span className="text-sm mr-2">
                                    {metrics.taskCompletionRate}%
                                  </span>
                                  <div className="w-24 bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-primary rounded-full h-2" 
                                      style={{ width: `${metrics.taskCompletionRate}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {metrics.completedTasks} completed, {metrics.pendingTasks} pending
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-gray-600">{metrics.activeCampaigns}</span>
                            </TableCell>
                            <TableCell>
                              {performanceBadge}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Workload Tab */}
        <TabsContent value="workload">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingUsers || isLoadingTasks ? (
              <div className="md:col-span-2 flex justify-center items-center h-52">
                <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              filteredUsers.map((user: any) => {
                const userTasks = getAssignedTasks(user.id);
                const pendingTasks = userTasks.filter(task => !task.completed);
                const userCampaigns = getCampaignsByUser(user.id);
                const activeCampaigns = userCampaigns.filter(campaign => campaign.status === 'active');
                
                // Calculate workload score based on pending tasks and active campaigns
                const workloadScore = (pendingTasks.length * 10) + (activeCampaigns.length * 15);
                let workloadStatus = 'Balanced';
                let workloadColor = 'bg-primary text-primary';
                
                if (workloadScore > 80) {
                  workloadStatus = 'Overloaded';
                  workloadColor = 'bg-error text-error';
                } else if (workloadScore > 50) {
                  workloadStatus = 'Heavy';
                  workloadColor = 'bg-warning text-warning';
                } else if (workloadScore < 20) {
                  workloadStatus = 'Light';
                  workloadColor = 'bg-success text-success';
                }
                
                return (
                  <Card key={user.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary text-white">
                              {user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <CardTitle>{user.name}</CardTitle>
                            <p className="text-sm text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${workloadColor.split(' ')[1]}/10 ${workloadColor.split(' ')[1]}`}>
                        {workloadStatus} Workload
                      </Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Current Workload</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="flex items-center text-amber-500 mb-1">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Pending Tasks</span>
                              </div>
                              <p className="text-xl font-semibold">{pendingTasks.length}</p>
                            </div>
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="flex items-center text-blue-500 mb-1">
                                <FolderIcon className="h-4 w-4 mr-1" />
                                <span className="text-xs font-medium">Active Campaigns</span>
                              </div>
                              <p className="text-xl font-semibold">{activeCampaigns.length}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-2">Pending Tasks</h3>
                          {pendingTasks.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {pendingTasks.slice(0, 4).map((task: any) => {
                                const campaign = campaigns?.find((c: any) => c.id === task.campaignId);
                                
                                return (
                                  <div key={task.id} className="border border-gray-200 rounded-md p-2 text-sm">
                                    <div className="flex justify-between items-start">
                                      <p className="font-medium">{task.title}</p>
                                      <Badge variant={task.priority as any}>
                                        {task.priority}
                                      </Badge>
                                    </div>
                                    {campaign && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Campaign: {campaign.name}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                              {pendingTasks.length > 4 && (
                                <Button variant="ghost" size="sm" className="w-full text-xs">
                                  View all {pendingTasks.length} tasks
                                </Button>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">No pending tasks</p>
                          )}
                        </div>
                        
                        <div className="pt-2">
                          <Button variant="outline" size="sm" className="w-full">
                            View Full Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
