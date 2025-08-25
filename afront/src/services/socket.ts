import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private url: string = 'http://localhost:8001';

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(this.url, {
        transports: ['websocket'],
        autoConnect: false,
      });

      this.socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
      });

      this.socket.on('error', (error) => {
        console.error('Socket.IO error:', error);
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join user to their personal room for notifications
  joinUserRoom(userId: string): void {
    if (this.socket) {
      this.socket.emit('join_user_room', userId);
    }
  }

  // Join admin room for order notifications
  joinAdminRoom(): void {
    if (this.socket) {
      this.socket.emit('join_admin_room');
    }
  }

  // Listen for new order notifications (admin)
  onNewOrder(callback: (order: any) => void): void {
    if (this.socket) {
      this.socket.on('new_order', callback);
    }
  }

  // Listen for order status updates (user)
  onOrderStatusUpdate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('order_status_updated', callback);
    }
  }

  // Listen for general notifications
  onNotification(callback: (notification: any) => void): void {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  // Emit order placed event
  orderPlaced(orderData: any): void {
    if (this.socket) {
      this.socket.emit('order_placed', orderData);
    }
  }

  // Emit order status update
  updateOrderStatus(orderId: string, status: string): void {
    if (this.socket) {
      this.socket.emit('update_order_status', { orderId, status });
    }
  }

  // Remove all event listeners
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export default new SocketService();