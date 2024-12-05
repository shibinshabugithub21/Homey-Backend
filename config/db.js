const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error("Mongodb Coneetion error",err);
    process.exit(1);
  }
};

module.exports = connectDB;
