const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema({
  seatNumber: {
    type: String,
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isReserved: {
    type: Boolean,
    default: false,
  },
  passengerInfo: {
    name: String,
    phone: String,
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },
  },
  seatType: {
    type: String,
    enum: ["regular", "premium", "sleeper"],
    default: "regular",
  },
  position: {
    row: Number,
    column: Number,
    level: { type: String, enum: ["lower", "upper"], default: "lower" },
  },
});

const busSchema = new mongoose.Schema(
  {
    busNumber: {
      type: String,
      required: [true, "Bus number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    operator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Bus operator is required"],
    },
    busType: {
      type: String,
      enum: [
        "ac",
        "non-ac",
        "sleeper",
        "semi-sleeper",
        "deluxe",
        "super-deluxe",
      ],
      required: [true, "Bus type is required"],
    },
    capacity: {
      total: {
        type: Number,
        required: [true, "Total capacity is required"],
        min: [10, "Minimum capacity is 10"],
        max: [60, "Maximum capacity is 60"],
      },
      available: {
        type: Number,
        default: function () {
          return this.capacity.total;
        },
      },
    },
    seats: [seatSchema],
    amenities: [
      {
        type: String,
        enum: [
          "wifi",
          "charging_port",
          "entertainment",
          "blanket",
          "pillow",
          "water_bottle",
          "snacks",
          "gps_tracking",
          "cctv",
          "first_aid",
          "fire_extinguisher",
          "emergency_exit",
        ],
      },
    ],
    specifications: {
      make: String,
      model: String,
      year: Number,
      engineType: String,
      fuelType: {
        type: String,
        enum: ["diesel", "petrol", "electric", "hybrid"],
        default: "diesel",
      },
      mileage: Number,
      lastService: Date,
      nextServiceDue: Date,
      insuranceExpiry: Date,
      permitExpiry: Date,
    },
    driver: {
      primary: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        licenseNumber: { type: String, required: true },
        experience: Number,
      },
      secondary: {
        name: String,
        phone: String,
        licenseNumber: String,
        experience: Number,
      },
    },
    currentLocation: {
      latitude: Number,
      longitude: Number,
      address: String,
      lastUpdated: {
        type: Date,
        default: Date.now,
      },
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
    },
    schedule: {
      departureTime: String,
      arrivalTime: String,
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "daily",
      },
      operatingDays: [
        {
          type: String,
          enum: [
            "monday",
            "tuesday",
            "wednesday",
            "thursday",
            "friday",
            "saturday",
            "sunday",
          ],
        },
      ],
    },
    pricing: {
      basePrice: {
        type: Number,
        required: [true, "Base price is required"],
        min: [0, "Price cannot be negative"],
      },
      pricePerKm: Number,
      seasonalMultiplier: {
        type: Number,
        default: 1,
      },
      discounts: [
        {
          type: {
            type: String,
            enum: ["student", "senior", "military", "bulk"],
          },
          percentage: Number,
          description: String,
        },
      ],
    },
    ratings: {
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
      reviews: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
          },
          comment: String,
          date: {
            type: Date,
            default: Date.now,
          },
          aspects: {
            comfort: Number,
            cleanliness: Number,
            punctuality: Number,
            driverBehavior: Number,
            valueForMoney: Number,
          },
        },
      ],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance", "out_of_service"],
      default: "active",
    },
    trackingEnabled: {
      type: Boolean,
      default: true,
    },
    images: [
      {
        url: String,
        caption: String,
        isPrimary: Boolean,
      },
    ],
    documents: {
      registration: String,
      insurance: String,
      permit: String,
      pollution: String,
    },
    maintenance: [
      {
        date: Date,
        type: String,
        description: String,
        cost: Number,
        serviceCenter: String,
        nextServiceDate: Date,
      },
    ],
    earnings: {
      today: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    analytics: {
      totalTrips: { type: Number, default: 0 },
      totalDistance: { type: Number, default: 0 },
      occupancyRate: { type: Number, default: 0 },
      onTimePerformance: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for available seats count
busSchema.virtual("availableSeatsCount").get(function () {
  return this.seats
    ? this.seats.filter((seat) => seat.isAvailable && !seat.isReserved).length
    : this.capacity.available;
});

// Virtual for occupancy percentage
busSchema.virtual("occupancyPercentage").get(function () {
  if (this.capacity.total === 0) return 0;
  const occupied = this.capacity.total - this.availableSeatsCount;
  return Math.round((occupied / this.capacity.total) * 100);
});

// Method to initialize seats
busSchema.methods.initializeSeats = function () {
  const seats = [];
  const totalSeats = this.capacity.total;
  let seatNumber = 1;

  // Calculate rows based on bus type
  let seatsPerRow = 4; // Default for regular buses
  if (this.busType === "sleeper") seatsPerRow = 3;
  if (this.busType === "deluxe" || this.busType === "super-deluxe")
    seatsPerRow = 3;

  const rows = Math.ceil(totalSeats / seatsPerRow);

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= seatsPerRow && seatNumber <= totalSeats; col++) {
      seats.push({
        seatNumber: seatNumber.toString(),
        isAvailable: true,
        isReserved: false,
        seatType:
          this.busType === "sleeper"
            ? "sleeper"
            : this.busType.includes("deluxe")
              ? "premium"
              : "regular",
        position: {
          row: row,
          column: col,
          level: this.busType === "sleeper" && col === 3 ? "upper" : "lower",
        },
      });
      seatNumber++;
    }
  }

  this.seats = seats;
  return this;
};

// Method to book seat
busSchema.methods.bookSeat = function (seatNumber, passengerInfo, bookingId) {
  const seat = this.seats.find((s) => s.seatNumber === seatNumber);
  if (!seat || !seat.isAvailable || seat.isReserved) {
    throw new Error("Seat not available");
  }

  seat.isAvailable = false;
  seat.isReserved = true;
  seat.passengerInfo = passengerInfo;
  seat.passengerInfo.bookingId = bookingId;

  this.capacity.available = this.availableSeatsCount;
  return this;
};

// Method to release seat
busSchema.methods.releaseSeat = function (seatNumber) {
  const seat = this.seats.find((s) => s.seatNumber === seatNumber);
  if (seat) {
    seat.isAvailable = true;
    seat.isReserved = false;
    seat.passengerInfo = {};
    this.capacity.available = this.availableSeatsCount;
  }
  return this;
};

// Method to update rating
busSchema.methods.updateRating = function (newRating) {
  const totalRating = this.ratings.average * this.ratings.count + newRating;
  this.ratings.count += 1;
  this.ratings.average = totalRating / this.ratings.count;
  return this;
};

// Pre-save middleware to initialize seats if not present
busSchema.pre("save", function (next) {
  if (this.isNew && (!this.seats || this.seats.length === 0)) {
    this.initializeSeats();
  }
  next();
});

// Indexes for faster queries
busSchema.index({ busNumber: 1 });
busSchema.index({ operator: 1 });
busSchema.index({ route: 1 });
busSchema.index({ status: 1 });
busSchema.index({
  "currentLocation.latitude": 1,
  "currentLocation.longitude": 1,
});

module.exports = mongoose.model("Bus", busSchema);
