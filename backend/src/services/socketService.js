import { Server } from 'socket.io';

let io = null;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket Connected]: ${socket.id}`);

    // Join room for specific user (e.g. for student notifications)
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
        console.log(`👤 Socket ${socket.id} joined room user:${userId}`);
      }
    });

    // Join room for specific role (e.g. 'REVIEWER', 'ADMIN', 'STAFF')
    socket.on('join:role', (role) => {
      if (role) {
        socket.join(`role:${role}`);
        console.log(`🛡️ Socket ${socket.id} joined room role:${role}`);
      }
    });

    // Join room for specific department (e.g. IT, ELECTRICAL)
    socket.on('join:department', (departmentId) => {
      if (departmentId) {
        socket.join(`dept:${departmentId}`);
        console.log(`🏢 Socket ${socket.id} joined room dept:${departmentId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 [Socket Disconnected]: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

/**
 * Emits real-time event to specific room or all clients
 */
export function emitSocketEvent({ room, event, data }) {
  if (!io) return;

  if (room) {
    io.to(room).emit(event, data);
  } else {
    io.emit(event, data);
  }
}
