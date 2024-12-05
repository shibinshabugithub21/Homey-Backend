const User = require('../models/User');
const Worker=require('../models/Worker')
const {jwtDecode} = require('jwt-decode');

const checkBlock = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  try {
    const decoded = jwtDecode(token);
    const user = await User.findById(decoded.id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Access denied.' });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

const checkWorkerBlock = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided. Authorization denied.' });
  }

  try {
    const decoded = jwtDecode(token); 
    const user = await Worker.findById(decoded.id); 
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ message: 'User is blocked. Access denied.' });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

module.exports = { checkBlock,checkWorkerBlock };
