const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      match: [
        /^(\+977|977|0)?[9][0-9]{9}$/,
        "Please enter a valid Nepali phone number",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: { type: String, default: "Nepal" },
      zipCode: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    preferences: {
      seatPreference: {
        type: String,
        enum: ["window", "aisle", "any"],
        default: "any",
      },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      language: {
        type: String,
        enum: ["english", "nepali"],
        default: "english",
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    verificationTokens: {
      email: String,
      phone: String,
    },
    role: {
      type: String,
      enum: ["user", "operator", "admin"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
    profileImage: {
      type: String,
      default: null,
    },
    loginHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
        location: String,
      },
    ],
    bookingHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    savedRoutes: [
      {
        from: String,
        to: String,
        nickname: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: String,
      backupCodes: [String],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for user's age
userSchema.virtual("age").get(function () {
  if (this.dateOfBirth) {
    return Math.floor(
      (Date.now() - this.dateOfBirth.getTime()) /
        (365.25 * 24 * 60 * 60 * 1000),
    );
  }
  return null;
});

// Virtual for full address
userSchema.virtual("fullAddress").get(function () {
  if (this.address) {
    const parts = [
      this.address.street,
      this.address.city,
      this.address.state,
      this.address.country,
    ].filter(Boolean);
    return parts.join(", ");
  }
  return null;
});

// Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate verification token
userSchema.methods.generateVerificationToken = function () {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Static method to find by email or phone
userSchema.statics.findByEmailOrPhone = function (identifier) {
  return this.findOne({
    $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
  });
};

// Index for faster queries
userSchema.index({ email: 1, phone: 1 });
userSchema.index({ status: 1, role: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
