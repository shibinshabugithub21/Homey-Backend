const Banner=require('../../models/Banner')
const Offer=require('../../models/Offer')

const getBanner = async (req, res) => {
    try {
        const banners = await Banner.find();
        res.status(200).json(banners);
    } catch (error) {
        console.error("Error fetching banners:", error);
        res.status(500).json({ message: "Failed to fetch banners" });
    }
};

const addBanner = async (req, res) => {
    console.log("add banner start");
  
    const { bannername } = req.body; // Only bannername is required
    const icon = req.url; // Get the S3 URL from the middleware
  
    // Validate that both bannername and icon are provided
    if (!bannername || !icon) {
      return res.status(400).json({ message: 'Banner name and icon are required.' });
    }
  
    try {
      // Create a new banner document without the 'status' field
      const newBanner = new Banner({ bannername, icon });
  
      // Save to the database
      await newBanner.save();
  
      // Respond with the newly created banner object
      res.status(201).json(newBanner);
    } catch (error) {
      console.error("Error adding banner:", error);
      res.status(500).json({ message: "Failed to add banner." });
    }
  };
  


// Delete a banner
const deleteBanner = async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedBanner = await Banner.findByIdAndDelete(id);
  
      if (!deletedBanner) {
        return res.status(404).json({ message: "Banner not found" });
      }
  
      res.status(200).json({ message: "Banner deleted successfully" });
    } catch (error) {
      console.error("Error deleting banner:", error);
      res.status(500).json({ message: "Failed to delete banner" });
    }
  };
  
// Backend: Toggling Banner Block/Unblock
const blockBanner = async (req, res) => {
    console.log("blockbanner starts");
    
    const bannerId = req.params.id;
  
    try {
      const banner = await Banner.findById(bannerId);
      if (!banner) {
        return res.status(404).json({ message: 'Banner not found' });
      }
  
      // Toggle the isBlocked status
      banner.isBlocked = !banner.isBlocked;
      await banner.save();
  
      return res.status(200).json({
        message: banner.isBlocked ? 'Banner blocked' : 'Banner unblocked',
        banner: banner,
      });
    } catch (error) {
      console.error('Error toggling banner status:', error);
      return res.status(500).json({ message: 'Failed to toggle banner status' });
    }
  };
  
  // Get All Offers
const getOffers = async (req, res) => {
    try {
      const offers = await Offer.find();
      res.status(200).json(offers);
    } catch (error) {
      console.error('Error fetching offers:', error);
      res.status(500).json({ message: 'Failed to fetch offers' });
    }
  };
  
  // Add New Offer
  const addOffer = async (req, res) => {
    try {
      const { title, details } = req.body;
  
      // Check for duplicate title
      const existingOffer = await Offer.findOne({ title: { $regex: new RegExp(`^${title}$`, 'i') } });
      if (existingOffer) {
        return res.status(400).json({ message: 'Offer title already exists' });
      }
  
      const newOffer = new Offer({ title, details });
      await newOffer.save();
      res.status(201).json(newOffer);
    } catch (error) {
      res.status(500).json({ message: 'Error adding offer' });
    }
  };
  
  
  // Delete Offer
  const deleteOffer = async (req, res) => {
    try {
      const offerId = req.params.id;
      await Offer.findByIdAndDelete(offerId);
      res.status(200).json({ message: 'Offer deleted successfully.' });
    } catch (error) {
      console.error('Error deleting offer:', error);
      res.status(500).json({ message: 'Failed to delete offer' });
    }
  };

  // Update an Offer
const editOffer = async (req, res) => {
    const { id } = req.params;
    const { title, details } = req.body;
  
    if (!title || !details) {
      return res.status(400).json({ message: 'Title and details are required.' });
    }
  
    try {
      const updatedOffer = await Offer.findByIdAndUpdate(
        id,
        { title, details },
        { new: true }
      );
      res.status(200).json(updatedOffer);
    } catch (error) {
      console.error('Error updating offer:', error);
      res.status(500).json({ message: 'Failed to update offer.' });
    }
  };

  const BlockOffer=async (req, res) => {
    const { id } = req.params;  // Get offer ID from the URL

    try {
      const offer = await Offer.findById(id);  // Find the offer by its ID
      
      if (!offer) {
        return res.status(404).json({ error: 'Offer not found.' });  // Return error if offer doesn't exist
      }
      
      // Toggle status between 'active' and 'blocked'
      offer.status = offer.status === 'active' ? 'blocked' : 'active';
  
      const updatedOffer = await offer.save();  // Save the updated offer
      
      res.json({
        message: `Offer is now ${updatedOffer.status}`,
        offer: updatedOffer,  // Return the updated offer object
      });
    } catch (error) {
      console.error('Error toggling offer status:', error);
      res.status(500).json({ error: 'Failed to toggle offer status.' });
    }
  }


  
  
module.exports={getBanner, addBanner,  deleteBanner, blockBanner,getOffers,addOffer,deleteOffer,editOffer,BlockOffer}