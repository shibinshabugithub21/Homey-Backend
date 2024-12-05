const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
  bannername: { type: String, required: true },
  icon: { type: String, required: true },
  isBlocked: { type: Boolean, default: false }, // Add isBlocked field
}, { timestamps: true });

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
