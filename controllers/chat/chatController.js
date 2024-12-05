const Message = require('../models/Message');  // Import your message model
const saveMessage = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
      read: false, 
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMessages = async (req, res) => {
  try {
    const { userId, workerId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: workerId },
        { senderId: workerId, receiverId: userId },
      ],
    }).sort({ timestamp: 1 });  // Sort messages by timestamp

    // Respond with the messages
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Function to mark messages as read
const markMessagesAsRead = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    // Update all messages between the sender and receiver as read
    const updatedMessages = await Message.updateMany(
      { senderId, receiverId, read: false },
      { read: true }
    );

    res.status(200).json(updatedMessages);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { saveMessage, getMessages, markMessagesAsRead };
