import { Badge } from "@/components/ui/badge";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CalendarIcon } from "lucide-react";

interface CampaignCardProps {
  campaign: {
    id: number;
    name: string;
    description: string;
    status: string;
    progress: number;
    endDate: string | Date;
  };
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: [`/api/campaigns/${campaign.id}/members`],
  });
  
  const statusVariant: Record<string, string> = {
    active: 'success',
    attention: 'warning',
    new: 'primary',
    draft: 'default',
    completed: 'secondary',
    archived: 'outline'
  };
  
  const variantToUse = statusVariant[campaign.status.toLowerCase()] || 'default';
  const endDate = new Date(campaign.endDate);
  const daysRemaining = formatDistanceToNow(endDate, { addSuffix: true });
  
  const teamMembers = members?.map((member: any) => ({
    name: member.user.name,
    initials: member.user.initials
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className={`h-2 bg-${variantToUse === 'success' ? 'success' : 
                                variantToUse === 'warning' ? 'warning' : 
                                variantToUse === 'primary' ? 'primary' : 'gray-300'}`}></div>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <Link href={`/campaigns/${campaign.id}`}>
            <h3 className="font-medium text-gray-900 hover:text-primary cursor-pointer">
              {campaign.name}
            </h3>
          </Link>
          <Badge variant={variantToUse as any}>
            {campaign.status}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-500 mt-2">{campaign.description}</p>
        
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
            <span>Progress</span>
            <span>{campaign.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`bg-${variantToUse === 'success' ? 'success' : 
                              variantToUse === 'warning' ? 'warning' : 
                              variantToUse === 'primary' ? 'primary' : 'gray-400'} rounded-full h-2`} 
              style={{ width: `${campaign.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          {isLoadingMembers ? (
            <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <AvatarGroup avatars={teamMembers} max={3} />
          )}
          
          <div className="text-xs text-gray-500 flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {endDate > new Date() ? `Ends ${daysRemaining}` : `Ended ${daysRemaining}`}
          </div>
        </div>
      </div>
    </div>
  );
}
