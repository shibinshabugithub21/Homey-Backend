const mongoose = require("mongoose");

const workerSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    address: { type: String, required: true },
    location: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    education: {
      highestLevel: { type: String, required: true },
      institution: { type: String, required: true },
      fieldOfStudy: { type: String, required: true },
      yearOfPassing: { type: String, required: true },
    },
    employment: {
      dateOfHire: { type: Date, required: true },
      jobStatus: { type: String, required: true, default: "Pending" },
      department: { type: String, required: false },
    },
    isBlocked: { type: Boolean, default: false },
    dateOfJoin: { type: Date, default: Date.now },
    
    availabilityStatus: {
      type: String,
      enum: ["Available", "Busy", "Do Not Disturb"],
      default: "Available",
    },
    walletbalance: {
      type: Number,
      default: 0,
    },
    wallethistory: [
      {
        process: { type: String },
        amount: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['Unpaid', 'Paid'],
      default: 'Unpaid'
    },
    bookingStatus: {
      type: String,
      enum: ["Booked", "Not Booked"],
      default: "Not Booked",
    },
    role: { type: String, enum: ["user", "worker"], default: "worker" },
    leaves: [
      {
        leaveType: {
          type: String,
          enum: ["Full Day", "Half Day"],
          required: true,
        },
        leaveDate: { type: Date, required: true },
        reason: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Worker = mongoose.model("Worker", workerSchema);
module.exports = Worker;
