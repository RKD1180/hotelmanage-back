const mongoose = require("mongoose");

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
    },
    costPerNight: {
      type: Number,
      required: true,
      min: 0,
    },
    availableRooms: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String, // Store URL or file path
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Hotel = mongoose.model("Hotel", HotelSchema);

module.exports = Hotel;
