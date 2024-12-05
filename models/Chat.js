const mongoose = require('mongoose');

const Chat=new mongoose.Schema({
    Members:{
        type:Array
    },
  

})
module.exports = mongoose.model('Chat',Chat);
