const User = require("../../models/User");
const Otp = require("../../models/OTP");
const { sendResetPasswordEmail } = require("../../services/emailServices");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Banner=require('../../models/Banner')
const crypto = require("crypto"); // Make sure to import crypto if not already imported

const registerUser = async (req, res) => {
  const { fullname, phone, email, password } = req.body;
  console.log("User registration info:", req.body);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phonePattern = /^[0-9]{10}$/;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!fullname || !phone || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }
  if (!phonePattern.test(phone)) {
    return res.status(400).json({ message: "Invalid phone number format" });
  }
  if (!passwordPattern.test(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
    });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullname,
      phone,
      email,
      password: hashedPassword,
      dateOfJoin: new Date(),
    });
    await newUser.save();

    const token = jwt.sign(
      {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
        phone: newUser.phone,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Otp Send successfull",
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log("Email or password not provided");
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User not found for email: ${email}`);
      return res.status(400).json({ message: "user not ofund" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      return res.status(400).json({ message: "Password not matc h" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("Login successful for user:", user.email);
    res.status(200).json({ token, userId: user._id, userName: user.fullname });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserByToken = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Respond with user data
    res.status(200).json({ email: user.email, fullname: user.fullname });
  } catch (error) {
    console.error("Error fetching user by token:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const savedOtp = await Otp.findOne({ email: decoded.email });
    if (!savedOtp) {
      return res.status(400).json({ message: "No OTP found for this email" });
    }
    if (savedOtp.otp === otp) {
      const user = await User.findOneAndUpdate(
        { email: decoded.email },
        {
          $set: {
            name: decoded.fullname,
            email: decoded.email,
            phone: decoded.phone,
            password: decoded.password,
          },
        },
        { new: true, upsert: true }
      );
      console.log("User details saved successfully:", user);
      res.status(200).json({ message: "OTP verified successfully and user saved.", user });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Invalid or expired token" });
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (user) {
      res.json({ name: user.name });
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const googleCallBack = async (req, res) => {
  try {
    console.log("google call back is workign");
    if (req.user) {
      let user = req.user;
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
      const userData = encodeURIComponent(JSON.stringify(req.user));
      console.log("ewr",user);
      
      const tokenData = encodeURIComponent(JSON.stringify(token));
      console.log('tokenData',tokenData)
      res.redirect(`http://localhost:3000/userHome`);
    } else {
      res.redirect("http://localhost:3000");
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

const forgetPassword = async (req, res) => {
  console.log("the forget is start");
  
  const { email } = req.body;
  const RESET_TOKEN_EXPIRATION = 60 * 60 * 1000; // 1 hour

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + RESET_TOKEN_EXPIRATION;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/ResetPassword?token=${resetToken}`;
    await sendResetPasswordEmail(resetLink, user.email);

    res.status(200).json({ message: "A password reset link has been sent to your email." });
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
  console.log("forget end");
  
};

const resetPasswordController = async (req, res) => {
  const { token, password, email } = req.body;

  if (!token || !password || !email) {
    return res.status(400).json({ message: "Invalid token, password, or email." });
  }

  try {
    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email });

    if (!user) {
      return res.status(400).json({ message: "Token invalid or expired." });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successfully!", success: true });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "An error occurred during password reset." });
  }
};

const getBanner = async (req, res) => {
  console.log("banner syart");
  
  try {
      const banners = await Banner.find({isBlocked:false});
      console.log("bsnner",banners);
      
      res.status(200).json(banners);
  } catch (error) {
      console.error("Error fetching banners:", error);
      res.status(500).json({ message: "Failed to fetch banners" });
  }
};



module.exports = {
  registerUser,
  loginUser,
  verifyOTP,
  getUserByToken,
  getUser,
  googleCallBack,
  forgetPassword,
  resetPasswordController,
  getBanner
};
