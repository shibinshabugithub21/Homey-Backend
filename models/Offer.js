const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },  
}, { timestamps: true });

module.exports = mongoose.model('Offer', OfferSchema);
