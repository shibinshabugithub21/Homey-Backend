const express = require('express');
require('dotenv').config();
const workerController = require('../controllers/worker/workerController.js');
const employeController = require('../controllers/worker/employe.js');
const servicesController=require('../controllers/worker/servicesController.js')
const chatController=require('../controllers/worker/ChatController.js')
const DashboardController=require('../controllers/worker/DashBoadrcontroller.js')
const { sendOtpWorker } = require('../middleware/otpMiddleware.js');
// const { checkWorkerBlock } = require('../middleware/IsBlocked.js');
const passport = require('passport');
const { route } = require('./userRoutes.js');

const router = express.Router();

// Worker routes
router.post('/WorkerSignIn', workerController.workerLogin);
router.post('/WorkerSignUp', workerController.registerWorker);
router.post('/Workersend-otp', sendOtpWorker);
router.post('/WorkerVerify-otp', workerController.verifyOTP);
router.get('/getWorker/:id', workerController.getWorker);
router.post('/workerForget-password',workerController.forgetPasswordWorker)
router.post('/WorkerReset-password',workerController.resetPasswordWorker)
// worker Avaliblity
router.put("/updateWorker/:id", workerController.updateWorker);
// leave settup
router.post('/markLeave/:id', workerController.leaveUpdate);
router.get('/getLeaves/:id',workerController.getLeave)

// Employe routes
router.post('/WorkerPersonal-details', employeController.saveWorkerDetails);
router.post('/WorkerDetails', employeController.getWorkerDetails);


// Google auth (Passport.js)
router.get('/auth/google', (req, res, next) => {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

// Google callback
router.get('/auth/google/callback', workerController.googleCallBack);

// Booking
router.get('/getBooking/:workerId', servicesController.getBooking);
router.post('/updatePaymentAmount/:bookingId',servicesController.updateAmount)
router.put('/updateTaskStatus',servicesController.updateStatus)

// chat 
router.get('/getChatUsers/:workerId',chatController.getUsersForWorker)
router.get('/getMessages/:workerId/:userId', chatController.getMessages);
router.post('/createChat',chatController.createChat)
router.post('/createMessage',chatController.createMessage)

// dashboard
router.get('/getWorker/:id',DashboardController.getWorkerDetails);


module.exports = router;
