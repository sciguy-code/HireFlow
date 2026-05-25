const socketIO = require('socket.io');

let io = null;
const userSockets = new Map(); // Maps userId -> socket.id

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'null' && userId !== 'undefined') {
      userSockets.set(userId, socket.id);
      socket.join(`user:${userId}`);
      console.log(`Socket connection: User ${userId} joined room user:${userId}`);
    }

    socket.on('disconnect', () => {
      if (userId) {
        userSockets.delete(userId);
        console.log(`Socket disconnect: User ${userId}`);
      }
    });
  });

  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  } else {
    console.warn('Socket.io is not initialized yet. Skipping emission.');
  }
};

module.exports = {
  initSocket,
  emitToUser
};
