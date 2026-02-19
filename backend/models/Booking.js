const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Passenger name is required"],
    trim: true,
  },
  age: {
    type: Number,
    required: [true, "Passenger age is required"],
    min: [1, "Age must be at least 1"],
    max: [120, "Age cannot exceed 120"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: [true, "Gender is required"],
  },
  phone: {
    type: String,
    match: [
      /^(\+977|977|0)?[9][0-9]{9}$/,
      "Please enter a valid Nepali phone number",
    ],
  },
  seatNumber: {
    type: String,
    required: [true, "Seat number is required"],
  },
  ticketType: {
    type: String,
    enum: ["adult", "child", "senior", "student"],
    default: "adult",
  },
  identityDocument: {
    type: {
      type: String,
      enum: ["citizenship", "passport", "license", "student_id"],
    },
    number: String,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
});

const bookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    bus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus",
      required: [true, "Bus is required"],
    },
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: [true, "Route is required"],
    },
    passengers: {
      type: [passengerSchema],
      validate: [arrayLimit, "Cannot book more than 6 seats per booking"],
    },
    journey: {
      date: {
        type: Date,
        required: [true, "Journey date is required"],
      },
      departureTime: {
        type: String,
        required: [true, "Departure time is required"],
      },
      estimatedArrivalTime: String,
      actualDepartureTime: Date,
      actualArrivalTime: Date,
      boardingPoint: {
        name: String,
        location: {
          latitude: Number,
          longitude: Number,
        },
        address: String,
      },
      droppingPoint: {
        name: String,
        location: {
          latitude: Number,
          longitude: Number,
        },
        address: String,
      },
    },
    pricing: {
      basePrice: {
        type: Number,
        required: true,
      },
      taxes: {
        type: Number,
        default: 0,
      },
      discounts: {
        amount: {
          type: Number,
          default: 0,
        },
        reason: String,
        couponCode: String,
      },
      totalAmount: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "NPR",
      },
    },
    payment: {
      method: {
        type: String,
        enum: ["cash", "card", "mobile_payment", "wallet", "bank_transfer"],
        required: true,
      },
      status: {
        type: String,
        enum: [
          "pending",
          "processing",
          "completed",
          "failed",
          "refunded",
          "partially_refunded",
        ],
        default: "pending",
      },
      transactionId: String,
      gateway: String,
      paidAmount: {
        type: Number,
        default: 0,
      },
      paymentDate: Date,
      refundAmount: {
        type: Number,
        default: 0,
      },
      refundDate: Date,
      refundReason: String,
    },
    status: {
      type: String,
      enum: ["confirmed", "pending", "cancelled", "completed", "no_show"],
      default: "pending",
    },
    cancellation: {
      isCancelled: {
        type: Boolean,
        default: false,
      },
      cancelledAt: Date,
      cancelledBy: {
        type: String,
        enum: ["user", "admin", "operator", "system"],
      },
      reason: String,
      refundEligible: {
        type: Boolean,
        default: false,
      },
      cancellationFee: {
        type: Number,
        default: 0,
      },
    },
    contact: {
      phone: {
        type: String,
        required: [true, "Contact phone is required"],
      },
      email: String,
      alternatePhone: String,
    },
    specialRequests: [
      {
        type: String,
        description: String,
      },
    ],
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      comment: String,
      submittedAt: Date,
      aspects: {
        busCondition: Number,
        driverBehavior: Number,
        punctuality: Number,
        comfort: Number,
        valueForMoney: Number,
      },
    },
    notifications: {
      confirmationSent: {
        type: Boolean,
        default: false,
      },
      reminderSent: {
        type: Boolean,
        default: false,
      },
      boardingReminder: {
        type: Boolean,
        default: false,
      },
    },
    checkInDetails: {
      isCheckedIn: {
        type: Boolean,
        default: false,
      },
      checkedInAt: Date,
      checkedInBy: String,
      location: {
        latitude: Number,
        longitude: Number,
      },
    },
    insurance: {
      isInsured: {
        type: Boolean,
        default: false,
      },
      provider: String,
      policyNumber: String,
      coverage: Number,
    },
    loyaltyPoints: {
      earned: {
        type: Number,
        default: 0,
      },
      redeemed: {
        type: Number,
        default: 0,
      },
    },
    referral: {
      referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      referralCode: String,
      referralDiscount: Number,
    },
    metadata: {
      userAgent: String,
      ipAddress: String,
      platform: String,
      source: {
        type: String,
        enum: ["web", "mobile_app", "api", "call_center"],
        default: "web",
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Custom validator for passenger array length
function arrayLimit(val) {
  return val.length <= 6;
}

// Virtual for total passengers
bookingSchema.virtual("totalPassengers").get(function () {
  return this.passengers ? this.passengers.length : 0;
});

// Virtual for journey status
bookingSchema.virtual("journeyStatus").get(function () {
  const now = new Date();
  const journeyDate = new Date(this.journey.date);

  if (this.status === "cancelled") return "cancelled";
  if (this.status === "completed") return "completed";
  if (this.actualArrivalTime) return "completed";
  if (this.actualDepartureTime) return "in_transit";
  if (journeyDate.toDateString() === now.toDateString()) return "today";
  if (journeyDate < now) return "missed";
  return "upcoming";
});

// Virtual for refund amount
bookingSchema.virtual("refundableAmount").get(function () {
  if (!this.cancellation.refundEligible) return 0;
  return Math.max(
    0,
    this.pricing.totalAmount - this.cancellation.cancellationFee,
  );
});

// Virtual for time until departure
bookingSchema.virtual("timeUntilDeparture").get(function () {
  const now = new Date();
  const departureDateTime = new Date(this.journey.date);
  const [hours, minutes] = this.journey.departureTime.split(":").map(Number);
  departureDateTime.setHours(hours, minutes, 0, 0);

  return Math.max(0, departureDateTime.getTime() - now.getTime());
});

// Pre-save middleware to generate booking number
bookingSchema.pre("save", function (next) {
  if (this.isNew && !this.bookingNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.bookingNumber = `BN${timestamp}${random}`;
  }
  next();
});

// Pre-save middleware to calculate loyalty points
bookingSchema.pre("save", function (next) {
  if (this.isNew || this.isModified("pricing.totalAmount")) {
    // 1 point per NPR 100 spent
    this.loyaltyPoints.earned = Math.floor(this.pricing.totalAmount / 100);
  }
  next();
});

// Method to calculate cancellation fee
bookingSchema.methods.calculateCancellationFee = function () {
  const hoursUntilDeparture = this.timeUntilDeparture / (1000 * 60 * 60);

  if (hoursUntilDeparture >= 24) {
    return this.pricing.totalAmount * 0.1; // 10% fee
  } else if (hoursUntilDeparture >= 6) {
    return this.pricing.totalAmount * 0.25; // 25% fee
  } else if (hoursUntilDeparture >= 2) {
    return this.pricing.totalAmount * 0.5; // 50% fee
  } else {
    return this.pricing.totalAmount; // No refund
  }
};

// Method to check if cancellation is allowed
bookingSchema.methods.canCancel = function () {
  if (this.status === "cancelled" || this.status === "completed") {
    return { allowed: false, reason: "Booking already cancelled or completed" };
  }

  const hoursUntilDeparture = this.timeUntilDeparture / (1000 * 60 * 60);

  if (hoursUntilDeparture < 1) {
    return {
      allowed: false,
      reason: "Cannot cancel within 1 hour of departure",
    };
  }

  return { allowed: true, fee: this.calculateCancellationFee() };
};

// Method to process cancellation
bookingSchema.methods.cancel = function (reason, cancelledBy = "user") {
  const cancellationCheck = this.canCancel();

  if (!cancellationCheck.allowed) {
    throw new Error(cancellationCheck.reason);
  }

  this.status = "cancelled";
  this.cancellation.isCancelled = true;
  this.cancellation.cancelledAt = new Date();
  this.cancellation.cancelledBy = cancelledBy;
  this.cancellation.reason = reason;
  this.cancellation.cancellationFee = cancellationCheck.fee;
  this.cancellation.refundEligible =
    cancellationCheck.fee < this.pricing.totalAmount;

  return this;
};

// Method to check in passenger
bookingSchema.methods.checkIn = function (location, checkedInBy) {
  if (this.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be checked in");
  }

  this.checkInDetails.isCheckedIn = true;
  this.checkInDetails.checkedInAt = new Date();
  this.checkInDetails.checkedInBy = checkedInBy;
  this.checkInDetails.location = location;

  return this;
};

// Method to add feedback
bookingSchema.methods.addFeedback = function (rating, comment, aspects = {}) {
  if (this.status !== "completed") {
    throw new Error("Can only provide feedback for completed journeys");
  }

  this.feedback.rating = rating;
  this.feedback.comment = comment;
  this.feedback.submittedAt = new Date();
  this.feedback.aspects = aspects;

  return this;
};

// Static method to generate booking reports
bookingSchema.statics.getBookingStats = function (startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalRevenue: { $sum: "$pricing.totalAmount" },
        totalPassengers: { $sum: "$totalPassengers" },
        averageBookingValue: { $avg: "$pricing.totalAmount" },
        confirmedBookings: {
          $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
        },
        cancelledBookings: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
      },
    },
  ]);
};

// Indexes for faster queries
bookingSchema.index({ bookingNumber: 1 });
bookingSchema.index({ user: 1 });
bookingSchema.index({ bus: 1 });
bookingSchema.index({ route: 1 });
bookingSchema.index({ "journey.date": 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ "payment.status": 1 });
bookingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Booking", bookingSchema);
