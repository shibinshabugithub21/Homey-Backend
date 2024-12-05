// controllers/workerController.js
const Worker = require('../../models/Worker'); 
const {sendDeletionReasonEmail} =require('../../services/emailServices')

// Get all workers
const getWorkers = async (req, res) => {
  try {
    const workers = await Worker.find(); 
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching workers' });
  }
};

// Block a worker
const blockWorker = async (req, res) => {
    try {
      console.log("worker block start");
      
      const worker = await Worker.findById(req.params.id);
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker not found" });
      }
      
      worker.isBlocked = !worker.isBlocked;
      await worker.save();
      
      res.json({ success: true, data: worker });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

const acceptWorker = async (req, res) => {
    console.log("Accepting worker start");
    const { id } = req.params;
  
    try {
      const worker = await Worker.findById(id);
      if (!worker) {
        return res.status(404).json({ success: false, message: "Worker not found" });
      }
  
      worker.employment.jobStatus = 'Approved';
      await worker.save();
  
      console.log(`Worker accepted: ${worker.name} (${worker.email})`);
      return res.status(200).json({ success: true, message: 'Worker accepted', worker });
    } catch (error) {
      console.error('Error accepting worker:', error);
      return res.status(500).json({ success: false, message: 'Error accepting worker' });
    }
};


// Delete a worker
const deleteWorker = async (req, res) => {
  console.log("deleteing worker start");
  
  const { id } = req.params;
  console.log("id",req.params);
  const { reason } = req.body; 
console.log("reason",req.body);

  if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason for deletion is required.' });
  }
  try {
      const worker = await Worker.findById(id);
      if (!worker) {
          return res.status(404).json({ success: false, error: 'Worker not found' });
      }
      const workerEmail = worker.email;
// Delete the worker
      await Worker.findByIdAndDelete(id);

      await sendDeletionReasonEmail(workerEmail, reason);

      return res.status(200).json({ success: true, message: 'Worker deleted successfully, and email sent.' });
  } catch (error) {
      console.error('Error deleting worker:', error);
      return res.status(500).json({ success: false, error: 'Error deleting worker or sending email.' });
  }
};

module.exports={getWorkers,blockWorker,acceptWorker,deleteWorker}