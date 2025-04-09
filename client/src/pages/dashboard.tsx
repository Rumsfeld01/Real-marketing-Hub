import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  RiMegaphoneLine,
  RiUserAddLine,
  RiPercentLine,
  RiFundsLine,
  RiAddLine,
  RiFilter3Line,
  RiLayoutGridLine,
  RiListCheck2,
  RiCalendarLine
} from "react-icons/ri";
import { MetricsCard } from "@/components/dashboard/metrics-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { CampaignCard } from "@/components/dashboard/campaign-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { TaskList } from "@/components/dashboard/task-list";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState("cards");
  const [timePeriod, setTimePeriod] = useState("30");

  // Fetch active campaigns
  const { data: activeCampaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns/active'],
  });

  // For this example, we'll simulate metrics data that would come from an API
  const metricsData = {
    activeCampaigns: {
      value: activeCampaigns?.length || 0,
      changePercentage: 12
    },
    leadsGenerated: {
      value: 129,
      changePercentage: 24
    },
    conversionRate: {
      value: "4.8%",
      changePercentage: 2.1
    },
    roi: {
      value: "342%",
      changePercentage: -3.4
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Overview of your marketing campaigns and performance
        </p>
      </div>
      
      {/* Dashboard Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button asChild className="bg-primary text-white hover:bg-primary-dark">
            <Link href="/campaigns/new">
              <RiAddLine className="mr-2" />
              New Campaign
            </Link>
          </Button>
          
          <Button variant="outline" className="text-gray-700 border-gray-200 bg-white">
            <RiFilter3Line className="mr-2" />
            Filter
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={setViewMode} className="bg-white border border-gray-200 rounded-md">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="cards" 
                className={viewMode === "cards" ? "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary" : ""}
              >
                <RiLayoutGridLine className="mr-2" />
                Cards
              </TabsTrigger>
              <TabsTrigger 
                value="list"
                className={viewMode === "list" ? "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary" : ""}
              >
                <RiListCheck2 className="mr-2" />
                List
              </TabsTrigger>
              <TabsTrigger 
                value="calendar"
                className={viewMode === "calendar" ? "data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary" : ""}
              >
                <RiCalendarLine className="mr-2" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[150px] border-gray-200 bg-white">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="180">Last 6 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricsCard
          title="Active Campaigns"
          value={metricsData.activeCampaigns.value}
          icon={<RiMegaphoneLine className="text-primary text-lg" />}
          iconBgClass="bg-blue-100"
          changePercentage={metricsData.activeCampaigns.changePercentage}
        />
        
        <MetricsCard
          title="Leads Generated"
          value={metricsData.leadsGenerated.value}
          icon={<RiUserAddLine className="text-success text-lg" />}
          iconBgClass="bg-green-100"
          changePercentage={metricsData.leadsGenerated.changePercentage}
        />
        
        <MetricsCard
          title="Conversion Rate"
          value={metricsData.conversionRate.value}
          icon={<RiPercentLine className="text-accent text-lg" />}
          iconBgClass="bg-orange-100"
          changePercentage={metricsData.conversionRate.changePercentage}
        />
        
        <MetricsCard
          title="ROI"
          value={metricsData.roi.value}
          icon={<RiFundsLine className="text-purple-600 text-lg" />}
          iconBgClass="bg-purple-100"
          changePercentage={metricsData.roi.changePercentage}
        />
      </div>
      
      {/* Campaign Performance Chart */}
      <PerformanceChart />
      
      {/* Active Campaigns */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900">Active Campaigns</h2>
          <Link href="/campaigns" className="text-sm text-primary font-medium hover:underline">
            View all
          </Link>
        </div>
        
        {isLoadingCampaigns ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-2 bg-gray-200 rounded-full w-full mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="flex -space-x-2">
                    {Array(3).fill(0).map((_, j) => (
                      <div key={j} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white"></div>
                    ))}
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activeCampaigns && activeCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCampaigns.map((campaign: any) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active campaigns</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first marketing campaign.</p>
            <Button asChild>
              <Link href="/campaigns/new">
                <RiAddLine className="mr-2" />
                Create Campaign
              </Link>
            </Button>
          </div>
        )}
      </div>
      
      {/* Team Activity and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - 2/3 width on large screens */}
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        
        {/* Task List - 1/3 width on large screens */}
        <div>
          <TaskList />
        </div>
      </div>
    </>
  );
}
