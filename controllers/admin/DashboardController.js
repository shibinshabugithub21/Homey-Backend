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
      const bookingCount = await Booking.countDocuments(); // Count of all bookings
      res.status(200).json({ bookings: bookingCount });
    } catch (error) {
      res.status(500).json({ message: "Error fetching bookings", error: error.message });
    }
  };

  const getMostUsedServices = async (req, res) => {
    console.log("erewre");
    
    try {
      console.log("Fetching most used services");
  
      // Get all bookings
      const bookings = await Booking.find().populate('services');
      if (!bookings || bookings.length === 0) {
        return res.status(400).json({ message: 'No bookings found' });
      }
  
      // Create an empty object to hold the count of bookings for each service
      const serviceBookingCount = {};
  
      // Loop through the bookings to count bookings for each service
      bookings.forEach(booking => {
        if (booking.services && booking.services.name) {
          const serviceName = booking.services.name;
          if (serviceBookingCount[serviceName]) {
            serviceBookingCount[serviceName] += 1;
          } else {
            serviceBookingCount[serviceName] = 1;
          }
        }
      });
  
      // Convert the counts into an array and sort them
      const serviceCounts = Object.entries(serviceBookingCount)
        .map(([serviceName, count]) => ({ serviceName, count }))
        .sort((a, b) => b.count - a.count);
  
      // Return the top 5 most booked services
      const topServices = serviceCounts.slice(0, 5);
  console.log("res",topServices);
  
      return res.status(200).json({ services: topServices });
  
    } catch (error) {
      console.error("Error fetching most booked services:", error);
      res.status(500).json({ message: "Error fetching most booked services", error: error.message });
    }
  };
  
  

module.exports={getUserCount,getWorkerCount,getLocationCount,getServiceCount,getBookingCount,getMostUsedServices}  