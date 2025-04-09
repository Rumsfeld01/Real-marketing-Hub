import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function ActivityFeed() {
  // Fetch recent activities and related user/campaign data
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['/api/activities'],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=5');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    }
  });

  const { data: users } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: campaigns } = useQuery({
    queryKey: ['/api/campaigns'],
  });

  // Helper function to find user by ID
  const findUser = (userId: number) => {
    return users?.find((user: any) => user.id === userId);
  };

  // Helper function to find campaign by ID
  const findCampaign = (campaignId: number) => {
    return campaigns?.find((campaign: any) => campaign.id === campaignId);
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        <button 
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => refetch()}
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="flex animate-pulse">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200"></div>
              <div className="ml-3 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          activities.map((activity: any) => {
            const user = findUser(activity.userId);
            const campaign = activity.campaignId ? findCampaign(activity.campaignId) : null;
            
            if (!user) return null;
            
            return (
              <div className="flex" key={activity.id}>
                <Avatar className="flex-shrink-0 w-8 h-8">
                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                    {user.initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="ml-3">
                  <p className="text-sm">
                    <span className="font-medium text-gray-900">{user.name}</span>
                    <span className="text-gray-500"> {activity.actionType === 'comment' ? 'commented on' : activity.actionType === 'create' ? 'created' : activity.actionType === 'update' ? 'updated' : activity.actionType} </span>
                    {campaign && (
                      <span className="font-medium text-gray-900">{campaign.name}</span>
                    )}
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
          })
        ) : (
          <p className="text-sm text-gray-500">No recent activity</p>
        )}
      </div>
      
      <div className="mt-4 text-center">
        <button className="text-sm text-primary font-medium hover:underline">
          View all activity
        </button>
      </div>
    </Card>
  );
}
