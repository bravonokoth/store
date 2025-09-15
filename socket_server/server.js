const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'https://store-one-olive.vercel.app', 
        methods: ['GET', 'POST'],
    },
});
const axios = require('axios');

app.use(express.json());

// Endpoint for Laravel to trigger events
app.post('/broadcast', async (req, res) => {
    const { event, data, channel } = req.body;
    io.to(channel).emit(event, data);
    res.json({ status: 'Event broadcasted' });
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join user room for notifications
    socket.on('join_user_room', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`Client ${socket.id} joined user room: user_${userId}`);
    });

    // Join admin room for order notifications
    socket.on('join_admin_room', () => {
        socket.join('admin_room');
        console.log(`Client ${socket.id} joined admin room`);
    });

    // Handle order placed event
    socket.on('order_placed', (orderData) => {
        // Broadcast to admin room
        io.to('admin_room').emit('new_order', orderData);
        // Broadcast to user room
        io.to(`user_${orderData.userId}`).emit('notification', {
            message: `Order #${orderData.orderId} placed successfully`,
            order: orderData,
        });
    });

    // Handle order status update
    socket.on('update_order_status', ({ orderId, status, userId }) => {
        // Broadcast to user room
        io.to(`user_${userId}`).emit('order_status_updated', { orderId, status });
        io.to(`user_${userId}`).emit('notification', {
            message: `Order #${orderId} status updated to ${status}`,
        });
        // Broadcast to admin room
        io.to('admin_room').emit('order_status_updated', { orderId, status });
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(8001, () => {
    console.log('Socket.IO server running on http://localhost:8001');
});