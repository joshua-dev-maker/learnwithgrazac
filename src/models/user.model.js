const mongoose = require("mongoose");

const User = mongoose.Schema;

//signup for new users
const UserSchema = new User(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "Unsubscribed",
      enum: ["Unsubscribed", "subscribed"]
    },
    isVerified: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);
const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
