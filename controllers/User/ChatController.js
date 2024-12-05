const mongoose = require("mongoose");
const Message = require("../../models/Message"); 
const Worker = require("../../models/Worker"); 
const Chat = require("../../models/Chat");

const getWorkerForUser = async (req, res) => {
    console.log('invoke');
    
  const { userId } = req.params; 
  console.log("Worker ID:", userId);

  try {
    const chatUsers = await Message.aggregate([
      {
        $group: {
          _id: "$senderId", 
          lastMessage: { $last: "$message" }, 
          lastMessageAt: { $last: "$timestamp" }, 
          chatId: { $last: "$chatId" }, 
        },
      },
      {
        $lookup: {
          from: "workers", // Join with the User collection
          localField: "_id",
          foreignField: "_id",
          as: "userDetails", // Output the user details
        },
      },
      {
        $unwind: "$userDetails", // Unwind the user details
      },
      {
        $project: {
          userId: "$_id",
          name: "$userDetails.fullname",
          email: "$userDetails.email",
          lastMessage: 1,
          lastMessageAt: 1, // Send the timestamp of the last message
        },
      },
      {
        $sort: { lastMessageAt: -1 }, // Sort by the most recent message
      },
    ]);

    console.log("Users whgguuuuuuuuuuuuuuuuuuuuuuuu:", chatUsers);

    // Send the response with the list of users
    return res.status(200).json({ success: true, users: chatUsers });
  } catch (error) {
    console.error("Error fetching users for worker:", error);
    return res.status(500).json({ success: false, message: "Error fetching users for worker", error: error.message });
  }
};

module.exports={getWorkerForUser}