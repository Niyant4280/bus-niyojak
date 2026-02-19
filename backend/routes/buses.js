const express = require("express");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const {
  authenticateToken,
  requireOperator,
  optionalAuth,
} = require("../middleware/auth");

const router = express.Router();

// Get all buses (public - with optional auth for personalization)
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      busType,
      route,
      status = "active",
      operator,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      amenities,
      priceRange,
    } = req.query;

    // Build query
    const query = { status };

    if (busType) query.busType = busType;
    if (route) query.route = route;
    if (operator) query.operator = operator;

    if (search) {
      query.$or = [
        { busNumber: { $regex: search, $options: "i" } },
        { "specifications.make": { $regex: search, $options: "i" } },
        { "specifications.model": { $regex: search, $options: "i" } },
      ];
    }

    if (amenities) {
      const amenityList = amenities.split(",");
      query.amenities = { $all: amenityList };
    }

    if (priceRange) {
      const [min, max] = priceRange.split("-").map(Number);
      query["pricing.basePrice"] = { $gte: min, $lte: max };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const buses = await Bus.find(query)
      .populate("operator", "name email phone")
      .populate("route", "name origin destination distance")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-seats.passengerInfo"); // Hide passenger info for public access

    const total = await Bus.countDocuments(query);

    res.json({
      buses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get buses error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get buses",
        code: "GET_BUSES_ERROR",
      },
    });
  }
});

// Get single bus details
router.get("/:busId", optionalAuth, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId)
      .populate("operator", "name email phone")
      .populate("route", "name origin destination distance intermediateStops");

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    // Hide passenger info for non-operators
    if (
      !req.user ||
      (req.user.role !== "operator" && req.user.role !== "admin")
    ) {
      bus.seats = bus.seats.map((seat) => ({
        ...seat.toObject(),
        passengerInfo: seat.isAvailable
          ? {}
          : { bookingId: seat.passengerInfo.bookingId },
      }));
    }

    res.json({ bus });
  } catch (error) {
    console.error("Get bus error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get bus details",
        code: "GET_BUS_ERROR",
      },
    });
  }
});

// Create new bus (operators and admins only)
router.post("/", authenticateToken, requireOperator, async (req, res) => {
  try {
    const busData = {
      ...req.body,
      operator: req.user.role === "admin" ? req.body.operator : req.user._id,
    };

    // Validate required fields
    const requiredFields = [
      "busNumber",
      "busType",
      "capacity",
      "driver",
      "pricing",
    ];
    const missingFields = requiredFields.filter((field) => !busData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    // Check if bus number already exists
    const existingBus = await Bus.findOne({
      busNumber: busData.busNumber.toUpperCase(),
    });
    if (existingBus) {
      return res.status(409).json({
        error: {
          message: "Bus with this number already exists",
          code: "BUS_NUMBER_EXISTS",
        },
      });
    }

    const bus = new Bus(busData);
    await bus.save();

    await bus.populate("operator", "name email phone");
    await bus.populate("route", "name origin destination");

    res.status(201).json({
      message: "Bus created successfully",
      bus,
    });
  } catch (error) {
    console.error("Create bus error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: {
          message: messages.join(", "),
          code: "VALIDATION_ERROR",
        },
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        error: {
          message: "Bus number already exists",
          code: "DUPLICATE_BUS_NUMBER",
        },
      });
    }

    res.status(500).json({
      error: {
        message: "Failed to create bus",
        code: "CREATE_BUS_ERROR",
      },
    });
  }
});

// Update bus
router.put("/:busId", authenticateToken, requireOperator, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    // Check ownership (operators can only update their own buses)
    if (
      req.user.role === "operator" &&
      bus.operator.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        error: {
          message: "Access denied - not your bus",
          code: "ACCESS_DENIED",
        },
      });
    }

    // Prevent updating certain fields after bookings exist
    const hasActiveBookings = await Booking.countDocuments({
      bus: req.params.busId,
      status: { $in: ["confirmed", "pending"] },
      "journey.date": { $gte: new Date() },
    });

    if (hasActiveBookings > 0) {
      const restrictedFields = ["capacity", "busType"];
      const updatingRestricted = restrictedFields.some(
        (field) => req.body[field] !== undefined,
      );

      if (updatingRestricted) {
        return res.status(400).json({
          error: {
            message: "Cannot update capacity or bus type with active bookings",
            code: "HAS_ACTIVE_BOOKINGS",
          },
        });
      }
    }

    // Update bus
    Object.keys(req.body).forEach((key) => {
      if (key !== "operator") {
        // Prevent changing operator
        bus[key] = req.body[key];
      }
    });

    await bus.save();

    await bus.populate("operator", "name email phone");
    await bus.populate("route", "name origin destination");

    res.json({
      message: "Bus updated successfully",
      bus,
    });
  } catch (error) {
    console.error("Update bus error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        error: {
          message: messages.join(", "),
          code: "VALIDATION_ERROR",
        },
      });
    }

    res.status(500).json({
      error: {
        message: "Failed to update bus",
        code: "UPDATE_BUS_ERROR",
      },
    });
  }
});

