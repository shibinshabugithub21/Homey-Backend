const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    otp: { type: String, required: true },
    email: { type: String, required: false }, 
    phone: { type: String, required: false }, 
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

const Otp = mongoose.model('Otp', otpSchema);

module.exports = Otp;
