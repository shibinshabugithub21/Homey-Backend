const Service = require('../../models/Services');

// Create a new service
const createService = async (req, res) => {
  const { name, category,offer } = req.body;
  if (!name || !category || !offer) {
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

    const iconUrl = req.url;
    const newService = new Service({ name, category, icon: iconUrl,offer });
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
  console.log("rewrew",req.params);
  
  const { name, category, offer } = req.body;
  

  try {
    if (!name || !category || !offer) {
      return res.status(400).json({ success: false, message: "Name and category are required." });
    }

    // Check for duplicate service name
    const existingService = await Service.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });
    if (existingService) {
      return res.status(400).json({ success: false, message: "Service name already exists." });
    }

    // Update icon only if a new file is uploaded
    const updatedFields = { name, category, offer };
    if (req.file) {
      updatedFields.icon = req.file.location; // Assuming `req.file.location` holds the S3 URL
    }

    const updatedService = await Service.findByIdAndUpdate(id, updatedFields, { new: true });
    if (!updatedService) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    res.status(200).json({ success: true, data: updatedService });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ success: false, message: "Error updating service.", error: error.message });
  }
};


// Block/Unblock service
const blockServices = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    service.isBlocked = !service.isBlocked;
    await service.save();

    res.status(200).json({
      success: true,
      message: `Service ${service.isBlocked ? "blocked" : "unblocked"} successfully.`,
      data: service,
    });
  } catch (error) {
    console.error("Error updating block status:", error);
    res.status(500).json({ success: false, message: "Error updating block status.", error: error.message });
  }
};


// Delete service
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }

    // Actual deletion (you may choose to soft-delete by setting a `deleted` flag)
    await service.deleteOne();

    res.status(200).json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ success: false, message: "Error deleting service.", error: error.message });
  }
};




module.exports = {
  createService,
  getAllServices,
  updateService,
  blockServices,
  deleteService,

};
