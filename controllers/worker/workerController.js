const Worker = require('../../models/Worker');
const Otp = require('../../models/OTP');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const crypto = require("crypto");
const {sendLeaveApplicationNotification,sendResetPasswordEmail}=require('../../services/emailServices');
const { getLocation } = require('../User/userServicesController');

// Signup 
const registerWorker = async (req, res) => {
    const { fullname, phone, email, password } = req.body;
    console.log("Worker Details:", req.body);

    // Validate required fields
    if (!fullname || !phone || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Define regex patterns
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;
    const strongPasswordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

    // Validate email, phone, and password format
    if (!emailPattern.test(email) || !phonePattern.test(phone)) {
        return res.status(400).json({ message: 'Invalid email or phone number format' });
    }
    if (!strongPasswordPattern.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.'
        });
    }

    try {
        // Check if worker already exists
        const workerExists = await Worker.findOne({ email });
        if (workerExists) {
            return res.status(400).json({ message: 'Worker already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate token
        const token = jwt.sign(
            { fullname, phone, email, password: hashedPassword },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Generate OTP and expiry
        const otp = Math.floor(100000 + Math.random() * 900000);
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP to database
        const otpEntry = new Otp({ email, otp, expiresAt });
        await otpEntry.save();

        console.log(`OTP for ${email}: ${otp}`);
      
        // Send response
        res.status(201).json({
            message: 'OTP sent successfully',
            token,
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Worker login function
const workerLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        // Find the worker by email
        const worker = await Worker.findOne({ email });
        if (!worker) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password with hashed password in the database
        const isMatch = await bcrypt.compare(password, worker.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { id: worker._id, email: worker.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send the response with token and workerId
        res.status(200).json({
            message: 'Login successful',
            token, 
            workerId: worker._id,  // Add workerId to the response
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Verify OTP function
const verifyOTP = async (req, res) => {
    const { otp } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const savedOtp = await Otp.findOne({ email: decoded.email });
        if (!savedOtp) {
            return res.status(400).json({ message: 'No OTP found for this email' });
        }

        if (savedOtp.otp === otp) {
            const worker = await Worker.findOneAndUpdate(
                { email: decoded.email },
                {
                    fullname: decoded.fullname,
                    phone: decoded.phone,
                    password: decoded.password
                    // status:'pending'
                },
                { new: true, upsert: true }
            );

            console.log('Worker details saved successfully:', worker);
            res.status(200).json({ message: 'OTP verified successfully and worker saved', worker });
        } else {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Invalid or expired token' });
    }
};

// Get worker details function
const getWorker = async (req, res) => {
    console.log("the wokrer statt");
    
    try {
        const workerId = req.params.id;
        console.log("Requested Worker ID:", workerId);
        
        const worker = await Worker.findById(workerId); 
        console.log("worker",worker);
        
        if (worker) {
            res.json(worker); // Assuming fullname is the required field
        } else {
            res.status(404).json({ error: 'Worker not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateWorker = async (req, res) => {
    console.log("update the status start");
  
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      const allowedStatuses = ["Available", "Busy", "Do Not Disturb"];
      if (
        updateData.availabilityStatus &&
        !allowedStatuses.includes(updateData.availabilityStatus)
      ) {
        return res.status(400).json({
          message: `Invalid availabilityStatus. Allowed values are: ${allowedStatuses.join(", ")}`,
        });
      }
  
      const updatedWorker = await Worker.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
  
      if (!updatedWorker) {
        return res.status(404).json({ message: "Worker not found." });
      }
  
      res.status(200).json({
        message: "Worker updated successfully.",
        worker: updatedWorker,
      });
    } catch (error) {
      console.error("Error updating worker:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  };
  
//   leave settup
const leaveUpdate = async (req, res) => {
    const { leaveType, leaveDate, reason } = req.body;
    const workerId = req.params.id;
  
    try {
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
        worker.leaves.push({
        leaveType,
        leaveDate: new Date(leaveDate),
        reason,
      });
  
      await worker.save();
      adminEmail=process.env.MAIL_ID
      await sendLeaveApplicationNotification(adminEmail, {
        userName: worker.fullname, 
        leaveType,
        leaveDate: new Date(leaveDate).toLocaleDateString(), 
        reason,
    });
      
  
      res.status(200).json({ message: 'Leave applied successfully' });
    } catch (error) {
      console.error('Error applying leave:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  // Get leave history of worker
  const getLeave = async (req, res) => {
    const workerId = req.params.id;
  
    try {
      // Find worker by ID
      const worker = await Worker.findById(workerId);
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
  
      res.status(200).json({ leaves: worker.leaves });
    } catch (error) {
      console.error('Error fetching leave history:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
// Google callback function
const googleCallBack = async (req, res) => {
    try {
        console.log('Google callback is working');
        if (req.user) {
            let user = req.user;
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
            const userData = encodeURIComponent(JSON.stringify(req.user));
            const tokenData = encodeURIComponent(JSON.stringify(token));
            res.redirect(`http://localhost:3000/worker/registration`);
        } else {
            res.redirect('http://localhost:3000/worker/SignIn');
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
const forgetPasswordWorker=async (req,res) => {
    console.log("the forget is start");
  
    const { email } = req.body;
    const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour
  
    try {
      const user = await Worker.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "No account found with this email address." });
      }
  
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRATION;
  
      await user.save();
  
      const resetLink = `${process.env.FRONTEND_URL}/worker/ResetPassword?token=${resetToken}`;
      await sendResetPasswordEmail(resetLink, user.email);

  
      res.status(200).json({ message: "A password reset link has been sent to your email." });
    } catch (error) {
      console.error("Error in forgetPassword:", error);
      res.status(500).json({ message: "An error occurred. Please try again later." });
    }
    console.log("forget end");
    
}

const resetPasswordWorker=async (req,res) => {
    const { token, password, email } = req.body;

    if (!token || !password || !email) {
      return res.status(400).json({ message: "Invalid token, password, or email." });
    }
  
    try {
      const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
  
      const user = await Worker.findOne({
        email });
  
      if (!user) {
        return res.status(400).json({ message: "Token invalid or expired." });
      }
  
      user.password = await bcrypt.hash(password, 10);
      console.log("rest-password",user.password);
      
      await user.save();
  
      res.status(200).json({ message: "Password reset successfully!", success: true });
    } catch (error) {
      console.error("Error resetting password:", error);
      res.status(500).json({ message: "An error occurred during password reset." });
    }
}
const currentLocation= async (req, res) => {
  try {
    const response = await axios.get(`https://ipinfo.io/json?token=${process.env.Access_Token}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch location" });
  }
}
module.exports = {
    registerWorker,
    workerLogin,
    verifyOTP,
    getWorker,
    updateWorker,
    leaveUpdate,
    getLeave,
    googleCallBack,
    forgetPasswordWorker,
    resetPasswordWorker,
    currentLocation
};
