const User=require('../../models/User')

const getUser = async (req, res) => {
    try {
      const users = await User.find();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users", error: error.message });
    }
  };
  
  const blockUser = async (req, res) => {
      const userId = req.params.id;
    
      try {
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
            user.isBlocked = !user.isBlocked;
            await user.save();
    
        res.status(200).json({ success: true, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully!`, data: user });
      } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "Error updating user status", error: error.message });
      }
    };

    module.exports={
        getUser,
        blockUser
    }