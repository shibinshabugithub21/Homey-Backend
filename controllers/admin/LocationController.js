const Location = require("../../models/Location");

// Create a new location
const createLocation = async (req, res) => {
  const { name } = req.body;
  const iconUrl = req.url;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required.",
    });
  }

  try {
    const existingLocation = await Location.findOne({ name: { $regex: new RegExp(`^${name}$`, "i") } });
    if (existingLocation) {
      return res.status(400).json({
        success: false,
        message: "Location already exists.",
      });
    }

    const newLocation = new Location({ name, icon: iconUrl });
    const savedLocation = await newLocation.save();

    res.status(201).json({
      success: true,
      data: savedLocation,
    });
  } catch (error) {
    console.error("Error saving location:", error);
    res.status(500).json({
      success: false,
      message: "Error saving location.",
    });
  }
};

// Get all locations
const getAllLocations = async (req, res) => {
  try {
    const locations = await Location.find();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message });
  }
};

// Update location
const updateLocation = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    const iconUrl = req.url; // This assumes the image is uploaded using a middleware like S3.
  
    try {
      // Check if a location with the same name already exists (excluding the current one)
      const existingLocation = await Location.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, "i") }, 
        _id: { $ne: id } 
      });
      if (existingLocation) {
        return res.status(400).json({ success: false, message: "Location name already exists." });
      }
  
      // Prepare updated data
      const updateData = { name };
      if (iconUrl) {
        updateData.icon = iconUrl;
      }
  
      // Update the location
      const updatedLocation = await Location.findByIdAndUpdate(id, updateData, { new: true });
      if (!updatedLocation) {
        return res.status(404).json({ success: false, message: "Location not found." });
      }
  
      res.status(200).json({ success: true, data: updatedLocation });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  

// Block/Unblock location
const blockLocation = async (req, res) => {
  const { id } = req.params;
  try {
    const location = await Location.findById(id);
    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    location.isBlocked = !location.isBlocked;
    await location.save();
    res.status(200).json({ message: "Location block status updated", location });
  } catch (error) {
    res.status(500).json({ message: "Error updating block status", error });
  }
};

// Delete location
const deleteLocation = async (req, res) => {
  try {
    const location = await Location.findByIdAndDelete(req.params.id);
    if (!location) return res.status(404).json({ message: "Location not found" });
    res.status(200).json({ message: "Location deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting location", error: error.message });
  }
};

module.exports = {
  createLocation,
  getAllLocations,
  updateLocation,
  blockLocation,
  deleteLocation,
};
