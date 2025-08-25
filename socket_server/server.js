const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:5173', // Allow ReactJS frontend
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

    // Join a channel
    socket.on('join-channel', (channel) => {
        socket.join(channel);
        console.log(`Client ${socket.id} joined channel: ${channel}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(8001, () => {
    console.log('Socket.IO server running on http://localhost:8001');
});