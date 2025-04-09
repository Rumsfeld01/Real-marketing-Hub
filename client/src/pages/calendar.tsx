import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  addDays, 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  isSameDay,
  parseISO,
  getDay,
  startOfWeek,
  endOfWeek,
  isWithinInterval
} from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, FilterIcon, PlusIcon } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [filter, setFilter] = useState("all");
  
  // Fetch campaigns data
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  // Fetch tasks data
  const { data: allTasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Filter campaigns based on status
  const filteredCampaigns = campaigns?.filter((campaign: any) => {
    return filter === "all" || campaign.status === filter;
  }) || [];
  
  // Generate calendar days for the month
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add days from previous month to fill the first week
  const firstDayOfMonth = getDay(monthStart);
  const prevMonthDays = firstDayOfMonth > 0 
    ? eachDayOfInterval({ 
        start: startOfWeek(monthStart), 
        end: addDays(monthStart, -1) 
      }) 
    : [];
  
  // Add days from next month to fill the last week
  const lastDayOfMonth = getDay(monthEnd);
  const nextMonthDays = lastDayOfMonth < 6 
    ? eachDayOfInterval({ 
        start: addDays(monthEnd, 1), 
        end: endOfWeek(monthEnd) 
      }) 
    : [];
  
  // Combine all days for the calendar grid
  const calendarDays = [...prevMonthDays, ...monthDays, ...nextMonthDays];
  
  // Get campaigns for a specific day
  const getCampaignsForDay = (day: Date) => {
    return filteredCampaigns.filter((campaign: any) => {
      const startDate = parseISO(campaign.startDate);
      const endDate = parseISO(campaign.endDate);
      return isWithinInterval(day, { start: startDate, end: endDate });
    });
  };
  
  // Get tasks for a specific day
  const getTasksForDay = (day: Date) => {
    return allTasks?.filter((task: any) => {
      return isSameDay(parseISO(task.dueDate), day);
    }) || [];
  };
  
  // Calculate the week interval for the week view
  const weekStart = startOfWeek(date);
  const weekEnd = endOfWeek(date);
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Handle navigation
  const navigateToPrevious = () => {
    if (view === "month") {
      setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
    } else if (view === "week") {
      setDate(addDays(date, -7));
    } else {
      setDate(addDays(date, -1));
    }
  };
  
  const navigateToNext = () => {
    if (view === "month") {
      setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
    } else if (view === "week") {
      setDate(addDays(date, 7));
    } else {
      setDate(addDays(date, 1));
    }
  };
  
  const navigateToToday = () => {
    setDate(new Date());
  };
  
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

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Campaign Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">
          View and manage your campaign schedule
        </p>
      </div>
      
      {/* Calendar Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button asChild className="bg-primary text-white hover:bg-primary-dark">
            <Link href="/campaigns/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-md">
            <Button variant="ghost" size="sm" onClick={navigateToPrevious}>
              <ChevronLeftIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={navigateToToday}>
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={navigateToNext}>
              <ChevronRightIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="outline" className="hidden md:flex">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "MMMM yyyy")}
          </Button>
          
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Calendar Date Display (Mobile) */}
      <div className="md:hidden mb-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{format(date, "MMMM yyyy")}</h2>
        </div>
      </div>
      
      {/* Month View */}
      {view === "month" && (
        <Card>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="h-96 flex items-center justify-center">
                <CalendarIcon className="h-12 w-12 animate-pulse text-gray-300" />
              </div>
            ) : (
              <div>
                {/* Calendar header - weekday names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const isCurrentMonth = day.getMonth() === date.getMonth();
                    const isToday = isSameDay(day, new Date());
                    const campaignsForDay = getCampaignsForDay(day);
                    const tasksForDay = getTasksForDay(day);
                    
                    return (
                      <div 
                        key={index}
                        className={`min-h-[100px] border rounded-md p-1 ${
                          isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                        } ${isToday ? 'border-primary' : 'border-gray-200'}`}
                      >
                        <div className={`text-right text-sm p-1 ${
                          isToday ? 'bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center ml-auto' : 
                          isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                        }`}>
                          {day.getDate()}
                        </div>
                        
                        <div className="mt-1 space-y-1 overflow-y-auto max-h-[70px]">
                          {campaignsForDay.slice(0, 2).map((campaign: any) => (
                            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                              <div className={`text-xs truncate p-1 rounded-sm bg-${getStatusVariant(campaign.status)}/10 text-${getStatusVariant(campaign.status) === 'outline' ? 'gray-600' : getStatusVariant(campaign.status)}`}>
                                {campaign.name}
                              </div>
                            </Link>
                          ))}
                          
                          {campaignsForDay.length > 2 && (
                            <div className="text-xs text-gray-500 p-1">
                              +{campaignsForDay.length - 2} more
                            </div>
                          )}
                          
                          {tasksForDay.length > 0 && (
                            <div className="text-xs text-gray-600 p-1 bg-gray-100 rounded-sm">
                              {tasksForDay.length} {tasksForDay.length === 1 ? 'task' : 'tasks'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Week View */}
      {view === "week" && (
        <Card>
          <CardHeader>
            <CardTitle>
              Week of {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weekDays.map((day, index) => {
                const isToday = isSameDay(day, new Date());
                const campaignsForDay = getCampaignsForDay(day);
                const tasksForDay = getTasksForDay(day);
                
                return (
                  <div 
                    key={index}
                    className={`border rounded-md p-3 ${isToday ? 'border-primary bg-primary/5' : 'border-gray-200'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-medium ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                        {format(day, "EEEE, MMMM d")}
                      </h3>
                      {isToday && (
                        <Badge variant="primary">Today</Badge>
                      )}
                    </div>
                    
                    {campaignsForDay.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-500">Campaigns</h4>
                        <div className="space-y-1">
                          {campaignsForDay.map((campaign: any) => (
                            <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                              <div className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                                <div className={`w-2 h-2 rounded-full bg-${getStatusVariant(campaign.status) === 'outline' ? 'gray-400' : getStatusVariant(campaign.status)}`} />
                                <span className="ml-2 text-sm font-medium">{campaign.name}</span>
                                <Badge variant={getStatusVariant(campaign.status) as any} className="ml-2">
                                  {campaign.status}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    {tasksForDay.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        <h4 className="text-sm font-medium text-gray-500">Tasks</h4>
                        <div className="space-y-1">
                          {tasksForDay.map((task: any) => (
                            <div key={task.id} className="flex items-center p-2 hover:bg-gray-50 rounded-md">
                              <div className={`w-2 h-2 rounded-full ${
                                task.priority === 'urgent' ? 'bg-error' :
                                task.priority === 'high' ? 'bg-warning' :
                                task.priority === 'medium' ? 'bg-primary' :
                                'bg-gray-400'
                              }`} />
                              <span className={`ml-2 text-sm ${task.completed ? 'line-through text-gray-400' : 'font-medium'}`}>
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    
                    {campaignsForDay.length === 0 && tasksForDay.length === 0 && (
                      <p className="text-sm text-gray-500 py-2">No campaigns or tasks scheduled</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Day View */}
      {view === "day" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>
                {format(date, "EEEE, MMMM d, yyyy")}
                {isSameDay(date, new Date()) && (
                  <Badge variant="primary" className="ml-2">Today</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Campaigns</h3>
                  {getCampaignsForDay(date).length > 0 ? (
                    <div className="space-y-2">
                      {getCampaignsForDay(date).map((campaign: any) => (
                        <Link key={campaign.id} href={`/campaigns/${campaign.id}`}>
                          <div className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                                <p className="text-sm text-gray-500 mt-1">{campaign.description}</p>
                              </div>
                              <Badge variant={getStatusVariant(campaign.status) as any}>
                                {campaign.status}
                              </Badge>
                            </div>
                            
                            <div className="mt-3">
                              <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{campaign.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`bg-${getStatusVariant(campaign.status) === 'success' ? 'success' : 
                                              getStatusVariant(campaign.status) === 'warning' ? 'warning' : 
                                              getStatusVariant(campaign.status) === 'primary' ? 'primary' : 'gray-400'} rounded-full h-2`} 
                                  style={{ width: `${campaign.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No campaigns scheduled for this day</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tasks</h3>
                  {getTasksForDay(date).length > 0 ? (
                    <div className="space-y-2">
                      {getTasksForDay(date).map((task: any) => (
                        <div key={task.id} className="border border-gray-200 rounded-md p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.priority as any}>
                              {task.priority}
                            </Badge>
                          </div>
                          {task.description && (
                            <p className={`text-sm mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                              {task.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No tasks due on this day</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                className="rounded-md border"
              />
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Jump to</h3>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setDate(addDays(new Date(), 1))}
                  >
                    Tomorrow
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => {
                      const nextMonday = new Date();
                      nextMonday.setDate(nextMonday.getDate() + (1 + 7 - nextMonday.getDay()) % 7);
                      setDate(nextMonday);
                    }}
                  >
                    Next Monday
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
