const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  premiumAmount:{type:String},
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);
module.exports = Admin;
