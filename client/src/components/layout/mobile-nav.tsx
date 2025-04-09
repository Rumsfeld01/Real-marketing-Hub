import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  RiDashboardLine, 
  RiMegaphoneLine, 
  RiCalendarLine, 
  RiTeamLine,
  RiAddLine
} from "react-icons/ri";

export default function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <RiDashboardLine className="text-xl" /> },
    { name: 'Campaigns', path: '/campaigns', icon: <RiMegaphoneLine className="text-xl" /> },
    { name: 'Calendar', path: '/calendar', icon: <RiCalendarLine className="text-xl" /> },
    { name: 'Team', path: '/team', icon: <RiTeamLine className="text-xl" /> },
  ];

  return (
    <>
      {/* Floating Create Button (Mobile Only) */}
      <div className="md:hidden fixed right-4 bottom-20">
        <Link href="/campaigns/new">
          <button className="w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center">
            <RiAddLine className="text-xl" />
          </button>
        </Link>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-around h-16">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={cn(
              "flex flex-col items-center justify-center h-full px-4",
              location === item.path ? "text-primary" : "text-gray-500"
            )}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
