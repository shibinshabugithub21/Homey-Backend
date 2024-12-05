const Worker=require('../../models/Worker')
const Location = require('../../models/Location'); 
const Booking = require('../../models/Booking'); 
const Service = require('../../models/Services');

const getWorkerDetails = async (req, res) => {
    console.log("the wokrer stafhgjkhjhkjkjkjktt");
    
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

module.exports={getWorkerDetails}