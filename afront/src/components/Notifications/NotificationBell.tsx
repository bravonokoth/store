import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import {
  toggleDropdown,
  closeDropdown,
  markAsRead,
  markAllAsRead,
  removeNotification,
  handleNewOrder,
  handleOrderStatusUpdate,
} from '../../store/notificationSlice';
import { Bell, X, Clock, Package, CheckCircle, AlertCircle, Info } from 'lucide-react';
import socketService from '../../services/socket';

const NotificationBell: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications, unreadCount, showDropdown } = useSelector((state: RootState) => state.notifications);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Setup socket listeners
  useEffect(() => {
    if (user) {
      const socket = socketService.connect();
      
      // Join appropriate rooms based on user role
      if (user.role === 'admin' || user.role === 'super_admin') {
        socketService.joinAdminRoom();
        
        // Listen for new orders
        socketService.onNewOrder((orderData) => {
          dispatch(handleNewOrder(orderData));
        });
      } else {
        socketService.joinUserRoom(user.id);
      }
      
      // Listen for order status updates
      socketService.onOrderStatusUpdate((data) => {
        dispatch(handleOrderStatusUpdate(data));
      });
      
      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [user, dispatch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        dispatch(closeDropdown());
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown, dispatch]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon */}
      <button
        onClick={() => dispatch(toggleDropdown())}
        className="relative p-2 text-gray-300 hover:text-white transition-colors group"
      >
        <Bell className={`h-6 w-6 transition-all duration-300 ${showDropdown ? 'scale-110 text-purple-400' : 'group-hover:scale-110'}`} />
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
            <h3 className="font-semibold text-white">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Mark all read
                </button>
              )}
              <span className="text-xs text-gray-400">
                {unreadCount} unread
              </span>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-400">No notifications yet</p>
                <p className="text-sm text-gray-500 mt-1">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-800 transition-colors cursor-pointer ${
                      !notification.read ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-white' : 'text-gray-300'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Clock className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-500">
                                {formatTime(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(removeNotification(notification.id));
                            }}
                            className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t border-gray-700 p-3">
              <button
                onClick={() => {
                  // Navigate to full notifications page if implemented
                  dispatch(closeDropdown());
                }}
                className="w-full text-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;