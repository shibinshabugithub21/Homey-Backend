const mongoose = require("mongoose");

const PremiumSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
    },
    offer: {
      type: [String],
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Premium", PremiumSchema);
