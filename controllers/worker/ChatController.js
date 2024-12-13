const mongoose = require("mongoose");
const Message = require("../../models/Message"); // Ensure you have the Message model
const User = require("../../models/User"); // Ensure you have the User model
const Chat = require("../../models/Chat");
const getUsersForWorker = async (req, res) => {
  const { workerId } = req.params; // workerId is passed as a parameter
  console.log("Worker ID:", workerId);

  try {
    // Aggregate messages where the worker is the receiver and the user is the sender
    const chatUsers = await Message.aggregate([
      {
        $group: {
          _id: "$senderId", // Group by senderId (i.e., the user)
          lastMessage: { $last: "$message" }, // Get the last message
          lastMessageAt: { $last: "$timestamp" }, // Get the timestamp of the last message
          chatId: { $last: "$chatId" }, // Get the timestamp of the last message
        },
      },
      {
        $lookup: {
          from: "users", // Join with the User collection
          localField: "_id",
          foreignField: "_id",
          as: "userDetails", // Output the user details
        },
      },
      {
        $unwind: "$userDetails", // Unwind the user details
      },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.fullname",
          email: "$userDetails.email",
          lastMessage: 1,
          lastMessageAt: 1, // Send the timestamp of the last message
        },
      },
      {
        $sort: { lastMessageAt: -1 }, // Sort by the most recent message
      },
    ]);

    console.log("Users who have booked the worker:", chatUsers);

    // Send the response with the list of users
    return res.status(200).json({ success: true, users: chatUsers });
  } catch (error) {
    console.error("Error fetching users for worker:", error);
    return res.status(500).json({ success: false, message: "Error fetching users for worker", error: error.message });
  }
};

const getMessages = async (req, res) => {
  const { workerId, userId } = req.params;
console.log("userffffffffffffffff",userId,workerId);

  try {
    // Find all messages between the worker and user
    const forChatId = await Message.find({
      $or: [
        { senderId: workerId, receiverId: userId },
        { senderId: userId, receiverId: workerId },
      ],
    }).sort({ timestamp: 1 });

    
const messages = await Message.find({chatId:forChatId[0].chatId})
console.log('messagesmessages',messages);

    // Check for the associated chatId
    let chatId =
      messages.length > 0
        ? messages[0].chatId // Use chatId from messages if available
        : null;

    if (!chatId) {
      // Query the Chat collection if no chatId is found in messages
      const chat = await Chat.findOne({
        participants: { $all: [workerId, userId] },
      });

      if (chat) {
        chatId = chat._id;
      }
    }
console.log('getMessages',messages);

    return res.status(200).json({ success: true, messages, chatId });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ success: false, message: "Error fetching messages" });
  }
};

const createChat = async (req, res) => {
  console.log("ctarete room start");

  const { userId, workerId } = req.body;
  // console.log("sender", Id);

  console.log("res", req.body);

  try {
    let chat = await Chat.findOne({
      Members: { $all: [userId, workerId] },
    });

    if (!chat) {
      chat = new Chat({
        Members: [userId, workerId],
      });
      await chat.save();
      return res.status(201).json({ success: true, chat, message: "Chat created successfully." });
    }

    // If chat exists, return it
    return res.status(200).json({ success: true, chat, message: "Chat already exists." });
  } catch (error) {
    console.error("Error creating or fetching chat:", error);
    return res.status(500).json({ success: false, message: "Error creating or fetching chat." });
  }
};
const createMessage = async (req, res) => {
  console.log("Incoming request to create message:", req.body);

  const { senderId, chatId, message } = req.body;
  console.log("req", req.body);

  if (!senderId || !chatId || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields." });
  }

  try {
    const chatExists = await Chat.findById(chatId);
    if (!chatExists) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }
    const newMessage = new Message({
      senderId,
      chatId,
      message,
      timestamp: Date.now(),
    });
    await newMessage.save();

    console.log("Message saved successfully:", newMessage);

    return res.status(200).json({ success: true, message: "Message sent successfully", data: newMessage });
  } catch (error) {
    console.error("Error saving message:", error);
    return res.status(500).json({ success: false, message: "Error sending message." });
  }
};

module.exports = { getUsersForWorker, getMessages, createChat, createMessage };
