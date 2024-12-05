const Booking = require('../../models/Booking');
const Worker=require('../../models/Worker')

const getBooking = async (req, res) => {
  try {
    const { workerId } = req.params;
    
    if (!workerId) {
      return res.status(400).json({ message: "Worker ID is required." });
    }
    const bookings = await Booking.find({ workerId });
    console.log("booking",bookings);
    

    if (bookings.length === 0) {
      return res.status(404).json({ message: "No bookings found for this worker." });
    }

    res.status(200).json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "An error occurred while fetching bookings." });
  }
};

const updateAmount = async (req, res) => {
  const { bookingId } = req.params;
  const { amount, workerId } = req.body;

  try {
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount." });
    }

    // Find the booking by ID
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure that the worker updating the payment is the one assigned to the booking
    if (booking.workerId.toString() !== workerId) {
      return res.status(403).json({ message: "You are not authorized to update this booking." });
    }

    // Update the serviceFee (payment amount) in the booking
    booking.serviceFee = amount;

    // Save the updated booking
    await booking.save();

    res.status(200).json({ message: "Payment amount updated successfully", booking });
  } catch (error) {
    console.error("Error updating payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateStatus=async (req, res) => {
    console.log("staus update start");
    
    const { taskId, status, workerId } = req.body;
    console.log("status",req.body);
    
  
    try {
      const task = await Booking.findOneAndUpdate(
        { _id: taskId, workerId },
        { status },
        { new: true }
      );
  
      if (!task) {
        return res.status(404).json({ message: "Task not found or unauthorized" });
      }
  
      if (status === "Completed" || status === "Cancelled") {
        const worker = await Worker.findByIdAndUpdate(
          workerId,
          { bookingStatus: "Not Booked" },
          { new: true } 
        );
  
        if (!worker) {
          console.warn("Worker not found while updating booking status");
        } else {
          console.log("Worker's booking status updated to 'Not Booked'");
        }
      }
      res.status(200).json({ message: "Task status updated successfully", task });
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
}
module.exports = { getBooking, updateAmount,updateStatus };
