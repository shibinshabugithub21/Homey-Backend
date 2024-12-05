const Service = require('../../models/Services');

// Create a new service
const createService = async (req, res) => {
  
  console.log("the services controller start form heree");
  
  const { name, category } = req.body;
  console.log("boddy",req.body);
  

  console.log("img",req.url);
  if (!name || !category ) {
    return res.status(400).json({
      success: false,
      message: "All fields (name, category) are required.",
    });
  }

  try {
    const existingService = await Service.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existingService) {
      return res.status(400).json({
        success: false,
        message: "Service already exists.",
      });
    }

const iconUrl =  req.url;


    const newService = new Service({ name, category, icon: iconUrl }); // Use location from S3
    const savedService = await newService.save();

    res.status(201).json({
      success: true,
      data: savedService,
    });
  } catch (error) {
    console.error("Error saving service:", error);
    res.status(500).json({
      success: false,
      message: "Error saving service.",
    });
  }
};

// Get all services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
};

// Update service
const updateService = async (req, res) => {
  const { id } = req.params;
  const { name, category } = req.body;

  try {
    const existingService = await Service.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, _id: { $ne: id } });
    if (existingService) {
      return res.status(400).json({ success: false, message: 'Service name already exists.' });
    }

    const updatedService = await Service.findByIdAndUpdate(id, { name, category }, { new: true });
    if (!updatedService) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Block/Unblock service
const blockServices = async (req, res) => {
  const { id } = req.params;
  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isBlocked = !service.isBlocked;
    await service.save();
    res.status(200).json({ message: 'Service block status updated', service });
  } catch (error) {
    res.status(500).json({ message: 'Error updating block status', error });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error: error.message });
  }
};

module.exports = {
  createService,
  getAllServices,
  updateService,
  blockServices,
  deleteService,
};
