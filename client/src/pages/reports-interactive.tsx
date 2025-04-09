import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DownloadIcon, 
  ShareIcon, 
  ChevronDownIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  BarChart3Icon,
  PieChartIcon,
  LineChartIcon,
  AreaChartIcon,
  UsersIcon,
  EyeIcon,
  DollarSignIcon,
  TrendingUpIcon,
  PercentIcon,
  CalendarIcon,
  FilterIcon,
  RefreshCwIcon
} from "lucide-react";
import { RiCalendarLine, RiRefreshLine } from "react-icons/ri";
import { format, subDays, isAfter, isBefore, parse, startOfDay, endOfDay } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

import {
  InteractiveBarChart,
  InteractiveLineChart,
  InteractivePieChart,
  AnimatedAreaChart,
  AnimatedRadialBarChart,
  InteractiveScatterChart,
  AnimatedProgressBar,
  AnimatedCounter,
  ComparisonBarChart,
  BubbleChart
} from "@/components/charts/InteractiveCharts";

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState("30");
  const [activeTab, setActiveTab] = useState("performance");
  const [chartType, setChartType] = useState("line");
  const [showFilters, setShowFilters] = useState(false);
  
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
    // For demo purposes we'll use a small random value
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
  
  // Calculate ROI data
  const calculateROIData = () => {
    if (!campaigns) return [];
    
    // In a real application, this would be calculated from actual revenue/cost data
    return campaigns.map((campaign: any) => {
      // For demo purposes, generate realistic ROI data based on campaign properties
      const cost = campaign.budget || Math.floor(Math.random() * 5000) + 1000;
      const revenue = cost * (1 + (Math.random() * 5));
      const roi = ((revenue - cost) / cost) * 100;
      
      return {
        name: campaign.name,
        cost,
        revenue,
        roi: parseFloat(roi.toFixed(1))
      };
    });
  };
  
  // Generate comparative performance data
  const generateComparativeData = () => {
    if (!campaigns) return [];
    
    return campaigns.slice(0, 5).map((campaign: any) => {
      // For demo purposes, generate current vs previous period metrics
      const previousLeads = Math.floor(Math.random() * 200) + 50;
      const currentLeads = previousLeads * (Math.random() * 0.5 + 0.8); // Between 80% and 130% of previous
      
      return {
        name: campaign.name,
        previous: previousLeads,
        current: Math.floor(currentLeads)
      };
    });
  };
  
  // Calculate demographic data for the bubble chart
  const calculateDemographicData = () => {
    // In a real application, this would come from demographic data on leads
    const ageGroups = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
    const incomeRanges = ['0-50k', '50k-100k', '100k-150k', '150k-200k', '200k+'];
    
    return ageGroups.flatMap((age) => 
      incomeRanges.map((income) => {
        // Generate random number of leads for each demographic segment
        const leads = Math.floor(Math.random() * 100) + 10;
        // Value score (e.g., average property value interested in)
        const value = Math.floor(Math.random() * 800000) + 200000;
        
        return {
          ageGroup: age,
          incomeRange: income,
          leads,
          avgPropertyValue: value,
          segment: `${age} / ${income}`
        };
      })
    );
  };
  
  const channelColors = [
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f97316", // Orange
    "#8b5cf6", // Purple
    "#ef4444", // Red
    "#06b6d4"  // Cyan
  ];
  
  // Format processed data
  const chartData = processMetricsData();
  const campaignPerformance = processCampaignPerformance();
  const conversionMetrics = calculateConversionMetrics();
  const channelData = calculateChannelPerformance();
  const roiData = calculateROIData();
  const comparativeData = generateComparativeData();
  const demographicData = calculateDemographicData();
  
  // Calculate summary metrics
  const totalLeads = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.leads, 0);
  const totalViews = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.views, 0);
  const totalClicks = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.clicks, 0);
  const totalConversions = chartData.reduce((sum: number, dataPoint: any) => sum + dataPoint.conversions, 0);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Interactive Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">
              Analyze your campaign performance with interactive visualizations
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mt-2 sm:mt-0"
            asChild
          >
            <Link href="/reports">
              <BarChart3Icon className="mr-2 h-4 w-4" />
              Standard Reports
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Report Controls */}
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white">
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" className="bg-white">
            <ShareIcon className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button 
            variant="outline" 
            className="bg-white"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FilterIcon className="h-4 w-4 mr-2" />
            <span className="hidden md:inline">Filters</span>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="bg-white flex items-center gap-2"
            onClick={() => window.location.reload()}
          >
            <RefreshCwIcon className="h-4 w-4" />
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
              className={chartType === "area" ? "bg-gray-100" : ""}
              onClick={() => setChartType("area")}
            >
              <AreaChartIcon className="h-4 w-4" />
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
                <CalendarIcon className="mr-2 h-4 w-4" />
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
      </motion.div>
      
      {/* Filters Panel - Animated */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            className="bg-white p-4 rounded-lg border border-gray-200 mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium text-gray-700 mb-3">Filter Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Status</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Channel</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Channels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="ppc">PPC</SelectItem>
                    <SelectItem value="print">Print</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                <Select defaultValue="all">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Audiences" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Audiences</SelectItem>
                    <SelectItem value="first-time">First-time Homebuyers</SelectItem>
                    <SelectItem value="investors">Investors</SelectItem>
                    <SelectItem value="luxury">Luxury Buyers</SelectItem>
                    <SelectItem value="downsizing">Downsizing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" className="mr-2">Reset</Button>
              <Button size="sm">Apply Filters</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Summary Metrics with Animation */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Total Leads</p>
                  <h3 className="text-2xl font-semibold mt-1">
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <AnimatedCounter 
                        value={totalLeads} 
                        label="" 
                        icon={<UsersIcon />} 
                        color="#3b82f6"
                        duration={1.5}
                      />
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <UsersIcon className="text-blue-500 h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <Badge variant="outline" className="flex items-center text-green-600 bg-green-50 border-green-200">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  5.2%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Views</p>
                  <h3 className="text-2xl font-semibold mt-1">
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <AnimatedCounter 
                        value={totalViews} 
                        label="" 
                        icon={<EyeIcon />} 
                        color="#10b981"
                      />
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <EyeIcon className="text-green-500 h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <Badge variant="outline" className="flex items-center text-green-600 bg-green-50 border-green-200">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  12.1%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-orange-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Conversion Rate</p>
                  <h3 className="text-2xl font-semibold mt-1">
                    {isLoadingMetrics ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <AnimatedCounter 
                        value={parseFloat(conversionMetrics.rate)} 
                        label="" 
                        icon={<PercentIcon />} 
                        color="#f97316"
                        suffix="%"
                      />
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <PercentIcon className="text-orange-500 h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                {conversionMetrics.change > 0 ? (
                  <Badge variant="outline" className="flex items-center text-green-600 bg-green-50 border-green-200">
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                    {conversionMetrics.change}%
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center text-red-600 bg-red-50 border-red-200">
                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                    {Math.abs(conversionMetrics.change)}%
                  </Badge>
                )}
                <span className="text-xs text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">Avg. ROI</p>
                  <h3 className="text-2xl font-semibold mt-1">
                    {isLoadingCampaigns ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      <AnimatedCounter 
                        value={312} 
                        label="" 
                        icon={<TrendingUpIcon />} 
                        color="#8b5cf6"
                        suffix="%"
                      />
                    )}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUpIcon className="text-purple-500 h-5 w-5" />
                </div>
              </div>
              <div className="flex items-center mt-3">
                <Badge variant="outline" className="flex items-center text-green-600 bg-green-50 border-green-200">
                  <ArrowUpIcon className="mr-1 h-3 w-3" />
                  8.7%
                </Badge>
                <span className="text-xs text-gray-500 ml-2">vs previous period</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      
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
          <motion.div 
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Over Time</CardTitle>
                <CardDescription>
                  Visualize leads, views, clicks and conversions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingMetrics ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <span className="mt-2 text-sm text-gray-500">Loading data...</span>
                      </div>
                    </div>
                  ) : chartData.length === 0 ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500">No data available for the selected time period</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => setTimeRange("90")}
                        >
                          Try a longer time range
                        </Button>
                      </div>
                    </div>
                  ) : chartType === "bar" ? (
                    <InteractiveBarChart
                      data={chartData}
                      dataKeys={["leads", "views", "clicks", "conversions"]}
                      xAxisKey="date"
                      height={400}
                      title=""
                      subtitle=""
                      colors={["#3b82f6", "#10b981", "#f97316", "#8b5cf6"]}
                    />
                  ) : chartType === "line" ? (
                    <InteractiveLineChart
                      data={chartData}
                      dataKeys={["leads", "views", "clicks", "conversions"]}
                      xAxisKey="date"
                      height={400}
                      title=""
                      subtitle=""
                      colors={["#3b82f6", "#10b981", "#f97316", "#8b5cf6"]}
                    />
                  ) : chartType === "area" ? (
                    <AnimatedAreaChart
                      data={chartData}
                      dataKeys={["leads", "views", "clicks", "conversions"]}
                      xAxisKey="date"
                      height={400}
                      title=""
                      subtitle=""
                      colors={["#3b82f6", "#10b981", "#f97316", "#8b5cf6"]}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <p className="text-gray-500">Select a different chart type for this data</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-gray-500">
                  Showing data from {format(startDate, 'PP')} to {format(endDate, 'PP')}
                </div>
                <Button variant="outline" size="sm">
                  <DownloadIcon className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
              </CardFooter>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>
                    Breakdown of lead generation channels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <InteractivePieChart
                        data={channelData}
                        dataKey="value"
                        nameKey="name"
                        colors={channelColors}
                        height={320}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Comparison</CardTitle>
                  <CardDescription>
                    Compare leads between campaigns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ComparisonBarChart
                        data={comparativeData}
                        leftDataKey="previous"
                        rightDataKey="current"
                        nameKey="name"
                        leftColor="#94a3b8"
                        rightColor="#3b82f6"
                        height={320}
                        leftLabel="Previous Period"
                        rightLabel="Current Period"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>KPI Progress</CardTitle>
                <CardDescription>
                  Progress toward quarterly targets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {isLoadingMetrics ? (
                    <>
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                      <Skeleton className="h-8 w-full" />
                    </>
                  ) : (
                    <>
                      <AnimatedProgressBar
                        value={totalLeads}
                        maxValue={500}
                        label="Leads Generated"
                        color="#3b82f6"
                      />
                      <AnimatedProgressBar
                        value={parseFloat(conversionMetrics.rate)}
                        maxValue={10}
                        label="Conversion Rate (%)"
                        color="#f97316"
                      />
                      <AnimatedProgressBar
                        value={totalViews}
                        maxValue={10000}
                        label="Total Impressions"
                        color="#10b981"
                      />
                      <AnimatedProgressBar
                        value={312}
                        maxValue={500}
                        label="ROI (%)"
                        color="#8b5cf6"
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <motion.div 
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance Ranking</CardTitle>
                <CardDescription>
                  Compare performance metrics across all campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingMetrics || isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : campaignPerformance.length === 0 ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <p className="text-gray-500">No campaign data available for the selected time period</p>
                    </div>
                  ) : (
                    <InteractiveBarChart
                      data={campaignPerformance}
                      dataKeys={["leads", "conversions"]}
                      xAxisKey="name"
                      height={400}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {isLoadingCampaigns ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : campaigns?.slice(0, 3).map((campaign: any, index: number) => (
                <Card key={campaign.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{campaign.name}</CardTitle>
                      <Badge 
                        variant={
                          campaign.status === 'active' ? 'success' :
                          campaign.status === 'completed' ? 'default' :
                          campaign.status === 'paused' ? 'warning' : 'outline'
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <AnimatedProgressBar
                        value={campaign.progress || 0}
                        maxValue={100}
                        label="Campaign Progress"
                        color={channelColors[index % channelColors.length]}
                      />
                      
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="bg-gray-50 p-2 rounded-md text-center">
                          <p className="text-xs text-gray-500">Leads</p>
                          <p className="text-xl font-medium">
                            {(campaignPerformance.find(c => c.campaignId === campaign.id)?.leads || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-md text-center">
                          <p className="text-xs text-gray-500">Conversions</p>
                          <p className="text-xl font-medium">
                            {(campaignPerformance.find(c => c.campaignId === campaign.id)?.conversions || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Channels</h4>
                        <div className="flex flex-wrap gap-1">
                          {campaign.channels.map((channel: string, i: number) => (
                            <Badge 
                              key={i} 
                              variant="outline"
                              className="bg-gray-50"
                            >
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Campaign Timeline & Schedule</CardTitle>
                <CardDescription>
                  View upcoming and active campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingCampaigns ? (
                    Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))
                  ) : campaigns?.map((campaign: any) => {
                    const startDate = new Date(campaign.startDate);
                    const endDate = new Date(campaign.endDate);
                    const now = new Date();
                    const isActive = isAfter(now, startDate) && isBefore(now, endDate);
                    const isUpcoming = isAfter(startDate, now);
                    const isPast = isAfter(now, endDate);
                    
                    // Calculate width percentage based on dates
                    const totalDuration = endDate.getTime() - startDate.getTime();
                    let progress = 0;
                    
                    if (isActive) {
                      const elapsed = now.getTime() - startDate.getTime();
                      progress = (elapsed / totalDuration) * 100;
                    } else if (isPast) {
                      progress = 100;
                    }
                    
                    return (
                      <div 
                        key={campaign.id} 
                        className={`p-4 border rounded-lg ${
                          isActive ? 'border-blue-200 bg-blue-50' : 
                          isUpcoming ? 'border-green-200 bg-green-50' : 
                          'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium">{campaign.name}</h3>
                            <p className="text-sm text-gray-500">
                              {format(startDate, 'PP')} - {format(endDate, 'PP')}
                            </p>
                          </div>
                          <Badge 
                            variant={
                              isActive ? 'success' : 
                              isUpcoming ? 'outline' : 
                              'default'
                            }
                          >
                            {isActive ? 'Active' : isUpcoming ? 'Upcoming' : 'Completed'}
                          </Badge>
                        </div>
                        
                        {isActive && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                              <motion.div
                                className="h-2.5 rounded-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1 }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {Math.round(progress)}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* Channels Tab */}
        <TabsContent value="channels">
          <motion.div 
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Channel Distribution</CardTitle>
                <CardDescription>
                  Breakdown of marketing channels used in your campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : channelData.length === 0 ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <p className="text-gray-500">No channel data available</p>
                    </div>
                  ) : (
                    <InteractivePieChart
                      data={channelData}
                      dataKey="value"
                      nameKey="name"
                      colors={channelColors}
                      height={400}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>
                    Effectiveness of each marketing channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <AnimatedRadialBarChart
                        data={channelData.map((channel, index) => ({
                          ...channel,
                          fill: channelColors[index % channelColors.length],
                          performance: Math.floor(Math.random() * 100) + 20
                        }))}
                        dataKey="performance"
                        nameKey="name"
                        colors={channelColors}
                        height={320}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Channel Trends</CardTitle>
                  <CardDescription>
                    Performance trends over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <InteractiveLineChart
                        data={[...Array(6)].map((_, i) => {
                          const date = format(subDays(new Date(), (5-i) * 15), 'MMM d');
                          // Create random trend data for each channel
                          const channelValues: Record<string, number> = {};
                          channelData.forEach(channel => {
                            channelValues[channel.name] = Math.floor(Math.random() * 50) + 10;
                          });
                          return {
                            date,
                            ...channelValues
                          };
                        })}
                        dataKeys={channelData.map(c => c.name)}
                        xAxisKey="date"
                        colors={channelColors}
                        height={320}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Demographic Analysis</CardTitle>
                <CardDescription>
                  How different demographics respond to your channels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <InteractiveScatterChart
                      data={demographicData}
                      xDataKey="leads"
                      yDataKey="avgPropertyValue"
                      nameKey="segment"
                      colors={channelColors}
                      height={400}
                      title=""
                      subtitle=""
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="text-sm text-gray-500">
                  Bubble size represents the relative market share of each demographic segment
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
        
        {/* ROI Analysis Tab */}
        <TabsContent value="roi">
          <motion.div 
            className="grid grid-cols-1 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Campaign ROI Comparison</CardTitle>
                <CardDescription>
                  Return on investment across campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : roiData.length === 0 ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <p className="text-gray-500">No ROI data available</p>
                    </div>
                  ) : (
                    <InteractiveBarChart
                      data={roiData}
                      dataKeys={["roi"]}
                      xAxisKey="name"
                      colors={["#8b5cf6"]} // Purple
                      height={400}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cost vs. Revenue</CardTitle>
                  <CardDescription>
                    Campaign budget against generated revenue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <ComparisonBarChart
                        data={roiData}
                        leftDataKey="cost"
                        rightDataKey="revenue"
                        nameKey="name"
                        leftColor="#ef4444" // Red
                        rightColor="#22c55e" // Green
                        height={320}
                        leftLabel="Cost"
                        rightLabel="Revenue"
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>ROI by Channel</CardTitle>
                  <CardDescription>
                    Return on investment per marketing channel
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {isLoadingCampaigns ? (
                      <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <InteractivePieChart
                        data={channelData.map((channel) => ({
                          name: channel.name,
                          value: Math.floor(Math.random() * 400) + 100
                        }))}
                        dataKey="value"
                        nameKey="name"
                        colors={channelColors}
                        height={320}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Monthly Investment & Returns</CardTitle>
                <CardDescription>
                  Marketing spend and returns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {isLoadingCampaigns ? (
                    <div className="h-full w-full bg-gray-50 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <AnimatedAreaChart
                      data={[...Array(6)].map((_, i) => {
                        const month = format(subDays(new Date(), (5-i) * 30), 'MMM yyyy');
                        const investment = Math.floor(Math.random() * 10000) + 5000;
                        const returns = investment * (Math.random() * 3 + 1);
                        return {
                          month,
                          investment,
                          returns,
                          profit: returns - investment
                        };
                      })}
                      dataKeys={["investment", "returns", "profit"]}
                      xAxisKey="month"
                      colors={["#94a3b8", "#22c55e", "#8b5cf6"]}
                      height={400}
                    />
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t p-4">
                <div className="text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-1"></div>
                      <span>Investment</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                      <span>Returns</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-1"></div>
                      <span>Profit</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </>
  );
}