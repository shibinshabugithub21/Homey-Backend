const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    Category: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    Offer:{type:String,
        trim:true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Category', categorySchema);