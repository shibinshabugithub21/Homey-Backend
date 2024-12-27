const socketio = require("socket.io");
const Message = require("../models/Message");

const setupSocket = (server) => {
  const io = socketio(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Join a room based on worker and user IDs
    socket.on("joinRoom", (workerId, userId) => {
      try {
        const room = `${[workerId, userId].sort().join('-')}`; // Consistent room naming
        socket.join(room);
        console.log(`Client joined room: ${room}`);
      } catch (error) {
        console.error("Error in joinRoom:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Send message to a room
    socket.on("sendMessage", async (messageData, ack) => {
      try {
        const { senderId, receiverId, text } = messageData;
        if (!senderId || !receiverId || !text) {
          return ack({ success: false, error: "Invalid message data" });
        }

        // Save message to database
        const message = new Message({ sender: senderId, receiver: receiverId, text });
        await message.save();

        // Emit message to the respective room
        const room = `${[senderId, receiverId].sort().join('-')}`;
        io.to(room).emit("receiveMessage", { sender: senderId, text, timestamp: Date.now() });

        ack({ success: true, timestamp: Date.now() });
      } catch (error) {
        console.error("Error in sendMessage:", error);
        ack({ success: false, error: "Failed to send message" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      socket.leaveAll(); // Clean up rooms on disconnect
    });
  });
};

module.exports = setupSocket;
