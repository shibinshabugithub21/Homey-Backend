const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    profile: {
      address: [
        {
          name: { type: String, required: true },
          houseName: { type: String, required: true },
          city: { type: String, required: true },
          landmark: { type: String }, 
          phone: { type: String, required: true }, 
          pincode: { type: String, required: true }, 
          location: { type: String, required: true }, 
        },
      ],
    },
    password: { type: String, required: true },
    dateOfJoin: { type: Date, default: Date.now },
    isBlocked: { type: Boolean, default: false },
   
    role: { type: String, enum: ["user", "worker", "admin"], default: "user" },
    premiumStatus: {
      type: String,
      enum: ["Premium", "Not Premium"],
      default: "Not Premium",
    },
    premiumId:{type:mongoose.Schema.Types.ObjectId,ref:"Premium",require:true},
  },
  { timestamps: true } 
);

const User = mongoose.model("User", userSchema);
module.exports = User;
