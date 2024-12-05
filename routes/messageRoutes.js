const express = require('express');
const router = express.Router();
const messageController = require('../controllers/chat/chatController');

// Route to save a new message
router.post('/messages', messageController.saveMessage);

router.get('/messages/:userId/:workerId', messageController.getMessages);

router.put('/messages/:senderId/:receiverId', messageController.markMessagesAsRead);

module.exports = router;
