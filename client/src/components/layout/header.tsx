import { Search } from "lucide-react";
import { 
  RiNotification3Line, 
  RiQuestionLine, 
  RiMenuLine
} from "react-icons/ri";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface HeaderProps {
  toggleMobileMenu: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export default function Header({ 
  toggleMobileMenu, 
  notificationCount = 0, 
  onNotificationClick 
}: HeaderProps) {
  const { data: user } = useQuery({
    queryKey: ['/api/users/1'],
  });

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Mobile menu button */}
        <button 
          className="md:hidden text-gray-500 focus:outline-none"
          onClick={toggleMobileMenu}
        >
          <RiMenuLine className="text-xl" />
        </button>
        
        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md ml-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" 
              placeholder="Search campaigns, tasks or assets..." 
            />
          </div>
        </div>
        
        {/* Right menu items */}
        <div className="flex items-center space-x-4">
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none relative"
            onClick={onNotificationClick}
            aria-label={`${notificationCount} unread notifications`}
          >
            <RiNotification3Line className={cn(
              "text-xl",
              notificationCount > 0 && "text-primary animate-pulse"
            )} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center">
                <span className="absolute w-4 h-4 rounded-full bg-error animate-ping opacity-75"></span>
                <span className="relative w-3.5 h-3.5 rounded-full bg-error flex items-center justify-center text-[10px] font-bold text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              </span>
            )}
          </button>
          <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <RiQuestionLine className="text-xl" />
          </button>
          {user && (
            <div className="md:hidden">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-secondary font-medium">{user.initials}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
