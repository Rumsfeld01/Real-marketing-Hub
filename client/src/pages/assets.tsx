import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { 
  SearchIcon, 
  FilterIcon, 
  FolderPlusIcon, 
  Image as ImageIcon, 
  FileTextIcon, 
  FileIcon, 
  VideoIcon,
  DownloadIcon,
  TrashIcon,
  MoreHorizontalIcon,
  LucideLoader2
} from "lucide-react";
import { 
  RiFilterLine, 
  RiImage2Line, 
  RiFileTextLine, 
  RiVideoLine, 
  RiLayoutGridLine, 
  RiListCheck2
} from "react-icons/ri";

export default function AssetsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("grid");
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch all assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ['/api/assets'],
  });
  
  // Fetch users for asset ownership display
  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });
  
  // Fetch campaigns to filter assets by campaign
  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  // Filter assets based on search query, type, and campaign (tab)
  const filteredAssets = assets?.filter((asset: any) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || asset.type === filterType;
    const matchesCampaign = activeTab === "all" || 
                           (activeTab === "uncategorized" && !asset.campaignId) || 
                           (asset.campaignId === parseInt(activeTab));
    
    return matchesSearch && matchesType && matchesCampaign;
  }) || [];
  
  // Helper to get user name by ID
  const getUserName = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.name : "Unknown";
  };
  
  // Helper to get user initials by ID
  const getUserInitials = (userId: number) => {
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.initials : "?";
  };
  
  // Helper to get asset icon based on type
  const getAssetIcon = (type: string) => {
    switch (type) {
      case "image":
        return <RiImage2Line className="h-6 w-6 text-blue-500" />;
      case "document":
        return <RiFileTextLine className="h-6 w-6 text-amber-500" />;
      case "video":
        return <RiVideoLine className="h-6 w-6 text-red-500" />;
      default:
        return <FileIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Marketing Assets</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and organize your marketing assets
        </p>
      </div>
      
      {/* Actions and Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Button className="bg-primary text-white hover:bg-primary-dark">
            <FolderPlusIcon className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              type="text" 
              placeholder="Search assets..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-[250px]"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-white w-full md:w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="video">Videos</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-1 bg-white border border-gray-200 rounded-md">
            <Button 
              variant="ghost" 
              size="sm" 
              className={view === "grid" ? "bg-gray-100" : ""}
              onClick={() => setView("grid")}
            >
              <RiLayoutGridLine className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={view === "list" ? "bg-gray-100" : ""}
              onClick={() => setView("list")}
            >
              <RiListCheck2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Campaign Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-white border border-gray-200 overflow-auto">
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="uncategorized">Uncategorized</TabsTrigger>
          {campaigns?.map((campaign: any) => (
            <TabsTrigger key={campaign.id} value={campaign.id.toString()}>
              {campaign.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value={activeTab}>
          {isLoading ? (
            <div className="flex justify-center items-center h-52">
              <LucideLoader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <>
              {/* Grid View */}
              {view === "grid" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredAssets.map((asset: any) => (
                    <Card key={asset.id} className="overflow-hidden">
                      <div className="bg-gray-50 p-6 flex items-center justify-center">
                        {getAssetIcon(asset.type)}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-gray-900 truncate flex-1" title={asset.name}>
                            {asset.name}
                          </h3>
                          <Badge variant="outline" className="ml-2 capitalize">
                            {asset.type}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-500 mb-3 truncate" title={asset.url}>
                          {asset.url}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {getUserInitials(asset.uploadedBy)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-500 ml-2">
                              {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <DownloadIcon className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-500">
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* List View */}
              {view === "list" && (
                <Card>
                  <CardContent className="p-0">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredAssets.map((asset: any) => {
                          const campaign = campaigns?.find((c: any) => c.id === asset.campaignId);
                          
                          return (
                            <tr key={asset.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                                    {getAssetIcon(asset.type)}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{asset.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-xs" title={asset.url}>
                                      {asset.url}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge variant="outline" className="capitalize">
                                  {asset.type}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-[10px]">
                                      {getUserInitials(asset.uploadedBy)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="ml-2 text-sm text-gray-900">
                                    {getUserName(asset.uploadedBy)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                {campaign ? (
                                  <span className="text-sm text-gray-900">{campaign.name}</span>
                                ) : (
                                  <span className="text-sm text-gray-500">Uncategorized</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDistanceToNow(new Date(asset.createdAt), { addSuffix: true })}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <DownloadIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-500">
                                    <MoreHorizontalIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-gray-100 rounded-full p-4 mb-4">
                  {filterType === "image" ? (
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  ) : filterType === "document" ? (
                    <FileTextIcon className="h-8 w-8 text-gray-400" />
                  ) : filterType === "video" ? (
                    <VideoIcon className="h-8 w-8 text-gray-400" />
                  ) : (
                    <FileIcon className="h-8 w-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No assets found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery 
                    ? `No results for "${searchQuery}"` 
                    : activeTab !== "all" 
                      ? "No assets in this category" 
                      : "Upload your first asset to get started"}
                </p>
                <Button>
                  <FolderPlusIcon className="mr-2 h-4 w-4" />
                  Upload Asset
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
