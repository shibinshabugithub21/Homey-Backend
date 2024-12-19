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

  const { name, services, service, location, address, phone, description, date, workerId, amount, userId, bookingId, chatId } = req.body;
  const user = userId;
  const chat = chatId;

  const servicesField = services || service;
  console.log("Received booking data:", { name, services: servicesField, location, address, phone, description, date, userId });

  const io = req.app.get("socketio");

  try {
    const selectedDate =date
    console.log("Selected booking date:", selectedDate);

    let existingBooking = await Booking.findById(bookingId);
    let worker = null;

    if (workerId) {
      worker = await Worker.findById(workerId);
    }

    if (existingBooking) {
      // Updating an existing booking
      console.log("Updating existing booking...");

      // Update other fields, but keep the original booking date
      existingBooking.workerId = workerId || existingBooking.workerId;
      existingBooking.amount = amount || existingBooking.amount;

      const updatedBooking = await existingBooking.save();
      console.log("Updated booking saved:", updatedBooking);

      // Add the selected date to the worker's bookingDates array if it doesn't already exist
      if (worker) {
        if (!worker.bookingDates.includes(selectedDate)) {
          worker.bookingDates.push(selectedDate);
        }

        worker.bookingStatus = "Booked";
        await worker.save();

        await sendBookingNotificationEmail(worker.email, updatedBooking);

        io.emit("bookingNotification", {
          workerId: worker._id,
          userId: userId,
          message: `New booking from ${name}`,
          userName: name,
          date: new Date(existingBooking.date).toLocaleDateString(),
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
      // Creating a new booking if no existing booking found
      const newBooking = new Booking({
        name,
        services: servicesField,
        location,
        address,
        phone,
        description,
        date: selectedDate, // Save the selected date as-is
        workerId,
        amount,
        userId,
      });
      console.log("New booking data before save:", newBooking);

      const savedBooking = await newBooking.save();
      console.log("New booking saved:", savedBooking);

      // Add the selected date to the worker's bookingDates array if it doesn't already exist
      if (worker) {
        if (!worker.bookingDates.includes(selectedDate)) {
          worker.bookingDates.push(selectedDate);
        }

        worker.bookingStatus = "Booked";
        await worker.save();

        await sendBookingNotificationEmail(worker.email, savedBooking);

        io.emit("bookingNotification", {
          workerId: worker._id,
          userId: userId,
          message: `New booking from ${name}`,
          userName: name,
          date: new Date(selectedDate).toLocaleDateString(),
          bookingId: savedBooking._id,
          location: location,
          issue: description || "No issue described",
        });
      }

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
  const { location, services, date } = req.query;
  console.log("Request Query:", req.query);

  try {
    
    const availableWorkers = await Worker.find({
      location, 
      "employment.department": services,
      availabilityStatus: "Available", // Only show workers with availability status "Available"
      bookingDates: { $nin: [date] }  // Exclude workers who have the selected date in their bookingDates array
    });

    console.log("Available Workers:", availableWorkers); 

    if (availableWorkers.length === 0) {
      return res.status(404).json({ message: "No workers available for the selected location, service, and date." });
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

    const worker = booking.workerId; 
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

const sendFeedback = async (req, res) => {
  console.log("send feedback start");
  const { bookingId, rating, feedback } = req.body; 
  console.log("result", req.body);

  if (!bookingId || !rating || !feedback) {
    return res.status(400).json({ success: false, message: 'Please provide bookingId, rating, and feedback.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }

  try {
    // Find the booking by bookingId
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Check if feedback has already been given for this booking
    const alreadyReviewed = booking.review.some(review => review.rating === rating && review.feedback === feedback);
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already submitted this feedback.' });
    }

    // Add the feedback to the booking's review array
    booking.review.push({
      rating,
      feedback,
    });

    // Save the booking with the new feedback
    await booking.save();
    console.log("update", booking);

    // Send success response
    res.status(200).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
  console.log("done");
};

const getBookingDetails = async (req, res) => {
  console.log("reveire seen stat");
  try {
    const booking = await Booking.find()
    console.log("booing",booking);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error. Please try again later.' });
  }
};

module.exports = {getBookingDetails, getServices, confirmBooking, getAvailableWorkersByLocation, getUserBookingHistory, getUserById,userToWorkerPaymnet,sendFeedback };
