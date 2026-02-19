const mongoose = require("mongoose");

const gtfsTripSchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    ref: "GTFSRoute",
  },
  service_id: {
    type: String,
    required: true,
  },
  trip_id: {
    type: String,
    required: true,
    unique: true,
  },
  trip_headsign: {
    type: String,
    default: "",
  },
  trip_short_name: {
    type: String,
    default: "",
  },
  direction_id: {
    type: Number,
    default: 0,
  },
  block_id: {
    type: String,
    default: "",
  },
  shape_id: {
    type: String,
    default: "",
  },
  wheelchair_accessible: {
    type: Number,
    default: 0, // 0 = No info, 1 = Accessible, 2 = Not accessible
  },
  bikes_allowed: {
    type: Number,
    default: 0, // 0 = No info, 1 = Allowed, 2 = Not allowed
  },
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
gtfsTripSchema.index({ route_id: 1 });
gtfsTripSchema.index({ service_id: 1 });
gtfsTripSchema.index({ trip_id: 1 });

gtfsTripSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSTrip", gtfsTripSchema); 