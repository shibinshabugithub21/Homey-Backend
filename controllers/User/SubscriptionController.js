const User=require('../../models/User')
const Premium=require('../../models/Premium')
const Admin=require('../../models/Admin')
const crypto = require('crypto');


const getPlans = async (req, res) => {
    try {
      const plans = await Premium.find();
      console.log("palns",plans);
      if (plans.length === 0) {
        return res.status(404).json({ message: "No plans found." });
      }
      res.status(200).json(plans);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch plans.",
        error: error.message,
      });
    }
};


const verifyPayment = async (req, res) => {
  console.log("verification start");

  const { userId, premiumId, amount, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  console.log("req", req.body);

  try {
    // Fetch the user using the userId
    const user = await User.findById(userId); 
    console.log("is user found", user);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find the premium plan the user purchased
    const premiumPlan = await Premium.findById(premiumId);
    if (!premiumPlan) {
      return res.status(404).json({ message: "Premium plan not found." });
    }

    // Convert amount from paise to rupees
    const amountInRupees = amount 

    // Update user's premium status
    user.premiumStatus = "Premium";
    user.premiumId = premiumPlan._id;  // Store the plan ID for reference
    await user.save();

    // Find the Admin document (assuming there is only one admin)
    const admin = await Admin.findOne();

    if (admin) {
      // Directly add the amount (no conversion needed)
      admin.premiumAmount += amountInRupees; // Add the payment amount directly

      // Optionally, you can add references like userId and premiumId to the Admin schema
      admin.userId = user._id;
      admin.premiumId = premiumPlan._id;

      await admin.save(); // Save the updated admin document

      console.log("Admin premium amount updated successfully");
    } else {
      // If no admin document exists, create a new one
      const newAdmin = new Admin({
        premiumAmount: amountInRupees,  // Set the initial premiumAmount directly
        userId: user._id,
        premiumId: premiumPlan._id,
      });
      await newAdmin.save();
      console.log("New Admin document created with the payment details");
    }

    return res.status(200).json({ message: "Payment successful! Subscription activated." });
  } catch (error) {
    console.error("Error processing payment:", error);
    return res.status(500).json({ message: "Error processing payment." });
  }
};




module.exports={getPlans,verifyPayment}