import { Server } from 'socket.io';

export default function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  let socket; 

  io.on('connection', (connectionSocket) => {
    socket = connectionSocket;

    socket.on('setup', (user) => {
      socket.join(user);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
    });

    socket.on('new message', (newMessage) => {
      io.to(newMessage.conversationId).emit('message received', newMessage);
    });
  });

  return () => {
    if (socket) {
      socket.disconnect();
    }
  };
}
