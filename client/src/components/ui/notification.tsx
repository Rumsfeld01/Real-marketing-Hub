import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, XCircle, Info, Bell, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "success" | "error" | "warning" | "info" | "feedback";
  timestamp: Date;
  read: boolean;
  link?: string;
  data?: any;
}

interface NotificationItemProps {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}

export const NotificationItem = ({ notification, onRead, onRemove }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-amber-500" />;
      case "feedback":
        return <Bell className="h-5 w-5 text-blue-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative border p-4 rounded-lg mb-2",
        notification.read ? "bg-gray-50" : "bg-white shadow-sm"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0" onClick={handleClick}>
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "text-sm font-medium mb-1",
              !notification.read && "font-semibold"
            )}>
              {notification.title}
            </h4>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full -mr-1 -mt-1"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(notification.id);
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">
              {new Date(notification.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {!notification.read && (
              <Badge variant="outline" className="bg-blue-50 text-blue-600 text-xs">New</Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface NotificationsListProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationsList = ({ 
  notifications, 
  onRead, 
  onRemove, 
  onClearAll 
}: NotificationsListProps) => {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
        <p>No notifications</p>
      </div>
    );
  }

  return (
    <div className="p-1">
      <div className="flex justify-between items-center mb-3 px-3">
        <h3 className="text-sm font-medium">Notifications</h3>
        {notifications.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={onClearAll}
          >
            Clear all
          </Button>
        )}
      </div>
      <div className="max-h-[60vh] overflow-y-auto px-3">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={onRead}
              onRemove={onRemove}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export const useNotifications = (initialNotifications: Notification[] = []) => {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return {
    notifications,
    setNotifications,
    addNotification,
    markAsRead,
    removeNotification,
    clearAllNotifications,
  };
};

interface NotificationBellProps {
  notifications: Notification[];
  onClick: () => void;
}

export const NotificationBell = ({ notifications, onClick }: NotificationBellProps) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative rounded-full"
      onClick={onClick}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Button>
  );
};

interface NotificationCenterProps {
  notifications: Notification[];
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NotificationCenter = ({
  notifications,
  onRead,
  onRemove,
  onClearAll,
  open,
  onOpenChange,
}: NotificationCenterProps) => {
  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (open && !target.closest('[data-notification-center]')) {
        onOpenChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onOpenChange]);

  return (
    <div className="relative" data-notification-center>
      <NotificationBell 
        notifications={notifications} 
        onClick={() => onOpenChange(!open)} 
      />
      
      {open && (
        <Card className="absolute right-0 mt-2 w-80 z-50 shadow-lg overflow-hidden">
          <NotificationsList
            notifications={notifications}
            onRead={onRead}
            onRemove={onRemove}
            onClearAll={onClearAll}
          />
        </Card>
      )}
    </div>
  );
};