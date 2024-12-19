const service = require('../../models/Services');
const Offer=require('../../models/Offer')
const Location=require('../../models/Location')
const Category=require('../../models/Category')

const getAllServices = async (req, res) => {
  console.log("fecth services");
  
    try {
        const services = await service.find();
        res.status(200).json(services); 
    } catch (error) {
        res.status(500).json({ message: 'Error fetching services', error: error.message });
    }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    console.log("category",categories);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories." });
  }
};

const getServicesById=async(req,res)=>{
  try {
    const {id}=req.params
    const services = await service.findById(id)
    res.status(200).json(services)
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error: error.message });

  }
}

const search = async (req, res) => {
  const searchQuery = req.query.search || '';
  console.log("Search initiated for query:", searchQuery);  // Debugging log

  try {
    const services = await service.find({
      $or: [
        { name: { $regex: searchQuery, $options: 'i' } },
        { category: { $regex: searchQuery, $options: 'i' } },
      ],
    });
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

const getOffers = async (req, res) => {
  console.log("offers");
  
  try {
    const offers = await Offer.find({status: 'active'}); 
    console.log("offers",offers);
     
    res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Failed to fetch offers' });
  }
};

const getLocation=async (req,res) => {
  console.log("get location on user side is start");
  try {
    const locations = await Location.find();
    console.log("locatios",locations);
    
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching locations", error: error.message });
  }
  console.log("get location on user side is stop");
}



module.exports = { getAllServices,getServicesById,getCategories, search,getOffers,getLocation};
