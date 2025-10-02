import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Bell, 
  X, 
 
  Calendar, 
  Star, 
  MapPin, 

  Info,
  CheckCircle,
  Clock,

} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/useToast';

interface Notification {
  _id: string;
  userId: string;
  type: 'booking_confirmed' | 'booking_reminder' | 'review_reminder' | 'temple_update' | 'system_announcement';
  title: string;
  message: string;
  data?: {
    templeId?: string;
    templeName?: string;
    bookingId?: string;
    date?: string;
    time?: string;
  };
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt?: string;
}

interface NotificationSystemProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationSystem({ onNotificationClick }: NotificationSystemProps) {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock notifications for development
  const mockNotifications: Notification[] = [
    {
      _id: '1',
      userId: user?.id || '',
      type: 'booking_confirmed',
      title: 'Booking Confirmed',
      message: 'Your darshan booking for Golden Temple has been confirmed for tomorrow at 6:00 AM.',
      data: {
        templeId: '1',
        templeName: 'Golden Temple',
        bookingId: 'book_123',
        date: '2024-10-02',
        time: '06:00'
      },
      isRead: false,
      priority: 'high',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
    },
    {
      _id: '2',
      userId: user?.id || '',
      type: 'review_reminder',
      title: 'Share Your Experience',
      message: 'How was your visit to Meenakshi Temple? Share your experience to help other devotees.',
      data: {
        templeId: '2',
        templeName: 'Meenakshi Temple'
      },
      isRead: false,
      priority: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
    },
    {
      _id: '3',
      userId: user?.id || '',
      type: 'temple_update',
      title: 'Special Puja Schedule',
      message: 'Tirupati Temple has announced special Brahmotsavam celebrations. Book your slots now!',
      data: {
        templeId: '3',
        templeName: 'Tirupati Temple'
      },
      isRead: true,
      priority: 'medium',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
    },
    {
      _id: '4',
      userId: user?.id || '',
      type: 'system_announcement',
      title: 'New Feature: Virtual Darshan',
      message: 'Experience divine blessings from home with our new virtual darshan feature.',
      isRead: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    }
  ];

  // Load notifications
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notifications`);
      // const data = await response.json();
      // setNotifications(data.notifications || []);
      
      // Using mock data for now
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}/read`, {
      //   method: 'PATCH'
      // });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // In a real app, this would be an API call
      // await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
      //   method: 'PATCH'
      // });
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      
      toast.success({
        title: 'All notifications marked as read',
        description: 'You\'re all caught up!',
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error({
        title: 'Failed to update notifications',
        description: 'Please try again later.',
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real app, this would be an API call
      // await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`, {
      //   method: 'DELETE'
      // });
      
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      
      toast.success({
        title: 'Notification deleted',
        description: 'The notification has been removed.',
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error({
        title: 'Failed to delete notification',
        description: 'Please try again later.',
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification);
    }
    
    // Default behavior based on notification type
    switch (notification.type) {
      case 'booking_confirmed':
      case 'booking_reminder':
        // Navigate to bookings page
        window.location.href = '/profile?tab=bookings';
        break;
      case 'review_reminder':
        // Navigate to temple page for review
        if (notification.data?.templeId) {
          window.location.href = `/temples/${notification.data.templeId}?write-review=true`;
        }
        break;
      case 'temple_update':
        // Navigate to temple page
        if (notification.data?.templeId) {
          window.location.href = `/temples/${notification.data.templeId}`;
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'booking_reminder':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'review_reminder':
        return <Star className="h-5 w-5 text-yellow-600" />;
      case 'temple_update':
        return <MapPin className="h-5 w-5 text-purple-600" />;
      case 'system_announcement':
        return <Info className="h-5 w-5 text-gray-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationBgColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'high') return 'bg-red-50 border-red-200';
    if (priority === 'medium') return 'bg-yellow-50 border-yellow-200';
    
    switch (type) {
      case 'booking_confirmed':
        return 'bg-green-50 border-green-200';
      case 'booking_reminder':
        return 'bg-blue-50 border-blue-200';
      case 'review_reminder':
        return 'bg-yellow-50 border-yellow-200';
      case 'temple_update':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        className="relative p-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-full mt-2 w-96 max-h-96 overflow-hidden z-50 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                You have {unreadCount} unread notification{unreadCount > 1 ? 's' : ''}
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="text-sm text-text/70 mt-2">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-text/70">No notifications yet</p>
                <p className="text-xs text-text/50 mt-1">We'll notify you about important updates</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 cursor-pointer hover:bg-white/50 transition-colors border-l-4 ${
                      !notification.isRead ? 'bg-primary/5' : ''
                    } ${getNotificationBgColor(notification.type, notification.priority)}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-text' : 'text-text/80'}`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 ml-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification._id);
                              }}
                            >
                              <X className="h-3 w-3 text-text/40 hover:text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className={`text-sm mt-1 ${!notification.isRead ? 'text-text/80' : 'text-text/60'}`}>
                          {notification.message}
                        </p>
                        
                        {notification.data && (notification.data.date || notification.data.time) && (
                          <div className="flex items-center gap-2 mt-2 text-xs text-text/60">
                            <Clock className="h-3 w-3" />
                            {notification.data.date && (
                              <span>{new Date(notification.data.date).toLocaleDateString()}</span>
                            )}
                            {notification.data.time && (
                              <span>{notification.data.time}</span>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-text/50">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          
                          {notification.priority === 'high' && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              High Priority
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          
          {notifications.length > 0 && (
            <div className="p-3 border-t bg-gray-50/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/notifications';
                }}
              >
                View All Notifications
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Enhanced toast notification functions for different scenarios
export const showBookingConfirmation = (templeName: string, date: string, time: string) => {
  toast.success({
    title: 'Booking Confirmed! 🙏',
    description: `Your darshan at ${templeName} is confirmed for ${date} at ${time}`,
  });
};

export const showBookingReminder = (templeName: string, timeUntil: string) => {
  toast.info({
    title: 'Upcoming Darshan ⏰',
    description: `Your darshan at ${templeName} is in ${timeUntil}`,
  });
};

export const showReviewReminder = (templeName: string) => {
  toast.info({
    title: 'Share Your Experience ⭐',
    description: `How was your visit to ${templeName}? Help others with your review!`,
  });
};

export const showTempleUpdate = (templeName: string, update: string) => {
  toast.info({
    title: `Update from ${templeName} 📢`,
    description: update,
  });
};

export const showSystemAnnouncement = (title: string, message: string) => {
  toast.info({
    title: title,
    description: message,
  });
};

// Hook for managing notification preferences
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    bookingConfirmations: true,
    bookingReminders: true,
    reviewReminders: true,
    templeUpdates: true,
    systemAnnouncements: false,
    emailNotifications: true,
    smsNotifications: false,
  });

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    
    // In a real app, this would save to the backend
    toast.success({
      title: 'Preferences updated',
      description: 'Your notification preferences have been saved.',
    });
  };

  return { preferences, updatePreference };
};