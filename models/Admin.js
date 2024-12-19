const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  premiumAmount: { type: String, default: '0' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },  // Link to User schema
  premiumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Premium', required: false },  // Link to Premium schema
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
