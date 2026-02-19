const mongoose = require("mongoose");

const stopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  address: String,
  arrivalTime: String, // Format: "HH:MM"
  departureTime: String, // Format: "HH:MM"
  stopDuration: {
    type: Number,
    default: 5, // minutes
  },
  distanceFromStart: {
    type: Number,
    default: 0, // in kilometers
  },
  facilities: [
    {
      type: String,
      enum: ["restroom", "food", "fuel", "atm", "medical", "parking"],
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
});

const routeSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: [true, "Route number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, "Route name is required"],
      trim: true,
    },
    origin: {
      name: {
        type: String,
        required: [true, "Origin name is required"],
      },
      location: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      address: String,
      terminal: String,
    },
    destination: {
      name: {
        type: String,
        required: [true, "Destination name is required"],
      },
      location: {
        latitude: {
          type: Number,
          required: true,
        },
        longitude: {
          type: Number,
          required: true,
        },
      },
      address: String,
      terminal: String,
    },
    intermediateStops: [stopSchema],
    distance: {
      total: {
        type: Number,
        required: [true, "Total distance is required"],
      },
      unit: {
        type: String,
        enum: ["km", "miles"],
        default: "km",
      },
    },
    duration: {
      estimated: {
        type: Number,
        required: [true, "Estimated duration is required"], // in minutes
      },
      actual: {
        type: Number,
        default: 0, // in minutes
      },
    },
    difficulty: {
      type: String,
      enum: ["easy", "moderate", "difficult"],
      default: "moderate",
    },
    roadCondition: {
      type: String,
      enum: ["excellent", "good", "fair", "poor"],
      default: "good",
    },
    terrain: {
      type: String,
      enum: ["plain", "hilly", "mountainous", "mixed"],
      default: "mixed",
    },
    weather: {
      affectedByMonsoon: {
        type: Boolean,
        default: true,
      },
      winterAccessible: {
        type: Boolean,
        default: true,
      },
      riskFactors: [
        {
          type: String,
          enum: ["landslide", "flood", "snow", "fog", "traffic"],
        },
      ],
    },
    operatingHours: {
      start: {
        type: String,
        required: true, // Format: "HH:MM"
      },
      end: {
        type: String,
        required: true, // Format: "HH:MM"
      },
      frequency: {
        type: Number,
        default: 60, // minutes between departures
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base price is required"],
        min: [0, "Price cannot be negative"],
      },
      pricePerKm: {
        type: Number,
        default: 2,
      },
      dynamicPricing: {
        enabled: {
          type: Boolean,
          default: false,
        },
        peakHourMultiplier: {
          type: Number,
          default: 1.2,
        },
        seasonalMultiplier: {
          type: Number,
          default: 1,
        },
      },
    },
    popularity: {
      bookingCount: {
        type: Number,
        default: 0,
      },
      rating: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5,
        },
        count: {
          type: Number,
          default: 0,
        },
      },
      searchCount: {
        type: Number,
        default: 0,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "maintenance"],
      default: "active",
    },
    busesOperating: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bus",
      },
    ],
    alternativeRoutes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
      },
    ],
    permits: {
      routePermit: String,
      validUntil: Date,
      issuedBy: String,
    },
    analytics: {
      averageOccupancy: {
        type: Number,
        default: 0,
      },
      peakHours: [
        {
          hour: Number,
          demand: Number,
        },
      ],
      monthlyRevenue: {
        type: Number,
        default: 0,
      },
      customerSatisfaction: {
        type: Number,
        default: 0,
      },
    },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        role: String,
        location: String,
      },
    ],
    touristAttractions: [
      {
        name: String,
        description: String,
        location: {
          latitude: Number,
          longitude: Number,
        },
        distanceFromRoute: Number,
        category: {
          type: String,
          enum: ["historical", "religious", "natural", "cultural", "adventure"],
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for total stops
routeSchema.virtual("totalStops").get(function () {
  return 2 + (this.intermediateStops ? this.intermediateStops.length : 0);
});

// Virtual for route description
routeSchema.virtual("description").get(function () {
  return `${this.origin.name} to ${this.destination.name}`;
});

// Virtual for estimated cost per km
routeSchema.virtual("costPerKm").get(function () {
  if (this.distance.total > 0) {
    return (
      Math.round((this.pricing.basePrice / this.distance.total) * 100) / 100
    );
  }
  return 0;
});

// Method to calculate price for specific distance
routeSchema.methods.calculatePrice = function (startStop = 0, endStop = null) {
  const totalStops = this.totalStops;
  endStop = endStop || totalStops - 1;

  if (startStop >= endStop || startStop < 0 || endStop >= totalStops) {
    throw new Error("Invalid stop indices");
  }

  const segmentRatio = (endStop - startStop) / (totalStops - 1);
  const segmentDistance = this.distance.total * segmentRatio;
  const price = this.pricing.pricePerKm * segmentDistance;

  return Math.max(price, this.pricing.basePrice * 0.1); // Minimum 10% of base price
};

// Method to get next available departure
routeSchema.methods.getNextDeparture = function (fromTime = new Date()) {
  const now = new Date(fromTime);
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = this.operatingHours.start
    .split(":")
    .map(Number);
  const [endHour, endMinute] = this.operatingHours.end.split(":").map(Number);

  const startTimeInMinutes = startHour * 60 + startMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  let nextDeparture = startTimeInMinutes;

  // Find next departure time
  while (nextDeparture <= endTimeInMinutes) {
    if (nextDeparture > currentTimeInMinutes) {
      const hour = Math.floor(nextDeparture / 60);
      const minute = nextDeparture % 60;
      return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    }
    nextDeparture += this.operatingHours.frequency;
  }

  // If no departure today, return first departure tomorrow
  return this.operatingHours.start;
};

// Method to update popularity metrics
routeSchema.methods.updatePopularity = function (type = "search") {
  if (type === "search") {
    this.popularity.searchCount += 1;
  } else if (type === "booking") {
    this.popularity.bookingCount += 1;
  }
  return this;
};

// Method to add rating
routeSchema.methods.addRating = function (rating) {
  if (rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5");
  }

  const totalRating =
    this.popularity.rating.average * this.popularity.rating.count + rating;
  this.popularity.rating.count += 1;
  this.popularity.rating.average = totalRating / this.popularity.rating.count;

  return this;
};

// Static method to find routes between cities
routeSchema.statics.findRoutes = function (originCity, destinationCity) {
  return this.find({
    $and: [
      {
        $or: [
          { "origin.name": new RegExp(originCity, "i") },
          { "intermediateStops.name": new RegExp(originCity, "i") },
        ],
      },
      {
        $or: [
          { "destination.name": new RegExp(destinationCity, "i") },
          { "intermediateStops.name": new RegExp(destinationCity, "i") },
        ],
      },
    ],
    status: "active",
  });
};

// Static method to find popular routes
routeSchema.statics.getPopularRoutes = function (limit = 10) {
  return this.find({ status: "active" })
    .sort({ "popularity.bookingCount": -1, "popularity.rating.average": -1 })
    .limit(limit);
};

// Indexes for faster queries
routeSchema.index({ routeNumber: 1 });
routeSchema.index({ "origin.name": 1, "destination.name": 1 });
routeSchema.index({ status: 1 });
routeSchema.index({ "popularity.bookingCount": -1 });
routeSchema.index({ "popularity.rating.average": -1 });
routeSchema.index({ "origin.location": "2dsphere" });
routeSchema.index({ "destination.location": "2dsphere" });

module.exports = mongoose.model("Route", routeSchema);
