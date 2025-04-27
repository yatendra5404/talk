import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.FRONTEND_URL 
      : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static frontend files

// Variables
const messages = [];
let connectedUsers = 0;

// Socket.IO events
io.on('connection', (socket) => {
  console.log('A user connected');
  connectedUsers++;
  io.emit('userCount', connectedUsers);
  socket.emit('loadMessages', messages);

  socket.on('chatMessage', (message) => {
    messages.push(message);
    if (messages.length > 100) {
      messages.shift();
    }
    io.emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    connectedUsers--;
    io.emit('userCount', connectedUsers);
  });
});

// Server listen
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export app for Vercel
export default app;
