const User = require("../../models/User");
const Premium=require('../../models/Premium')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const getUserProfile = async (req, res) => {
  try {
    console.log("get user profile is working:");
    const { id } = req.params;
    console.log("userId", id);
    const user = await User.findOne({_id:id});
    console.log("user", user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};



const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Ensure all fields are provided
  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  // Ensure new password and confirm password match
  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
    // Extract token from Authorization header
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    // Save updated user info
    await user.save();
    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const addAddress = async (req, res) => {
  try {
    const { name, houseName, landmark, phone, city, pincode, location } = req.body;
    console.log("req", req.body);

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.profile.address.push({ name, houseName, landmark, phone, city, pincode, location });
    await user.save();

    res.status(201).json({ success: true, newAddress: user.profile.address[user.profile.address.length - 1] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getAddresses = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    console.log("user id is", userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, addresses: user.profile.address });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const editAddress = async (req, res) => {
    const { userId, addressId } = req.params;
    const updatedAddress = req.body;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      const addressIndex = user.profile.address.findIndex(
        (addr) => addr._id.toString() === addressId
      );
      if (addressIndex === -1) {
        return res.status(404).json({ success: false, message: "Address not found" });
      }
  
      // Update address
      user.profile.address[addressIndex] = updatedAddress;
  
      await user.save();
      const updatedAddr = user.profile.address[addressIndex];
      res.json({ success: true, address: updatedAddr });
    } catch (error) {
      res.status(500).json({ success: false, message: "Server error" });
    }
  };

const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.profile.address = user.profile.address.filter((address) => address._id.toString() !== addressId);
    await user.save();

    res.status(200).json({ success: true, message: "Address deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

const getUser=async(req, res) => {
  console.log("gtetlrw");
  
  const { id } = req.params;

  try {
    const user = await User.findOne({ id});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data such as password before sending the response
    const userDetails = {
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      dateOfJoin: user.dateOfJoin,
      profile: user.profile  // Adjust based on your schema
    };
    
    res.json(userDetails);
  } catch (error) {
    console.error('Error retrieving user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
}



module.exports = { getUserProfile,getUser, changePassword, addAddress, getAddresses, editAddress, deleteAddress};
