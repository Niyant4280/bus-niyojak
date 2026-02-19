const express = require("express");
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const User = require("../models/User");
const { authenticateToken, requireOperator } = require("../middleware/auth");

const router = express.Router();

// Create new booking
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      busId,
      routeId,
      passengers,
      journey,
      contact,
      payment,
      specialRequests,
    } = req.body;

    // Validation
    if (!busId || !routeId || !passengers || !journey || !contact) {
      return res.status(400).json({
        error: {
          message:
            "Bus, route, passengers, journey details, and contact are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    if (!passengers.length || passengers.length > 6) {
      return res.status(400).json({
        error: {
          message: "Must have 1-6 passengers per booking",
          code: "INVALID_PASSENGER_COUNT",
        },
      });
    }

    // Verify bus and route exist
    const bus = await Bus.findById(busId).populate("route");
    const route = await Route.findById(routeId);

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    if (!route) {
      return res.status(404).json({
        error: {
          message: "Route not found",
          code: "ROUTE_NOT_FOUND",
        },
      });
    }

    if (bus.status !== "active") {
      return res.status(400).json({
        error: {
          message: "Bus is not available for booking",
          code: "BUS_NOT_AVAILABLE",
        },
      });
    }

    // Check seat availability
    const journeyDate = new Date(journey.date);
    const nextDay = new Date(journeyDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const existingBookings = await Booking.find({
      bus: busId,
      status: { $in: ["confirmed", "pending"] },
      "journey.date": { $gte: journeyDate, $lt: nextDay },
      "journey.departureTime": journey.departureTime,
    });

    const bookedSeats = new Set();
    existingBookings.forEach((booking) => {
      booking.passengers.forEach((passenger) => {
        bookedSeats.add(passenger.seatNumber);
      });
    });

    // Check if requested seats are available
    const requestedSeats = passengers.map((p) => p.seatNumber);
    const unavailableSeats = requestedSeats.filter((seat) =>
      bookedSeats.has(seat),
    );

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        error: {
          message: `Seats ${unavailableSeats.join(", ")} are not available`,
          code: "SEATS_NOT_AVAILABLE",
          unavailableSeats,
        },
      });
    }

    // Validate seat numbers exist on bus
    const validSeats = bus.seats.map((seat) => seat.seatNumber);
    const invalidSeats = requestedSeats.filter(
      (seat) => !validSeats.includes(seat),
    );

    if (invalidSeats.length > 0) {
      return res.status(400).json({
        error: {
          message: `Invalid seat numbers: ${invalidSeats.join(", ")}`,
          code: "INVALID_SEATS",
          invalidSeats,
        },
      });
    }

    // Calculate pricing
    const basePrice = route.pricing.basePrice;
    const totalBasePrice = basePrice * passengers.length;
    const taxes = Math.round(totalBasePrice * 0.13); // 13% VAT
    const totalAmount = totalBasePrice + taxes;

    // Create booking
    const booking = new Booking({
      user: req.user._id,
      bus: busId,
      route: routeId,
      passengers: passengers.map((passenger) => ({
        ...passenger,
        ticketType:
          passenger.age < 12
            ? "child"
            : passenger.age > 60
              ? "senior"
              : "adult",
      })),
      journey: {
        ...journey,
        date: journeyDate,
        estimatedArrivalTime: route.getNextDeparture(
          new Date(
            journeyDate.getTime() + route.duration.estimated * 60 * 1000,
          ),
        ),
      },
      pricing: {
        basePrice: totalBasePrice,
        taxes,
        totalAmount,
        discounts: { amount: 0 },
      },
      payment: {
        method: payment?.method || "cash",
        status: "pending",
      },
      contact,
      specialRequests: specialRequests || [],
      status: "pending",
    });

    await booking.save();

    // Update route popularity
    route.updatePopularity("booking");
    await route.save();

    // Populate booking for response
    await booking.populate("bus", "busNumber busType operator");
    await booking.populate("route", "name origin destination duration");
    await booking.populate("user", "name email phone");

    res.status(201).json({
      message: "Booking created successfully",
      booking,
      paymentRequired: true,
    });
  } catch (error) {
    console.error("Create booking error:", error);

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
        message: "Failed to create booking",
        code: "CREATE_BOOKING_ERROR",
      },
    });
  }
});

