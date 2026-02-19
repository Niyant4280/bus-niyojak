const mongoose = require("mongoose");

const gtfsStopSchema = new mongoose.Schema({
  stop_id: {
    type: String,
    required: true,
    unique: true,
  },
  stop_code: {
    type: String,
    default: "",
  },
  stop_name: {
    type: String,
    required: true,
  },
  stop_desc: {
    type: String,
    default: "",
  },
  stop_lat: {
    type: Number,
    required: true,
  },
  stop_lon: {
    type: Number,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: false, // Make it not required initially
    },
  },
  facilities: [{
    type: String,
    enum: ["restroom", "food", "fuel", "atm", "medical", "parking", "wifi", "charging"],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes explicitly to avoid duplicates
gtfsStopSchema.index({ stop_id: 1 });
gtfsStopSchema.index({ stop_name: 1 });
gtfsStopSchema.index({ stop_lat: 1 });
gtfsStopSchema.index({ stop_lon: 1 });
gtfsStopSchema.index({ location: "2dsphere" });

gtfsStopSchema.pre("save", function (next) {
  // Set coordinates from lat/lon
  if (this.stop_lat && this.stop_lon) {
    this.location = {
      type: "Point",
      coordinates: [this.stop_lon, this.stop_lat] // GeoJSON format: [longitude, latitude]
    };
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSStop", gtfsStopSchema); 