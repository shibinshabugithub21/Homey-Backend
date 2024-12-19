const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  services: { type: String, required: true },
  location: { type: String, required: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number },
  serviceFee: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ["Pending", "In-Progress", "Completed", "Cancelled"], 
    default: "Pending" 
  },
  paymentStatus: { 
    type: String, 
    enum: ["Unpaid", "Paid"], 
    default: "Unpaid" 
  },  
  review: [
    {
      rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5, 
      },
      feedback: { type: String, required: true },
    },
  ],
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",require:true},
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Worker' } 
});

module.exports = mongoose.model('Booking', BookingSchema);