// Update bus location (for real-time tracking)
router.put(
  "/:busId/location",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { latitude, longitude, address } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: {
            message: "Latitude and longitude are required",
            code: "MISSING_COORDINATES",
          },
        });
      }

      const bus = await Bus.findById(req.params.busId);

      if (!bus) {
        return res.status(404).json({
          error: {
            message: "Bus not found",
            code: "BUS_NOT_FOUND",
          },
        });
      }

      // Check ownership
      if (
        req.user.role === "operator" &&
        bus.operator.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: {
            message: "Access denied - not your bus",
            code: "ACCESS_DENIED",
          },
        });
      }

      bus.currentLocation = {
        latitude,
        longitude,
        address: address || bus.currentLocation.address,
        lastUpdated: new Date(),
      };

      await bus.save();

      res.json({
        message: "Bus location updated successfully",
        location: bus.currentLocation,
      });
    } catch (error) {
      console.error("Update location error:", error);
      res.status(500).json({
        error: {
          message: "Failed to update bus location",
          code: "UPDATE_LOCATION_ERROR",
        },
      });
    }
  },
);

// Get bus seat availability
router.get("/:busId/seats", optionalAuth, async (req, res) => {
  try {
    const { date, departureTime } = req.query;

    if (!date) {
      return res.status(400).json({
        error: {
          message: "Date is required",
          code: "MISSING_DATE",
        },
      });
    }

    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    // Get bookings for the specific date and time
    const searchDate = new Date(date);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bookingQuery = {
      bus: req.params.busId,
      status: { $in: ["confirmed", "pending"] },
      "journey.date": {
        $gte: searchDate,
        $lt: nextDay,
      },
    };

    if (departureTime) {
      bookingQuery["journey.departureTime"] = departureTime;
    }

    const bookedSeats = await Booking.find(bookingQuery).select(
      "passengers.seatNumber",
    );

    // Create a set of booked seat numbers
    const bookedSeatNumbers = new Set();
    bookedSeats.forEach((booking) => {
      booking.passengers.forEach((passenger) => {
        bookedSeatNumbers.add(passenger.seatNumber);
      });
    });

    // Update seat availability
    const seats = bus.seats.map((seat) => ({
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      position: seat.position,
      isAvailable: !bookedSeatNumbers.has(seat.seatNumber),
      isReserved: bookedSeatNumbers.has(seat.seatNumber),
    }));

    const availableCount = seats.filter((seat) => seat.isAvailable).length;
    const occupancyPercentage = Math.round(
      ((bus.capacity.total - availableCount) / bus.capacity.total) * 100,
    );

    res.json({
      seats,
      summary: {
        total: bus.capacity.total,
        available: availableCount,
        booked: bus.capacity.total - availableCount,
        occupancyPercentage,
      },
    });
  } catch (error) {
    console.error("Get seats error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get seat availability",
        code: "GET_SEATS_ERROR",
      },
    });
  }
});

// Add bus rating and review
router.post("/:busId/reviews", authenticateToken, async (req, res) => {
  try {
    const { rating, comment, aspects } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          message: "Rating must be between 1 and 5",
          code: "INVALID_RATING",
        },
      });
    }

    const bus = await Bus.findById(req.params.busId);

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    // Check if user has completed a trip on this bus
    const completedBooking = await Booking.findOne({
      user: req.user._id,
      bus: req.params.busId,
      status: "completed",
    });

    if (!completedBooking) {
      return res.status(403).json({
        error: {
          message: "You can only review buses you have traveled on",
          code: "NO_COMPLETED_BOOKING",
        },
      });
    }

    // Check if user already reviewed this bus
    const existingReview = bus.ratings.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (existingReview) {
      return res.status(409).json({
        error: {
          message: "You have already reviewed this bus",
          code: "REVIEW_EXISTS",
        },
      });
    }

    // Add review
    bus.ratings.reviews.push({
      user: req.user._id,
      rating,
      comment,
      aspects,
      date: new Date(),
    });

    // Update average rating
    bus.updateRating(rating);

    await bus.save();
    await bus.populate("ratings.reviews.user", "name");

    res.json({
      message: "Review added successfully",
      review: bus.ratings.reviews[bus.ratings.reviews.length - 1],
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      error: {
        message: "Failed to add review",
        code: "ADD_REVIEW_ERROR",
      },
    });
  }
});

// Get bus reviews
router.get("/:busId/reviews", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const bus = await Bus.findById(req.params.busId)
      .populate("ratings.reviews.user", "name profileImage")
      .select("ratings");

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    const reviews = bus.ratings.reviews
      .sort((a, b) => b.date - a.date)
      .slice((page - 1) * limit, page * limit);

    const total = bus.ratings.reviews.length;

    res.json({
      reviews,
      summary: {
        average: bus.ratings.average,
        count: bus.ratings.count,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get reviews error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get reviews",
        code: "GET_REVIEWS_ERROR",
      },
    });
  }
});

// Delete bus (soft delete - mark as inactive)
router.delete(
  "/:busId",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const bus = await Bus.findById(req.params.busId);

      if (!bus) {
        return res.status(404).json({
          error: {
            message: "Bus not found",
            code: "BUS_NOT_FOUND",
          },
        });
      }

      // Check ownership
      if (
        req.user.role === "operator" &&
        bus.operator.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: {
            message: "Access denied - not your bus",
            code: "ACCESS_DENIED",
          },
        });
      }

      // Check for active bookings
      const activeBookings = await Booking.countDocuments({
        bus: req.params.busId,
        status: { $in: ["confirmed", "pending"] },
        "journey.date": { $gte: new Date() },
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: {
            message: "Cannot delete bus with active bookings",
            code: "HAS_ACTIVE_BOOKINGS",
          },
        });
      }

      // Soft delete - mark as inactive
      bus.status = "out_of_service";
      await bus.save();

      res.json({
        message: "Bus marked as out of service successfully",
      });
    } catch (error) {
      console.error("Delete bus error:", error);
      res.status(500).json({
        error: {
          message: "Failed to delete bus",
          code: "DELETE_BUS_ERROR",
        },
      });
    }
  },
);

module.exports = router;
