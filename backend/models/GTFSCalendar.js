const mongoose = require("mongoose");

const gtfsCalendarSchema = new mongoose.Schema({
  service_id: {
    type: String,
    required: true,
    unique: true,
  },
  monday: {
    type: Number,
    required: true,
    enum: [0, 1], // 0 = No service, 1 = Service available
  },
  tuesday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  wednesday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  thursday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  friday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  saturday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  sunday: {
    type: Number,
    required: true,
    enum: [0, 1],
  },
  start_date: {
    type: String,
    required: true, // Format: YYYYMMDD
  },
  end_date: {
    type: String,
    required: true, // Format: YYYYMMDD
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
gtfsCalendarSchema.index({ service_id: 1 });

gtfsCalendarSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSCalendar", gtfsCalendarSchema); 