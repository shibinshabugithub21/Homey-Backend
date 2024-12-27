const express = require('express');
const adminController = require('../controllers/adminController.js');
const serviceController = require('../controllers/admin/servicesController.js');
const categoryController = require('../controllers/admin/CategoryController.js');
const workerController = require('../controllers/admin/workerController.js');
const UserController = require('../controllers/admin/userController.js');
const BookingController = require('../controllers/admin/BookingController.js');
const BannerController=require('../controllers/admin/BannerOfferController.js')
const locationController=require('../controllers/admin/LocationController.js')
const DashboardController=require('../controllers/admin/DashboardController.js')
const SubscriptionController=require('../controllers/admin/Subscription.js')
const s3UploadMiddleware=require('../middleware/multer.js')
const router = express.Router();
// Authentication
router.post('/signIn', adminController.login);
router.post('/logout', adminController.logout);

// router.use(protectAdminRoute)

// Worker
router.get('/workers', workerController.getWorkers);
router.put('/workerblock/:id', workerController.blockWorker);
router.delete('/deleteworkers/:id', workerController.deleteWorker);
router.post('/acceptworker/:id', workerController.acceptWorker); 

// User
router.get('/getUsers', UserController.getUser);
router.put('/blockUser/:id', UserController.blockUser);

// Services
router.get('/services', serviceController.getAllServices);
router.post('/addservices', s3UploadMiddleware, serviceController.createService); 
router.post('/blockServices/:id', serviceController.blockServices);
router.post('/editservice/:id', serviceController.updateService);
router.delete('/deleteservice/:id', serviceController.deleteService);


// Category
router.post("/addcategory", categoryController.addCategory);
router.get("/categories", categoryController.getCategories);
router.post('/blockorunblock/:id', categoryController.blockorUnblock);
router.put('/editcategory/:id', categoryController.editCategory);
router.delete('/deleteCategory/:id', categoryController.removeCategory);

// Booking
router.get('/booking', BookingController.getAllBookings); 

// Banner routes
router.get('/getBanner', BannerController.getBanner);
router.post('/addBanner', s3UploadMiddleware, BannerController.addBanner);
router.delete('/deleteBanner/:id', BannerController.deleteBanner); // Delete banner
router.put('/blockBanner/:id', BannerController.blockBanner); // Block/Unblock banner

// offer
router.get('/getOffers', BannerController.getOffers);
router.post('/addOffer', BannerController.addOffer);
router.put('/updateOffer/:id', BannerController.editOffer);
router.delete('/deleteOffer/:id', BannerController.deleteOffer);
router.put('/blockOffer/:id',BannerController.BlockOffer)

// location
router.get("/locations", locationController.getAllLocations);
router.post("/addlocation", s3UploadMiddleware, locationController.createLocation);
router.post("/blockLocation/:id", locationController.blockLocation);
router.put("/editlocation/:id", s3UploadMiddleware, locationController.updateLocation);
router.delete("/deletelocation/:id", locationController.deleteLocation);

// Dashboard
router.get('/getUser',DashboardController.getUserCount)
router.get('/getWorker',DashboardController.getWorkerCount)
router.get('/getService', DashboardController.getServiceCount);
router.get('/getBooking', DashboardController.getBookingCount);
router.get('/getLocation', DashboardController.getLocationCount);
router.get('/revenue',DashboardController.getRevenue)
router .get('/services-status',DashboardController.servicesStaus)
router.get('/mostBookedServices', DashboardController.mostUsedServices);


// subscription
router.get('/getPlans',SubscriptionController.getPlans)
router.post('/addPlans',SubscriptionController.addPlans)
router.put('/editPlans/:id',SubscriptionController.editPlans)
router.delete("/delete/:id",SubscriptionController.deletePlans)
router.post('/blockPlans/:id',SubscriptionController.blockorUnblockPlans)
module.exports = router;
