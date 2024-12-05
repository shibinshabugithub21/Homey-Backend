const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId,  ref: 'User'}, 
  receiverId: { type: mongoose.Schema.Types.ObjectId,  ref: 'Worker'}, 
  bookingId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking'}, 
   chatId: { type: mongoose.Schema.Types.ObjectId,ref: 'Chat' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);
