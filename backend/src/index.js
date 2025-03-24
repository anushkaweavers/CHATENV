// Set higher limit for event listeners
require('events').EventEmitter.defaultMaxListeners = 15;

const mongoose = require('mongoose');
const http = require('http');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('./models/user.model');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with enhanced configuration
const io = new Server(server, {
  cors: {
    origin: config.cors.origin || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

// Track connected users
const onlineUsers = new Map();

// MongoDB Connection
mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to MongoDB');
    server.listen(config.port, () => {
      logger.info(`Listening on port ${config.port}`);
    });
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      throw new Error('Authentication token missing');
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    const user = await User.findById(decoded.sub);

    if (!user) {
      throw new Error('User not found');
    }

    socket.user = user;
    next();
  } catch (error) {
    logger.error('Socket authentication error:', error.message);
    next(new Error('Authentication failed'));
  }
});

// Socket.io Event Handling
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.user._id} (${socket.id})`);

  // Add user to online users map
  onlineUsers.set(socket.user._id.toString(), socket.id);

  // Notify others about user's online status
  socket.broadcast.emit('user-status-changed', {
    userId: socket.user._id,
    isOnline: true
  });

  // Join user to their personal room for notifications
  socket.join(`user_${socket.user._id}`);

  // Handle joining chat rooms
  socket.on('join-chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    logger.info(`User ${socket.user._id} joined chat ${chatId}`);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.user._id} (${socket.id})`);
    
    // Remove from online users
    onlineUsers.delete(socket.user._id.toString());
    
    // Notify others about user's offline status
    socket.broadcast.emit('user-status-changed', {
      userId: socket.user._id,
      isOnline: false
    });
  });
});

// Graceful Shutdown Handling
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

module.exports = { io };