const Premium = require("../../models/Premium");

const addPlans = async (req, res) => {
  console.log("start the add plans");

  try {
    const { type, services, amount } = req.body;
    console.log("req", req.body);
    if (!type || !services || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "At least one service must be provided." });
    }

    // Create a new plan
    const newPlan = new Premium({
      type,
      offer: services, // Save services to the schema field
      amount,
    });

    // Save the plan
    const savedPlan = await newPlan.save();

    res.status(201).json({
      message: "Plan added successfully.",
      data: savedPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add plan.",
      error: error.message,
    });
  }
};

// Edit an existing plan
const editPlans = async (req, res) => {
  console.log("edit satrt on plnas");
  
  try {
    const { id } = req.params;
    const { type, services, amount } = req.body;

    // Validate the input
    if (!type || !services || !amount) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "At least one offer must be provided." });
    }

    // Update the plan
    const updatedPlan = await Premium.findByIdAndUpdate(
      id,
      { type, offer: services, amount },
      { new: true } // Return the updated plan
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    res.status(200).json({
      message: "Plan updated successfully.",
      data: updatedPlan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update plan.",
      error: error.message,
    });
  }
};


// Delete a plan
const deletePlans = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPlan = await Premium.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    res.status(200).json({ message: "Plan deleted successfully." });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete plan.",
      error: error.message,
    });
  }
};


// Block or Unblock a plan
const blockorUnblockPlans = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await Premium.findById(id);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found." });
    }

    plan.isBlocked = !plan.isBlocked;
    await plan.save();

    res.status(200).json({
      message: plan.isBlocked
        ? "Plan blocked successfully."
        : "Plan unblocked successfully.",
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update block status.",
      error: error.message,
    });
  }
};


// Get all plans
const getPlans = async (req, res) => {
  try {
    const plans = await Premium.find();

    if (plans.length === 0) {
      return res.status(404).json({ message: "No plans found." });
    }

    res.status(200).json({
      message: "Plans fetched successfully.",
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch plans.",
      error: error.message,
    });
  }
};

module.exports = {
  addPlans,
  editPlans,
  deletePlans,
  blockorUnblockPlans,
  getPlans,
};
