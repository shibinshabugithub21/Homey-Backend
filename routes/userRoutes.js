const express = require("express");
require("dotenv").config();
const UserController = require("../controllers/User/userController.js");
const serviceController = require("../controllers/User/userServicesController.js");
const ProfileController = require("../controllers/User/userProfielController.js");
const BookingController=require('../controllers/User/userBookingController.js')
const paymentController=require('../controllers/User/PaymentController.js')
const chatController=require('../controllers/User/ChatController.js')
const { sendOtp } = require("../middleware/otpMiddleware.js");
const { checkBlock } = require("../middleware/IsBlocked.js");
const passport = require("passport");
const router = express.Router();

// User Signup
router.post("/signUp", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.post("/send-otp", sendOtp);
router.post("/verifyotp", UserController.verifyOTP);
router.get("/getUserByToken", UserController.getUserByToken);
router.get("/getUser/:id", checkBlock, UserController.getUser);
router.post("/forget-password", UserController.forgetPassword);
router.post("/reset-password", UserController.resetPasswordController);

// services
router.get("/getServices", serviceController.getAllServices);
router.get('/getServices/:id',serviceController.getServicesById)
router.get('/getOffers', serviceController.getOffers);

// Banner
router.get('/getBanner',UserController.getBanner)
// location
router.get('/location',serviceController.getLocation)

// google auth
router.get("/auth/google", (req, res, next) => {
  console.log("google instinalided");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});


router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000/signUp",
  }),
  (req, res) => {
    const user = req.user;
    if (user && user.token) {
      res.redirect(`http://localhost:3000/userHome?token=${user.token}`);
    } else {
      res.redirect("http://localhost:3000/signUp");
    }
  }
);
// profile
router.get("/userProfile/:id", ProfileController.getUserProfile);
router.post("/changePassword", ProfileController.changePassword);
router.post("/addAddress", ProfileController.addAddress);
router.get("/getAddresses/:id", ProfileController.getAddresses);
router.delete("/deleteAddress/:addressId", ProfileController.deleteAddress);
router.put("/editAddress/:userId/:addressId", ProfileController.editAddress);
router.get('/user/:id',ProfileController.getUser)

// subscription
router.get('/getPlans',ProfileController.getPlans)

// search
router.get('/services',serviceController.search)
// Booking
router.get('/getServices', BookingController.getServices);
router.get('/getUser',BookingController.getUserById)
router.get('/availableWorker', BookingController.getAvailableWorkersByLocation);
router.post('/book-service', BookingController.confirmBooking);
router.get('/user-booking-history',BookingController.getUserBookingHistory); 
router.post("/worker-payment",BookingController.userToWorkerPaymnet)

// payment 
router.post('/create-order', paymentController.createOrder);

// caht

router.get('/getWorkerDetail/:userId',chatController.getWorkerForUser)



module.exports = router;
