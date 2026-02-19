const mongoose = require("mongoose");

const gtfsRouteSchema = new mongoose.Schema({
  route_id: {
    type: String,
    required: true,
    unique: true,
  },
  agency_id: {
    type: String,
    default: "",
  },
  route_short_name: {
    type: String,
    required: true,
  },
  route_long_name: {
    type: String,
    required: true,
  },
  route_desc: {
    type: String,
    default: "",
  },
  route_type: {
    type: Number,
    default: 1, // 1 = Subway/Metro, 3 = Bus
  },
  route_url: {
    type: String,
    default: "",
  },
  route_color: {
    type: String,
    default: "",
  },
  route_text_color: {
    type: String,
    default: "",
  },
  route_sort_order: {
    type: Number,
    default: 0,
  },
  continuous_pickup: {
    type: String,
    default: "",
  },
  continuous_drop_off: {
    type: String,
    default: "",
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
gtfsRouteSchema.index({ route_id: 1 });
gtfsRouteSchema.index({ route_short_name: 1 });

gtfsRouteSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("GTFSRoute", gtfsRouteSchema); 