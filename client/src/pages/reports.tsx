import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  DownloadIcon, 
  ShareIcon, 
  ChevronDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  LucideLoader2
} from "lucide-react";
import { 
  RiCalendarLine,
  RiRefreshLine
} from "react-icons/ri";
import { format, subDays } from "date-fns";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("performance");
  const [chartType, setChartType] = useState("bar");
  
  // Calculate date range based on selected time period
  const endDate = new Date();
  const startDate = subDays(endDate, parseInt(timeRange));
  
  // Fetch metrics data for the selected time range
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['/api/metrics', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  });
  
  // Fetch campaign data
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  // Process and aggregate metric data for charts
  const processMetricsData = () => {
    if (!metrics) return [];
    
    // Group metrics by date
    const metricsByDate = metrics.reduce((acc: Record<string, any>, metric: any) => {
      const date = format(new Date(metric.date), 'MMM d');
      if (!acc[date]) {
        acc[date] = { date, leads: 0, views: 0, clicks: 0, conversions: 0 };
      }
      acc[date].leads += metric.leads;
      acc[date].views += metric.views;
      acc[date].clicks += metric.clicks;
      acc[date].conversions += metric.conversions;
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(metricsByDate).sort((a: any, b: any) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  };
  
  // Process campaign performance data
  const processCampaignPerformance = () => {
    if (!metrics || !campaigns) return [];
    
    // Group metrics by campaign
    const metricsByCampaign = metrics.reduce((acc: Record<number, any>, metric: any) => {
      const campaignId = metric.campaignId;
      if (!acc[campaignId]) {
        acc[campaignId] = { 
          campaignId, 
          leads: 0, 
          views: 0, 
          clicks: 0, 
          conversions: 0 
        };
      }
      acc[campaignId].leads += metric.leads;
      acc[campaignId].views += metric.views;
      acc[campaignId].clicks += metric.clicks;
      acc[campaignId].conversions += metric.conversions;
      return acc;
    }, {});
    
    // Merge campaign data with metrics
    return Object.values(metricsByCampaign).map((metricData: any) => {
      const campaign = campaigns.find((c: any) => c.id === metricData.campaignId);
      return {
        ...metricData,
        name: campaign?.name || `Campaign ${metricData.campaignId}`,
        status: campaign?.status || 'unknown'
      };
    }).sort((a: any, b: any) => b.leads - a.leads);
  };
  
  // Calculate conversion rate metrics
  const calculateConversionMetrics = () => {
    if (!metrics) return { rate: 0, change: 0 };
    
    const totalViews = metrics.reduce((sum: number, metric: any) => sum + metric.views, 0);
    const totalConversions = metrics.reduce((sum: number, metric: any) => sum + metric.conversions, 0);
    
    const conversionRate = totalViews > 0 ? (totalConversions / totalViews) * 100 : 0;
    
    // Calculate change (this would typically compare to previous period)
    // For demo purposes we'll use a random value between -5 and 15
    const change = Math.round((Math.random() * 20) - 5) / 10;
    
    return { rate: conversionRate.toFixed(1), change };
  };
  
  // Calculate channel performance data for pie chart
  const calculateChannelPerformance = () => {
    if (!campaigns) return [];
    
    const channelCounts: Record<string, number> = {};
    
    campaigns.forEach((campaign: any) => {
      campaign.channels.forEach((channel: string) => {
        channelCounts[channel] = (channelCounts[channel] || 0) + 1;
      });
    });
    
    return Object.entries(channelCounts).map(([name, value]) => ({ name, value }));
  };
  
  const channelColors = ["#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ef4444", "#10b981"];
  
  // Format processed data
  const chartData = processMetricsData();
  const campaignPerformance = processCampaignPerformance();
  const conversionMetrics = calculateConversionMetrics();
  const channelData = calculateChannelPerformance();
  
  // Calculate summary metrics
  const totalLeads = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.leads, 0);
  const totalViews = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.views, 0);
  const totalClicks = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.clicks, 0);
  const totalConversions = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.conversions, 0);

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze your campaign performance and marketing results
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0"
            asChild
          >
            <Link href="/reports-interactive">
              <LineChartIcon className="mr-2 h-4 w-4" />
              Interactive Charts
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Report Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="bg-white">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-white flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RiRefreshLine className="h-4 w-4" />
            <span className="hidden md:inline">Refresh</span>
          </Button>
          
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md">
            <Button 
              variant="ghost" 
              size="sm" 
              className={chartType === "bar" ? "bg-gray-100" : ""}
              onClick={() => setChartType("bar")}
            >
              <BarChart3Icon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={chartType === "line" ? "bg-gray-100" : ""}
              onClick={() => setChartType("line")}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={chartType === "pie" ? "bg-gray-100" : ""}
              onClick={() => setChartType("pie")}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px] bg-white">
              <div className="flex items-center">
                <RiCalendarLine className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select time range" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Total Leads</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoadingMetrics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    totalLeads
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="text-primary text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Badge variant="success" className="flex items-center">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                5.2%
              </Badge>
              <span className="text-xs text-gray-500 ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Views</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoadingMetrics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    totalViews.toLocaleString()
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="text-success text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Badge variant="success" className="flex items-center">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                12.1%
              </Badge>
              <span className="text-xs text-gray-500 ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoadingMetrics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    `${conversionMetrics.rate}%`
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <svg className="text-warning text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-3">
              {conversionMetrics.change > 0 ? (
                <Badge variant="success" className="flex items-center">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  {conversionMetrics.change}%
                </Badge>
              ) : (
                <Badge variant="error" className="flex items-center">
                  <ArrowDownIcon className="mr-1 h-3 w-3" />
                  {Math.abs(conversionMetrics.change)}%
                </Badge>
              )}
              <span className="text-xs text-gray-500 ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">ROI</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {isLoadingMetrics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    "312%"
                  )}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <svg className="text-purple-600 text-lg h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Badge variant="success" className="flex items-center">
                <ArrowUpIcon className="mr-1 h-3 w-3" />
                8.7%
              </Badge>
              <span className="text-xs text-gray-500 ml-2">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>
        
        {/* Performance Tab */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingMetrics ? (
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickMargin={10}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }}
                            width={40}
                            tickFormatter={(value) => {
                              return value >= 1000 ? `${(value / 1000)}k` : value;
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                          <Bar dataKey="views" fill="#94a3b8" name="Views" />
                          <Bar dataKey="clicks" fill="#f97316" name="Clicks" />
                          <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
                        </BarChart>
                      ) : chartType === "line" ? (
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="date" />
                          <YAxis 
                            tickFormatter={(value) => {
                              return value >= 1000 ? `${(value / 1000)}k` : value;
                            }}
                          />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="leads" stroke="#3b82f6" name="Leads" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="views" stroke="#94a3b8" name="Views" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="clicks" stroke="#f97316" name="Clicks" strokeWidth={2} dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="conversions" stroke="#22c55e" name="Conversions" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                      ) : (
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Leads', value: totalLeads },
                              { name: 'Clicks', value: totalClicks },
                              { name: 'Conversions', value: totalConversions }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={120}
                            innerRadius={60}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill="#3b82f6" />
                            <Cell fill="#f97316" />
                            <Cell fill="#22c55e" />
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      )}
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No performance data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoadingMetrics ? (
                      Array(5).fill(null).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                        </tr>
                      ))
                    ) : chartData.length > 0 ? (
                      chartData.map((dataPoint: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap font-medium">{dataPoint.date}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{dataPoint.leads}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{dataPoint.views.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{dataPoint.clicks.toLocaleString()}</td>
                          <td className="px-4 py-3 whitespace-nowrap">{dataPoint.conversions}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {dataPoint.views > 0 ? `${((dataPoint.clicks / dataPoint.views) * 100).toFixed(2)}%` : '0%'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          No data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingMetrics || isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : campaignPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={campaignPerformance.slice(0, 6)} 
                        layout="vertical" 
                        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          width={100}
                        />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
                        <Bar dataKey="conversions" fill="#22c55e" name="Conversions" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No campaign data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conv. Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoadingMetrics || isLoadingCampaigns ? (
                      Array(5).fill(null).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        </tr>
                      ))
                    ) : campaignPerformance.length > 0 ? (
                      campaignPerformance.map((campaign: any, index: number) => {
                        const campaignDetails = campaigns.find((c: any) => c.id === campaign.campaignId);
                        const conversionRate = campaign.views > 0 ? 
                          (campaign.conversions / campaign.views) * 100 : 0;
                        const costPerLead = campaign.leads > 0 && campaignDetails ? 
                          campaignDetails.budget / campaign.leads : 0;
                        
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
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-medium">{campaign.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <Badge variant={getStatusVariant(campaign.status) as any} className="capitalize">
                                {campaign.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{campaign.leads}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{campaign.conversions}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{conversionRate.toFixed(2)}%</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              ${costPerLead.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          No campaign data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Channels Tab */}
        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : channelData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          innerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={channelColors[index % channelColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <PieChartIcon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No channel data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Channel Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingCampaigns ? (
                  <div className="space-y-4 animate-pulse">
                    {Array(6).fill(null).map((_, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                      </div>
                    ))}
                  </div>
                ) : channelData.length > 0 ? (
                  <div className="space-y-4">
                    {channelData.map((channel, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: channelColors[index % channelColors.length] }}
                          ></div>
                          <span className="text-sm font-medium capitalize">{channel.name}</span>
                        </div>
                        <span className="text-sm text-gray-600">{channel.value} campaigns</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No channel data available</p>
                )}
              </CardContent>
            </Card>
            
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Channel Effectiveness</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost Efficiency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoadingCampaigns || isLoadingMetrics ? (
                      Array(5).fill(null).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                        </tr>
                      ))
                    ) : channelData.length > 0 ? (
                      channelData.map((channel, index) => {
                        // Simulated metrics for channel effectiveness
                        // In a real app this would be calculated from actual data
                        const leads = Math.floor(Math.random() * 100) + 20;
                        const conversionRate = (Math.random() * 10).toFixed(2);
                        const efficiency = ["High", "Medium", "Low"][Math.floor(Math.random() * 3)];
                        const efficiencyColor = {
                          "High": "text-success",
                          "Medium": "text-warning",
                          "Low": "text-error"
                        }[efficiency] || "";
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2"
                                  style={{ backgroundColor: channelColors[index % channelColors.length] }}
                                ></div>
                                <span className="font-medium capitalize">{channel.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">{channel.value}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{leads}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{conversionRate}%</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={efficiencyColor}>{efficiency}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                          No channel data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* ROI Analysis Tab */}
        <TabsContent value="roi">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ROI by Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingMetrics || isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : campaignPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={campaignPerformance.slice(0, 5).map((campaign: any) => {
                          const campaignData = campaigns.find((c: any) => c.id === campaign.campaignId);
                          // Calculate ROI based on conversions and campaign budget
                          // Using a formula: (conversions * avg_value - budget) / budget * 100
                          const avgValue = 5000; // Assume average conversion value of $5000
                          const roi = campaignData && campaignData.budget > 0 ? 
                            ((campaign.conversions * avgValue - campaignData.budget) / campaignData.budget) * 100 : 0;
                          
                          return {
                            name: campaign.name,
                            roi: Math.max(0, roi)
                          };
                        })} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value) => [`${value.toFixed(0)}%`, "ROI"]}
                        />
                        <Bar dataKey="roi" fill="#8b5cf6" name="ROI %" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No ROI data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {isLoadingMetrics || isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 animate-pulse flex items-center justify-center">
                      <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : campaignPerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={campaignPerformance.slice(0, 5).map((campaign: any) => {
                          const campaignData = campaigns.find((c: any) => c.id === campaign.campaignId);
                          // Calculate cost per lead and conversion
                          const costPerLead = campaignData && campaign.leads > 0 ? 
                            campaignData.budget / campaign.leads : 0;
                          const costPerConversion = campaignData && campaign.conversions > 0 ? 
                            campaignData.budget / campaign.conversions : 0;
                          
                          return {
                            name: campaign.name,
                            costPerLead: costPerLead,
                            costPerConversion: costPerConversion
                          };
                        })} 
                        margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 12 }}
                          tickMargin={10}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, "Cost"]}
                        />
                        <Legend />
                        <Bar dataKey="costPerLead" fill="#ef4444" name="Cost per Lead" />
                        <Bar dataKey="costPerConversion" fill="#f97316" name="Cost per Conversion" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center">
                      <BarChart3Icon className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500">No cost data available for the selected period</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>ROI Analysis Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Lead</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Conv.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Revenue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {isLoadingMetrics || isLoadingCampaigns ? (
                      Array(5).fill(null).map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-10"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                        </tr>
                      ))
                    ) : campaignPerformance.length > 0 ? (
                      campaignPerformance.map((campaign: any, index: number) => {
                        const campaignData = campaigns.find((c: any) => c.id === campaign.campaignId);
                        if (!campaignData) return null;
                        
                        // Calculate ROI metrics
                        const avgValue = 5000; // Assume average conversion value of $5000
                        const costPerLead = campaign.leads > 0 ? 
                          campaignData.budget / campaign.leads : 0;
                        const costPerConversion = campaign.conversions > 0 ? 
                          campaignData.budget / campaign.conversions : 0;
                        const estimatedRevenue = campaign.conversions * avgValue;
                        const roi = campaignData.budget > 0 ? 
                          ((estimatedRevenue - campaignData.budget) / campaignData.budget) * 100 : 0;
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 whitespace-nowrap font-medium">{campaign.name}</td>
                            <td className="px-4 py-3 whitespace-nowrap">${campaignData.budget.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{campaign.leads}</td>
                            <td className="px-4 py-3 whitespace-nowrap">{campaign.conversions}</td>
                            <td className="px-4 py-3 whitespace-nowrap">${costPerLead.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">${costPerConversion.toFixed(2)}</td>
                            <td className="px-4 py-3 whitespace-nowrap">${estimatedRevenue.toLocaleString()}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={roi >= 0 ? "text-success" : "text-error"}>
                                {roi.toFixed(0)}%
                              </span>
                            </td>
                          </tr>
                        );
                      }).filter(Boolean)
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                          No ROI data available for the selected period
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}
