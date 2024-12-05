const Booking = require('../../models/Booking');

const getAllBookings = async (req, res) => {
  try {
    console.log("fdsfdsaff");
    
    // const bookings = await Booking.find()
    const bookings = await Booking.find().populate('workerId', 'fullname') 
    .exec();
       console.log("gdf",bookings);
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching bookings', error });
  }
};

module.exports={getAllBookings}