// Get user bookings
router.get("/my-bookings", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate("bus", "busNumber busType operator")
      .populate("route", "name origin destination duration distance")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get my bookings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get bookings",
        code: "GET_BOOKINGS_ERROR",
      },
    });
  }
});

// Get single booking details
router.get("/:bookingId", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "name email phone")
      .populate("bus", "busNumber busType operator amenities")
      .populate(
        "route",
        "name origin destination duration distance intermediateStops",
      );

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    // Check ownership or admin access
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: {
          message: "Access denied",
          code: "ACCESS_DENIED",
        },
      });
    }

    res.json({ booking });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get booking details",
        code: "GET_BOOKING_ERROR",
      },
    });
  }
});

// Update booking payment status
router.put("/:bookingId/payment", authenticateToken, async (req, res) => {
  try {
    const { paymentMethod, transactionId, gateway } = req.body;

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Access denied",
          code: "ACCESS_DENIED",
        },
      });
    }

    if (booking.payment.status === "completed") {
      return res.status(400).json({
        error: {
          message: "Payment already completed",
          code: "PAYMENT_ALREADY_COMPLETED",
        },
      });
    }

    // Update payment details
    booking.payment.method = paymentMethod;
    booking.payment.status = "completed";
    booking.payment.transactionId = transactionId;
    booking.payment.gateway = gateway;
    booking.payment.paymentDate = new Date();
    booking.payment.paidAmount = booking.pricing.totalAmount;
    booking.status = "confirmed";

    await booking.save();

    // Update user loyalty points
    const user = await User.findById(req.user._id);
    user.loyaltyPoints += booking.loyaltyPoints.earned;
    await user.save();

    res.json({
      message: "Payment completed successfully",
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
        payment: booking.payment,
      },
    });
  } catch (error) {
    console.error("Update payment error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update payment",
        code: "UPDATE_PAYMENT_ERROR",
      },
    });
  }
});

// Cancel booking
router.put("/:bookingId/cancel", authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    // Check ownership or admin access
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: {
          message: "Access denied",
          code: "ACCESS_DENIED",
        },
      });
    }

    // Check if cancellation is allowed
    const cancellationCheck = booking.canCancel();
    if (!cancellationCheck.allowed) {
      return res.status(400).json({
        error: {
          message: cancellationCheck.reason,
          code: "CANCELLATION_NOT_ALLOWED",
        },
      });
    }

    // Cancel booking
    const cancelledBy = req.user.role === "admin" ? "admin" : "user";
    booking.cancel(reason || "Cancelled by user", cancelledBy);
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
      cancellation: {
        cancelledAt: booking.cancellation.cancelledAt,
        refundEligible: booking.cancellation.refundEligible,
        refundAmount: booking.refundableAmount,
        cancellationFee: booking.cancellation.cancellationFee,
      },
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      error: {
        message: "Failed to cancel booking",
        code: "CANCEL_BOOKING_ERROR",
      },
    });
  }
});

// Check-in passenger
router.put(
  "/:bookingId/checkin",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { location } = req.body;

      const booking = await Booking.findById(req.params.bookingId).populate(
        "bus",
        "operator",
      );

      if (!booking) {
        return res.status(404).json({
          error: {
            message: "Booking not found",
            code: "BOOKING_NOT_FOUND",
          },
        });
      }

      // Check if user is the bus operator or admin
      if (
        req.user.role !== "admin" &&
        booking.bus.operator.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: {
            message: "Access denied - not your bus",
            code: "ACCESS_DENIED",
          },
        });
      }

      booking.checkIn(location, req.user.name || req.user.email);
      await booking.save();

      res.json({
        message: "Passenger checked in successfully",
        checkIn: booking.checkInDetails,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      res.status(500).json({
        error: {
          message: "Failed to check in passenger",
          code: "CHECKIN_ERROR",
        },
      });
    }
  },
);

