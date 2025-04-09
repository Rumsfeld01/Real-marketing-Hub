import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Building, Menu } from "lucide-react";
import { 
  RiDashboardLine,
  RiMegaphoneLine,
  RiCalendarLine,
  RiTeamLine,
  RiFolderLine,
  RiPieChartLine,
  RiSettings4Line,
  RiMailLine,
  RiMailSettingsLine,
  RiMailAddLine,
  RiChat4Line,
  RiLineChartLine,
  RiPaletteLine,
  RiShareLine
} from "react-icons/ri";

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  
  // Fetch active user
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/users/1'],
  });
  
  // Fetch recent campaigns
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['/api/campaigns'],
  });
  
  const recentCampaigns = campaigns?.slice(0, 3) || [];
  
  const sidebarItems = [
    { name: 'Dashboard', path: '/', icon: <RiDashboardLine className="text-lg mr-3" /> },
    { name: 'Campaigns', path: '/campaigns', icon: <RiMegaphoneLine className="text-lg mr-3" /> },
    { name: 'Calendar', path: '/calendar', icon: <RiCalendarLine className="text-lg mr-3" /> },
    { name: 'Team', path: '/team', icon: <RiTeamLine className="text-lg mr-3" /> },
    { name: 'Assets', path: '/assets', icon: <RiFolderLine className="text-lg mr-3" /> },
    { name: 'Reports', path: '/reports', icon: <RiPieChartLine className="text-lg mr-3" /> },
    { name: 'Marketing Insights', path: '/marketing-insights', icon: <RiLineChartLine className="text-lg mr-3" /> },
    { name: 'Client Feedback', path: '/feedback', icon: <RiChat4Line className="text-lg mr-3" /> },
    { name: 'Branding & Sharing', path: '/branding', icon: <RiPaletteLine className="text-lg mr-3" /> },
    { name: 'Email Templates', path: '/email-templates', icon: <RiMailAddLine className="text-lg mr-3" /> },
    { name: 'Email Test', path: '/email-test', icon: <RiMailLine className="text-lg mr-3" /> },
    { name: 'Email Settings', path: '/email-settings', icon: <RiMailSettingsLine className="text-lg mr-3" /> }
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <div className={cn(
        "hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-full",
        mobileMenuOpen && "absolute inset-y-0 left-0 z-50"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Building className="text-white h-4 w-4" />
            </div>
            <span className="text-lg font-semibold text-secondary">CampaignPro</span>
          </div>
        </div>
        
        {/* User Profile */}
        <div className="p-4 border-b border-gray-200">
          {isLoadingUser ? (
            <div className="flex items-center animate-pulse">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="ml-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mt-1"></div>
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-secondary font-medium">{user.initials}</span>
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="ml-3">
                <p className="font-medium text-sm">Loading user...</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md transition-colors",
                  location === item.path 
                    ? "bg-primary-light/10 text-primary font-medium" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Recent campaigns
            </h3>
            <div className="mt-2 space-y-1">
              {isLoadingCampaigns ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="px-3 py-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  </div>
                ))
              ) : (
                recentCampaigns.map((campaign) => (
                  <Link 
                    key={campaign.id} 
                    href={`/campaigns/${campaign.id}`}
                    className="block px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-100 transition-colors truncate"
                  >
                    {campaign.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </nav>
        
        {/* Settings Link */}
        <div className="p-4 border-t border-gray-200">
          <Link 
            href="/settings" 
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <RiSettings4Line className="mr-3 text-lg" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
      
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-600 bg-opacity-75 z-40"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}
    </>
  );
}
