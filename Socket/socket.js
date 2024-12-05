// const socketio = require("socket.io");
// const Message = require("../models/Message");  // Message model

// const setupSocket = (server) => {
//   const io = socketio(server, { cors: { origin: "*" } });

//   io.on("connect", (socket) => {
//     const { userId } = socket.handshake.auth;

//     socket.on("joinRoom", ({ userId, workerId }) => {
//       const room = `${userId}-${workerId}`;
//       socket.join(room);
//     });

//     socket.on("sendMessage", async (messageData) => {
//       const { senderId, receiverId, text } = messageData;
//       const newMessage = new Message({
//         senderId,
//         receiverId,
//         message: text,
//         read: false, 
//       });
//       await newMessage.save();
//       io.to(`${senderId}-${receiverId}`).emit("receiveMessage", newMessage);
//       io.to(`${receiverId}-${senderId}`).emit("receiveMessage", newMessage);
//     });
//   });
// };

// module.exports = setupSocket;
// Backend (server-side) socket.js

const socketio = require("socket.io");
const Message = require("../models/Message");

const setupSocket = (server) => {
  const io = socketio(server, { 
    cors: { 
      origin: "*", 
      methods: ["GET", "POST"]
    } 
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a room based on worker and user IDs
    socket.on("joinRoom", (workerId, userId) => {
      const room = `${workerId}-${userId}`;
      socket.join(room);
      console.log(`Joined room: ${room}`);
    });

    // Send message to a room
    socket.on("sendMessage", async (messageData, ack) => {
      const { senderId, receiverId, text } = messageData;

      if (!senderId || !receiverId || !text) return ack({ success: false, error: "Invalid message data" });

      // Save message to database
      const message = new Message({ sender: senderId, receiver: receiverId, text });
      await message.save();

      // Emit message to the respective room
      const room = `${senderId}-${receiverId}`;
      io.to(room).emit("receiveMessage", { sender: "worker", text, timestamp: Date.now() });

      ack({ success: true, timestamp: Date.now() });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

module.exports = setupSocket;

