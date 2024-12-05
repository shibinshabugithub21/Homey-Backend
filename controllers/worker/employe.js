const Worker = require('../../models/Worker');

const jwt = require('jsonwebtoken'); 

const saveWorkerDetails = async (req, res) => {
  try {
    console.log("Controller start");
    console.log("Request body:", req.body); 

    const existingWorker = await Worker.findOne({ email: req.body.email });
    let workerDetails;

    if (existingWorker) {
      existingWorker.fullname = req.body.fullName;
      existingWorker.phone = req.body.phone;
      existingWorker.location = req.body.location;
      existingWorker.dob = req.body.dob;
      existingWorker.address = req.body.address;
      existingWorker.bloodGroup = req.body.bloodGroup;
      existingWorker.education = {
        highestLevel: req.body.highestLevel,
        institution: req.body.institution,
        fieldOfStudy: req.body.fieldOfStudy,
        yearOfPassing: req.body.yearOfPassing,
      };
      existingWorker.employment = {
        dateOfHire: req.body.dateOfHire,
        jobStatus: req.body.jobStatus,
        department: req.body.department,
      };
      workerDetails = await existingWorker.save();
      console.log("Worker updated:", workerDetails);
            const newWorkerData = {
        id: workerDetails._id,
        name: workerDetails.fullname,
        email: workerDetails.email,
        department: workerDetails.employment.department,
        dateOfJoin: workerDetails.dateOfJoin,
    };
    const io = req.app.get('socketio');
    io.emit('newWorkerRequest', newWorkerData);
    console.log("send notification successfully");
    } else {
      workerDetails = await Worker.create(req.body);
      console.log("New worker created:", workerDetails);  
    }

    return res.status(201).json({ success: true, data: workerDetails });
  } catch (error) {
    console.error("Error saving worker details:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};


const getWorkerDetails = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }
     console.log(token);
     
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const worker = await Worker.find({  email: decoded.email },
            );
            console.log(worker);
            
        
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.status(200).json(worker)

    } catch (error) {
        console.error('Error retrieving worker details:', error);
        res.status(500).json({ message: 'Invalid or expired token' });
    }
};
module.exports = {
    saveWorkerDetails,
    getWorkerDetails
};
