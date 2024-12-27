const User=require('../../models/User')
const Worker=require('../../models/Worker')
const Location = require('../../models/Location'); 
const Booking = require('../../models/Booking'); 
const Service = require('../../models/Services');

const getUserCount = async (req, res) => {
    console.log("Dashbord get user start");
    try {
      const users = await User.countDocuments();
      console.log("user",users);
      res.status(200).json({users});
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error: error.message });
    }
    console.log("Dashbord get user stop");
  }

const getWorkerCount = async (req, res) => {
    console.log("dashboard worker count start");
    
    try {
        const workerCount = await Worker.countDocuments();
        return res.status(200).json({ worker: workerCount }); 
      } catch (err) {
        return res.status(500).json({ message: "Error fetching worker count", error: err.message });
      }
  };

  const getLocationCount = async (req, res) => {
    try {
      const locationCount = await Location.countDocuments(); 
      res.status(200).json({ locations: locationCount });
    } catch (error) {
      res.status(500).json({ message: "Error fetching locations", error: error.message });
    }
  };

  const getServiceCount = async (req, res) => {
    try {
      const serviceCount = await Service.countDocuments(); 
      res.status(200).json({ services: serviceCount });
    } catch (error) {
      res.status(500).json({ message: "Error fetching services", error: error.message });
    }
  };

  const getBookingCount = async (req, res) => {
    try {
      const bookingCount = await Booking.countDocuments(); 
      res.status(200).json({ bookings: bookingCount });
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
  };


  
  const getRevenue=async (req, res) => {
    try {
      console.log("revent staet");
      
      const revenueData = await Booking.aggregate([
        {
          $group: {
            _id: { $month: "$date" }, // Group by month
            totalRevenue: { $sum: "$amount" }, // Sum up the 'amount' field
          },
        },
        { $sort: { _id: 1 } }, // Sort by month
      ]);
  
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const revenueByMonth = revenueData.map((item) => ({
        month: months[item._id - 1],
        totalRevenue: item.totalRevenue,
      }));
  
      res.json(revenueByMonth);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching revenue data');
    }
  };


const servicesStaus = async (req, res) => {
  try {
    const statusData = await Booking.aggregate([
      {
        $group: {
          _id: "$status", 
          count: { $sum: 1 }
        }
      }
    ]);

    const data = {
      Completed: 0,
      Cancelled: 0,
      Pending: 0,
      'In-Progress': 0
    };

    statusData.forEach(item => data[item._id] = item.count);
    console.log("data",data);
    
    res.json(data);
    
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching service status data');
  }
};
  
const mostUsedServices = async (req, res) => {
  try {
    // Aggregate bookings by serviceId and get counts
    const serviceBookings = await Booking.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "services",  // Match with your booking schema field
          foreignField: "name",    // Match with your service schema field
          as: "serviceDetails"
        }
      },
      {
        $unwind: "$serviceDetails"
      },
      {
        $group: {
          _id: "$serviceDetails._id",
          name: { $first: "$serviceDetails.name" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format the response
    const data = serviceBookings.map(service => ({
      name: service.name,
      count: service.count
    }));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching most booked services:", error);
    res.status(500).json({ error: "Error fetching most booked services" });
  }
};


module.exports={getUserCount,getWorkerCount,getLocationCount,mostUsedServices,getServiceCount,getBookingCount,getRevenue,servicesStaus}  