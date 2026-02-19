const mongoose = require("mongoose");

const gtfsStopTimeSchema = new mongoose.Schema({
  trip_id: {
    type: String,
    required: true,
    ref: "GTFSTrip",
  },
  arrival_time: {
    type: String,
    required: true,
  },
  departure_time: {
    type: String,
    required: true,
  },
  stop_id: {
    type: String,
    required: true,
    ref: "GTFSStop",
  },
  stop_sequence: {
    type: Number,
    required: true,
  },
  stop_headsign: {
    type: String,
    default: "",
  },
  pickup_type: {
    type: Number,
    default: 0, // 0 = Regular pickup, 1 = No pickup, 2 = Phone agency, 3 = Coordinate with driver
  },
  drop_off_type: {
    type: Number,
    default: 0, // 0 = Regular drop-off, 1 = No drop-off, 2 = Phone agency, 3 = Coordinate with driver
  },
  continuous_pickup: {
    type: Number,
    default: 0,
  },
  continuous_drop_off: {
    type: Number,
    default: 0,
  },
  timepoint: {
    type: Number,
    default: 1, // 1 = Exact time, 0 = Approximate time
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
gtfsStopTimeSchema.index({ trip_id: 1 });
gtfsStopTimeSchema.index({ stop_id: 1 });

gtfsStopTimeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSStopTime", gtfsStopTimeSchema); 