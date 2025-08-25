import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'order';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  showDropdown: boolean;
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  showDropdown: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp' | 'read'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
      
      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    
    markAllAsRead: (state) => {
      state.notifications.forEach(notification => {
        notification.read = true;
      });
      state.unreadCount = 0;
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
      }
    },
    
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    
    toggleDropdown: (state) => {
      state.showDropdown = !state.showDropdown;
    },
    
    closeDropdown: (state) => {
      state.showDropdown = false;
    },
    
    // Real-time notification handlers
    handleNewOrder: (state, action: PayloadAction<any>) => {
      const notification: Notification = {
        id: `order_${action.payload.id}_${Date.now()}`,
        type: 'order',
        title: 'New Order Received',
        message: `Order #${action.payload.order_number} has been placed`,
        timestamp: new Date(),
        read: false,
        data: action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
    
    handleOrderStatusUpdate: (state, action: PayloadAction<any>) => {
      const notification: Notification = {
        id: `status_${action.payload.orderId}_${Date.now()}`,
        type: 'info',
        title: 'Order Status Updated',
        message: `Your order #${action.payload.orderNumber} is now ${action.payload.status}`,
        timestamp: new Date(),
        read: false,
        data: action.payload,
      };
      
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },
  },
});

export const {
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
  toggleDropdown,
  closeDropdown,
  handleNewOrder,
  handleOrderStatusUpdate,
} = notificationSlice.actions;

export default notificationSlice.reducer;