// Add feedback and rating
router.post("/:bookingId/feedback", authenticateToken, async (req, res) => {
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

    const booking = await Booking.findById(req.params.bookingId)
      .populate("bus")
      .populate("route");

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    // Check ownership
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: {
          message: "Access denied",
          code: "ACCESS_DENIED",
        },
      });
    }

    booking.addFeedback(rating, comment, aspects);
    await booking.save();

    // Update bus rating
    if (booking.bus) {
      booking.bus.updateRating(rating);
      await booking.bus.save();
    }

    // Update route rating
    if (booking.route) {
      booking.route.addRating(rating);
      await booking.route.save();
    }

    res.json({
      message: "Feedback added successfully",
      feedback: booking.feedback,
    });
  } catch (error) {
    console.error("Add feedback error:", error);
    res.status(500).json({
      error: {
        message: "Failed to add feedback",
        code: "ADD_FEEDBACK_ERROR",
      },
    });
  }
});

// Get booking statistics
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const stats = await Booking.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "completed"] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
          thisMonthBookings: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfMonth] }, 1, 0],
            },
          },
          thisYearBookings: {
            $sum: {
              $cond: [{ $gte: ["$createdAt", startOfYear] }, 1, 0],
            },
          },
          completedTrips: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
          cancelledBookings: {
            $sum: {
              $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0],
            },
          },
        },
      },
    ]);

    const userStats = stats[0] || {
      totalBookings: 0,
      totalSpent: 0,
      thisMonthBookings: 0,
      thisYearBookings: 0,
      completedTrips: 0,
      cancelledBookings: 0,
    };

    // Get user's loyalty points
    const user = await User.findById(userId).select("loyaltyPoints");

    res.json({
      statistics: {
        ...userStats,
        loyaltyPoints: user?.loyaltyPoints || 0,
        averageSpentPerBooking:
          userStats.totalBookings > 0
            ? Math.round(userStats.totalSpent / userStats.totalBookings)
            : 0,
      },
    });
  } catch (error) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get booking statistics",
        code: "GET_STATS_ERROR",
      },
    });
  }
});

// Generate booking ticket/receipt
router.get("/:bookingId/ticket", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("user", "name email phone")
      .populate("bus", "busNumber busType operator amenities")
      .populate("route", "name origin destination duration distance");

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    // Check ownership
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        error: {
          message: "Access denied",
          code: "ACCESS_DENIED",
        },
      });
    }

    if (booking.status !== "confirmed") {
      return res.status(400).json({
        error: {
          message: "Ticket only available for confirmed bookings",
          code: "BOOKING_NOT_CONFIRMED",
        },
      });
    }

    // Generate ticket data
    const ticket = {
      bookingNumber: booking.bookingNumber,
      issueDate: booking.createdAt,
      passenger: booking.user,
      journey: {
        from: booking.route.origin.name,
        to: booking.route.destination.name,
        date: booking.journey.date,
        departureTime: booking.journey.departureTime,
        estimatedArrival: booking.journey.estimatedArrivalTime,
      },
      bus: {
        number: booking.bus.busNumber,
        type: booking.bus.busType,
        operator: booking.bus.operator,
      },
      passengers: booking.passengers,
      pricing: booking.pricing,
      contact: booking.contact,
      qrCode: `BN${booking._id}${booking.bookingNumber}`, // Simple QR code data
      terms: [
        "Passengers must arrive 30 minutes before departure",
        "Valid ID required for travel",
        "Seat numbers are fixed and cannot be changed",
        "Refund policy applies as per booking terms",
      ],
    };

    res.json({ ticket });
  } catch (error) {
    console.error("Generate ticket error:", error);
    res.status(500).json({
      error: {
        message: "Failed to generate ticket",
        code: "GENERATE_TICKET_ERROR",
      },
    });
  }
});

module.exports = router;
