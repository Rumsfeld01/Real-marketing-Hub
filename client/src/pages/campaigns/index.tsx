import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CampaignCard } from "@/components/dashboard/campaign-card";
import { 
  RiAddLine,
  RiFilter3Line,
  RiLayoutGridLine,
  RiListCheck2,
  RiCalendarLine,
  RiSearch2Line
} from "react-icons/ri";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { formatDistanceToNow } from "date-fns";

export default function Campaigns() {
  const [viewMode, setViewMode] = useState("cards");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch all campaigns
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  // Fetch campaign members for each campaign (for list view)
  const { data: membersByCampaign, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['/api/campaign-members'],
    queryFn: async () => {
      if (!campaigns) return {};
      
      const memberData: Record<number, any[]> = {};
      
      for (const campaign of campaigns) {
        const response = await fetch(`/api/campaigns/${campaign.id}/members`);
        if (response.ok) {
          const members = await response.json();
          const formattedMembers = members.map((member: any) => ({
            name: member.user.name,
            initials: member.user.initials
          }));
          memberData[campaign.id] = formattedMembers;
        }
      }
      
      return memberData;
    },
    enabled: !!campaigns,
  });
  
  // Filter campaigns based on status and search term
  const filteredCampaigns = campaigns?.filter((campaign: any) => {
    const matchesStatus = statusFilter === "all" || campaign.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Campaigns</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage your marketing campaigns
        </p>
      </div>
      
      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button asChild className="bg-primary text-white hover:bg-primary-dark">
            <Link href="/campaigns/new">
              <RiAddLine className="mr-2" />
              New Campaign
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <RiSearch2Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input 
              type="text" 
              placeholder="Search campaigns" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-[250px]"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white w-full md:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="text-gray-700 border-gray-200 bg-white">
            <RiFilter3Line className="mr-2" />
            More Filters
          </Button>
        </div>
      </div>
      
      {/* View Selector */}
      <div className="flex justify-between items-center mb-6">
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
      </div>
      
      {/* Campaigns (Card View) */}
      {viewMode === "cards" && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
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
          ) : filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCampaigns.map((campaign: any) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? `No campaigns matching "${searchTerm}"` 
                  : statusFilter !== "all" 
                    ? `No campaigns with status "${statusFilter}"` 
                    : "Get started by creating your first marketing campaign."}
              </p>
              <Button asChild>
                <Link href="/campaigns/new">
                  <RiAddLine className="mr-2" />
                  Create Campaign
                </Link>
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Campaigns (List View) */}
      {viewMode === "list" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((campaign: any) => {
                  const statusVariant: Record<string, string> = {
                    active: 'success',
                    attention: 'warning',
                    new: 'primary',
                    draft: 'default',
                    completed: 'secondary',
                    archived: 'outline'
                  };
                  
                  const variantToUse = statusVariant[campaign.status.toLowerCase()] || 'default';
                  const campaignMembers = membersByCampaign?.[campaign.id] || [];
                  
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <Link href={`/campaigns/${campaign.id}`} className="font-medium text-primary hover:underline">
                          {campaign.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant={variantToUse as any}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                          <div 
                            className={`bg-${variantToUse === 'success' ? 'success' : 
                                          variantToUse === 'warning' ? 'warning' : 
                                          variantToUse === 'primary' ? 'primary' : 'gray-400'} rounded-full h-2`} 
                            style={{ width: `${campaign.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{campaign.progress}%</span>
                      </TableCell>
                      <TableCell>
                        {isLoadingMembers ? (
                          <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                        ) : (
                          <AvatarGroup avatars={campaignMembers} max={3} />
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          {new Date(campaign.endDate).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600">
                          ${campaign.budget.toLocaleString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-gray-500">No campaigns found</p>
                    <Button asChild variant="outline" className="mt-4">
                      <Link href="/campaigns/new">
                        <RiAddLine className="mr-2" />
                        Create Campaign
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Calendar View (Placeholder) */}
      {viewMode === "calendar" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
          <p className="text-gray-500 mb-4">
            Calendar view allows you to visualize campaign schedules. For this demo, please use the Cards or List view.
          </p>
        </div>
      )}
    </>
  );
}
