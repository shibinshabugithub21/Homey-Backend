const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String,require:true}, 
  icon: { type: String, }, 
  offer: {
    type: String,
    trim: true,
    require:true
},
  isBlocked: { type: Boolean, default: false },
  
});

module.exports = mongoose.model('Service', ServiceSchema);
