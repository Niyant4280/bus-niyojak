const mongoose = require("mongoose");

const gtfsShapeSchema = new mongoose.Schema({
  shape_id: {
    type: String,
    required: true,
  },
  shape_pt_lat: {
    type: Number,
    required: true,
  },
  shape_pt_lon: {
    type: Number,
    required: true,
  },
  shape_pt_sequence: {
    type: Number,
    required: true,
  },
  shape_dist_traveled: {
    type: Number,
    default: 0,
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number],
      required: true,
    },
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
gtfsShapeSchema.index({ shape_id: 1 });

gtfsShapeSchema.pre("save", function (next) {
  // Set coordinates from lat/lon
  if (this.shape_pt_lat && this.shape_pt_lon) {
    this.location.coordinates = [this.shape_pt_lon, this.shape_pt_lat]; // GeoJSON format: [longitude, latitude]
  }
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSShape", gtfsShapeSchema); 