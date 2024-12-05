const Booking = require("../../models/Booking");
const User = require("../../models/User");
const Worker = require("../../models/Worker");
const Message=require('../../models/Message')

const { sendBookingNotificationEmail } = require("../../services/emailServices");
const Service = require("../../models/Services");

// Fetch services
const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: "Error fetching services", error: error.message });
  }
};

const confirmBooking = async (req, res) => {
  console.log("save booking");

  const { name, services, service, location, address, phone, description, date, workerId, amount, userId,bookingId,chatId } = req.body; 
  const user=userId
  const chat=chatId
  console.log("userid",user);
  
  console.log("rere",req.body);
  
  const servicesField = services || service;
  console.log("Received booking data:", { name, services: servicesField, location, address, phone, description, date, userId });
  console.log("userid2",user);

  const io = req.app.get("socketio");

  try {
    console.log("id",bookingId);
    
    let existingBooking = await Booking.findById(bookingId);
    console.log("Existing booking found:", existingBooking);
  console.log("userid3",user);


    let worker = null;
  console.log("userid4",user);

    if (workerId) {
  console.log("userid5",user);

      worker = await Worker.findById(workerId);
      console.log("Worker found:", worker);
    }
  console.log("userid6",user);

    
    
    if (existingBooking) {
  console.log("userid7",user);
  console.log("userid7",chat);

      console.log("Updating existing booking...");
      existingBooking.workerId = workerId || existingBooking.workerId;
      existingBooking.amount = amount || existingBooking.amount;
      console.log("Services to update:", existingBooking.services);
      
      const updatedBooking = await existingBooking.save();
      console.log("Updated booking saved:", updatedBooking);
      console.log("save the messageto db");
      console.log("workerid",workerId);
      console.log("userid",updatedBooking.userId);
      console.log("chatid",chat);
      
      
      const message = {
        chatId:chat,
        senderId: updatedBooking.userId, 
        receiverId: workerId, 
        bookingId:updatedBooking._id,
        message: `New booking confirmed by ${name}:`,
      };
  
      // Create and save the message in the Message collection
      const newMessage = new Message(message);
      await newMessage.save();
      console.log("Message saved:", newMessage);
            if (worker) {
        worker.bookingStatus = "Booked";
        await worker.save();

        await sendBookingNotificationEmail(worker.email, updatedBooking);

        io.emit("bookingNotification", {
          workerId: worker._id,
          userId:userId,
          message: `New booking from ${name}`,
          userName: name,
          date: new Date(date).toLocaleDateString(),
          bookingId: updatedBooking._id,
          location: location,
          issue: description || "No issue described",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Booking updated successfully",
        booking: updatedBooking,
      });
    } else {
      console.log("Creating new booking...");
      const newBooking = new Booking({
        name,
        services: servicesField,
        location,
        address,
        phone,
        description,
        date,
        workerId,
        amount,
        userId, 
      });
      console.log("New booking data before save:", newBooking);

      const savedBooking = await newBooking.save();
      console.log("New booking saved:", savedBooking);

      return res.status(201).json({
        success: true,
        message: "Booking confirmed and saved successfully",
        booking: savedBooking,
      });
    }
  } catch (error) {
    console.error("Error saving booking:", error);
    return res.status(500).json({
      success: false,
      message: "Error saving booking",
      error: error.message,
    });
  }
};


const getAvailableWorkersByLocation = async (req, res) => {
  const { location, services } = req.query;
  console.log("Request Query:", req.query); 
  try {
    const availableWorkers = await Worker.find({ location, availabilityStatus: "Available",bookingStatus:"Not Booked" });

    console.log("Available Workers:", availableWorkers); 
    if (availableWorkers.length === 0) {
      return res
        .status(404)
        .json({ message: "No workers found for the selected location and service." });
    }

    res.status(200).json(availableWorkers);
  } catch (error) {
    console.error("Error fetching available workers:", error);
    res.status(500).json({ message: "Error fetching available workers", error: error.message });
  }
};

const getUserById = async (req, res) => {
  const { phone } = req.query; 
  if (!phone) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  try {
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserBookingHistory = async (req, res) => {
    console.log("Fetching booking history...");
    
    const { phone } = req.query;  
    if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
    }

    try {
        const bookings = await Booking.find({ phone }).populate('workerId', 'fullname') // Select only the 'fullname' field from the Worker model
        .exec();
           console.log("bookings",bookings);
           

        if (!bookings.length) {
            return res.status(404).json({ message: "No bookings found." });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching booking history:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const userToWorkerPaymnet = async (req, res) => {
  console.log("user side payment start");

  const { bookingId, paymentDetails } = req.body;
  const { paymentId, orderId, signature } = paymentDetails;
  try {
    const booking = await Booking.findById(bookingId).populate('workerId');

    if (!booking || !booking.workerId) {
      return res.status(404).json({ success: false, message: "Booking or worker not found." });
    }

    // Check if payment has already been processed
    if (booking.paymentStatus === 'Paid') {
      return res.status(400).json({ success: false, message: "Payment already processed." });
    }

    const worker = booking.workerId; // workerId is populated
    if (!worker) {
      return res.status(404).json({ success: false, message: "Worker not found." });
    }
    const serviceFee = booking.serviceFee; // Assume serviceFee is a field in booking
    worker.walletbalance += serviceFee;
    worker.wallethistory.push({
      process: "Service Fee Credit",
      amount: serviceFee,
      date: new Date(),
    });

    await worker.save();
    booking.paymentStatus = "Paid";
    await booking.save();
    worker.paymentStatus = "Paid";
    await worker.save();

    res.status(200).json({ success: true, message: "Payment successful, wallet updated, and statuses changed." });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ success: false, message: "Server error while processing payment." });
  }
};


module.exports = { getServices, confirmBooking, getAvailableWorkersByLocation, getUserBookingHistory, getUserById,userToWorkerPaymnet };
