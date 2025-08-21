const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const http = require('http');
const { initDatabase, getPool } = require('./config/database');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.set('io', io);

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/users', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Real-time seat tracking
const activeSeatLocks = new Map();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('lock_seats', async (data) => {
    const { eventId, quantity } = data;
    const lockId = `${eventId}_${socket.id}`;
    
    // Lock seats for 10 minutes
    activeSeatLocks.set(lockId, {
      eventId,
      quantity,
      timestamp: Date.now(),
      socketId: socket.id
    });

    setTimeout(() => {
      activeSeatLocks.delete(lockId);
      socket.emit('seats_unlocked', { eventId });
    }, 10 * 60 * 1000); // 10 minutes

    socket.emit('seats_locked', { eventId, lockId });
    socket.broadcast.emit('seat_availability_changed', { eventId });
  });

  socket.on('release_seats', (data) => {
    const { lockId } = data;
    activeSeatLocks.delete(lockId);
    socket.emit('seats_released');
  });

  socket.on('disconnect', () => {
    // Release all locks for this socket
    for (const [lockId, lock] of activeSeatLocks.entries()) {
      if (lock.socketId === socket.id) {
        activeSeatLocks.delete(lockId);
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make seat locks available globally
global.activeSeatLocks = activeSeatLocks;

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
initDatabase().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
