import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import NotFound from "@/pages/not-found";

// Import pages
import Dashboard from "@/pages/dashboard";
import Campaigns from "@/pages/campaigns";
import NewCampaign from "@/pages/campaigns/new";
import CampaignDetails from "@/pages/campaigns/[id]";
import Calendar from "@/pages/calendar";
import Team from "@/pages/team";
import Assets from "@/pages/assets";
import Reports from "@/pages/reports";
import ReportsInteractive from "@/pages/reports-interactive";
import EmailTest from "@/pages/email-test";
import EmailSettings from "@/pages/email-settings";
import EmailTemplates from "@/pages/email-templates";
import FeedbackDashboard from "@/pages/feedback";
import MarketingInsights from "@/pages/marketing-insights";
import Branding from "@/pages/branding";
import SharedInsight from "@/pages/insights/shared/[code]";

// Import layout components
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import { useState, useCallback } from "react";

// Import WebSocket provider and notification context
import { WebSocketProvider } from "@/context/websocket-context";
import { 
  Notification, 
  NotificationCenter, 
  useNotifications 
} from "@/components/ui/notification";

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  
  // Initialize notification system
  const { 
    notifications,
    addNotification, 
    markAsRead, 
    removeNotification,
    clearAllNotifications
  } = useNotifications();
  
  // Callback for handling new notifications
  const handleNewNotification = useCallback((notification: Notification) => {
    // Add notification to our collection
    addNotification(notification);
    
    // Also show a toast for immediate visibility
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === 'error' ? 'destructive' : 'default',
    });
    
    // Play sound for critical notifications
    if (notification.type === 'error' || notification.type === 'feedback') {
      // Instead of relying on an audio file, we'll use the Web Audio API to generate a simple notification sound
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContext();
        
        // Create an oscillator for the beep sound
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Configure the sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(830, audioCtx.currentTime); // Frequency in Hz
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume
        
        // Connect nodes and start sound
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        // Play a short beep
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1); // Duration in seconds
      } catch (err) {
        console.warn('Could not play notification sound:', err);
      }
    }
  }, [addNotification, toast]);
  
  return (
    <WebSocketProvider onNewNotification={handleNewNotification}>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar (desktop) */}
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header 
            toggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
            notificationCount={notifications.filter(n => !n.read).length}
            onNotificationClick={() => setNotificationCenterOpen(true)}
          />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/campaigns" component={Campaigns} />
              <Route path="/campaigns/new" component={NewCampaign} />
              <Route path="/campaigns/:id" component={CampaignDetails} />
              <Route path="/calendar" component={Calendar} />
              <Route path="/team" component={Team} />
              <Route path="/assets" component={Assets} />
              <Route path="/reports" component={Reports} />
              <Route path="/reports-interactive" component={ReportsInteractive} />
              <Route path="/email-test" component={EmailTest} />
              <Route path="/email-settings" component={EmailSettings} />
              <Route path="/email-templates" component={EmailTemplates} />
              <Route path="/feedback" component={FeedbackDashboard} />
              <Route path="/marketing-insights" component={MarketingInsights} />
              <Route path="/branding" component={Branding} />
              {/* Public shared insight route - this one doesn't use the main layout */}
              <Route path="/insights/shared/:code" component={SharedInsight} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
        
        {/* Mobile navigation */}
        <MobileNav />
      </div>
      
      {/* Notification Center */}
      <NotificationCenter
        notifications={notifications}
        onRead={markAsRead}
        onRemove={removeNotification}
        onClearAll={clearAllNotifications}
        open={notificationCenterOpen}
        onOpenChange={setNotificationCenterOpen}
      />
      
      <Toaster />
    </WebSocketProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
