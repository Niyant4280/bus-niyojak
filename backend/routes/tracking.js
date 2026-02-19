const express = require("express");
const Bus = require("../models/Bus");
const Booking = require("../models/Booking");
const {
  authenticateToken,
  requireOperator,
  optionalAuth,
} = require("../middleware/auth");

const router = express.Router();

// Get real-time bus location (public with optional auth)
router.get("/bus/:busId/location", optionalAuth, async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.busId)
      .select("busNumber currentLocation status trackingEnabled")
      .populate("route", "name origin destination");

    if (!bus) {
      return res.status(404).json({
        error: {
          message: "Bus not found",
          code: "BUS_NOT_FOUND",
        },
      });
    }

    if (!bus.trackingEnabled) {
      return res.status(403).json({
        error: {
          message: "Tracking not enabled for this bus",
          code: "TRACKING_DISABLED",
        },
      });
    }

    // Check if location is recent (within last 10 minutes)
    const now = new Date();
    const locationAge = now - new Date(bus.currentLocation.lastUpdated);
    const isLocationFresh = locationAge < 10 * 60 * 1000; // 10 minutes

    res.json({
      bus: {
        id: bus._id,
        busNumber: bus.busNumber,
        route: bus.route,
        status: bus.status,
      },
      location: {
        latitude: bus.currentLocation.latitude,
        longitude: bus.currentLocation.longitude,
        address: bus.currentLocation.address,
        lastUpdated: bus.currentLocation.lastUpdated,
        isLive: isLocationFresh,
        accuracy: isLocationFresh ? "high" : "low",
      },
      tracking: {
        enabled: bus.trackingEnabled,
        lastSeen: bus.currentLocation.lastUpdated,
      },
    });
  } catch (error) {
    console.error("Get bus location error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get bus location",
        code: "GET_LOCATION_ERROR",
      },
    });
  }
});

// Update bus location (operators only)
router.put(
  "/bus/:busId/location",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { latitude, longitude, address, speed, heading } = req.body;

      if (!latitude || !longitude) {
        return res.status(400).json({
          error: {
            message: "Latitude and longitude are required",
            code: "MISSING_COORDINATES",
          },
        });
      }

      // Validate coordinates
      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return res.status(400).json({
          error: {
            message: "Invalid coordinates",
            code: "INVALID_COORDINATES",
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

      // Update location
      const previousLocation = bus.currentLocation;
      bus.currentLocation = {
        latitude,
        longitude,
        address: address || previousLocation.address,
        lastUpdated: new Date(),
        speed: speed || 0,
        heading: heading || 0,
      };

      // Calculate distance traveled if previous location exists
      if (previousLocation.latitude && previousLocation.longitude) {
        const distance = calculateDistance(
          previousLocation.latitude,
          previousLocation.longitude,
          latitude,
          longitude,
        );

        // Update total distance traveled
        bus.analytics.totalDistance += distance;
      }

      await bus.save();

      res.json({
        message: "Location updated successfully",
        location: bus.currentLocation,
        tracking: {
          enabled: bus.trackingEnabled,
          lastUpdated: bus.currentLocation.lastUpdated,
        },
      });
    } catch (error) {
      console.error("Update location error:", error);
      res.status(500).json({
        error: {
          message: "Failed to update location",
          code: "UPDATE_LOCATION_ERROR",
        },
      });
    }
  },
);

// Get trip tracking for booking
router.get("/booking/:bookingId/track", authenticateToken, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("bus", "busNumber currentLocation trackingEnabled status")
      .populate(
        "route",
        "name origin destination intermediateStops distance duration",
      )
      .populate("user", "name phone");

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
          message: "Can only track confirmed bookings",
          code: "BOOKING_NOT_CONFIRMED",
        },
      });
    }

    // Calculate trip progress
    const now = new Date();
    const journeyDate = new Date(booking.journey.date);
    const [depHour, depMinute] = booking.journey.departureTime
      .split(":")
      .map(Number);
    const departureDateTime = new Date(journeyDate);
    departureDateTime.setHours(depHour, depMinute, 0, 0);

    const estimatedArrivalTime = new Date(
      departureDateTime.getTime() +
        booking.route.duration.estimated * 60 * 1000,
    );

    let tripStatus = "scheduled";
    let progress = 0;

    if (now < departureDateTime) {
      tripStatus = "scheduled";
      progress = 0;
    } else if (now >= departureDateTime && now < estimatedArrivalTime) {
      tripStatus = "in_transit";
      const elapsed = now - departureDateTime;
      const totalDuration = estimatedArrivalTime - departureDateTime;
      progress = Math.min(Math.round((elapsed / totalDuration) * 100), 95);
    } else {
      tripStatus = booking.status === "completed" ? "completed" : "delayed";
      progress = booking.status === "completed" ? 100 : 95;
    }

    // Get current location if tracking enabled
    let currentLocation = null;
    if (booking.bus.trackingEnabled && booking.bus.currentLocation.latitude) {
      const locationAge =
        now - new Date(booking.bus.currentLocation.lastUpdated);
      const isLocationFresh = locationAge < 15 * 60 * 1000; // 15 minutes

      if (isLocationFresh) {
        currentLocation = {
          latitude: booking.bus.currentLocation.latitude,
          longitude: booking.bus.currentLocation.longitude,
          address: booking.bus.currentLocation.address,
          lastUpdated: booking.bus.currentLocation.lastUpdated,
          accuracy: locationAge < 5 * 60 * 1000 ? "high" : "medium",
        };
      }
    }

    // Estimate time to destination
    let estimatedArrival = null;
    if (tripStatus === "in_transit" && currentLocation) {
      const remainingTime = estimatedArrivalTime - now;
      estimatedArrival = new Date(now.getTime() + Math.max(remainingTime, 0));
    }

    res.json({
      booking: {
        id: booking._id,
        bookingNumber: booking.bookingNumber,
        status: booking.status,
      },
      trip: {
        status: tripStatus,
        progress,
        departureTime: departureDateTime,
        estimatedArrival: estimatedArrival || estimatedArrivalTime,
        actualDeparture: booking.journey.actualDepartureTime,
        actualArrival: booking.journey.actualArrivalTime,
      },
      bus: {
        number: booking.bus.busNumber,
        status: booking.bus.status,
        currentLocation,
        trackingEnabled: booking.bus.trackingEnabled,
      },
      route: {
        name: booking.route.name,
        origin: booking.route.origin,
        destination: booking.route.destination,
        distance: booking.route.distance,
        stops: booking.route.intermediateStops,
      },
      passenger: {
        name: booking.user.name,
        phone: booking.user.phone,
        seats: booking.passengers.map((p) => p.seatNumber),
      },
    });
  } catch (error) {
    console.error("Track booking error:", error);
    res.status(500).json({
      error: {
        message: "Failed to track booking",
        code: "TRACK_BOOKING_ERROR",
      },
    });
  }
});

// Get all tracked buses in area (public)
router.get("/buses/nearby", optionalAuth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 50 } = req.query; // radius in km

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: {
          message: "Latitude and longitude are required",
          code: "MISSING_COORDINATES",
        },
      });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);
    const rad = parseFloat(radius);

    // Find buses within radius (using simple bounding box for performance)
    const latDelta = rad / 111; // Rough conversion: 1 degree ≈ 111 km
    const lonDelta = rad / (111 * Math.cos((lat * Math.PI) / 180));

    const buses = await Bus.find({
      status: "active",
      trackingEnabled: true,
      "currentLocation.latitude": {
        $gte: lat - latDelta,
        $lte: lat + latDelta,
      },
      "currentLocation.longitude": {
        $gte: lon - lonDelta,
        $lte: lon + lonDelta,
      },
      "currentLocation.lastUpdated": {
        $gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
      },
    })
      .populate("route", "name origin destination")
      .populate("operator", "name phone")
      .select("busNumber busType currentLocation route operator");

    // Calculate exact distances and filter
    const nearbyBuses = buses
      .map((bus) => {
        const distance = calculateDistance(
          lat,
          lon,
          bus.currentLocation.latitude,
          bus.currentLocation.longitude,
        );

        return {
          ...bus.toObject(),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      })
      .filter((bus) => bus.distance <= rad)
      .sort((a, b) => a.distance - b.distance);

    res.json({
      location: { latitude: lat, longitude: lon },
      radius: rad,
      buses: nearbyBuses,
      count: nearbyBuses.length,
    });
  } catch (error) {
    console.error("Get nearby buses error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get nearby buses",
        code: "GET_NEARBY_BUSES_ERROR",
      },
    });
  }
});

// Toggle bus tracking
router.put(
  "/bus/:busId/tracking",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { enabled } = req.body;

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

      bus.trackingEnabled = enabled;
      await bus.save();

      res.json({
        message: `Tracking ${enabled ? "enabled" : "disabled"} successfully`,
        trackingEnabled: bus.trackingEnabled,
      });
    } catch (error) {
      console.error("Toggle tracking error:", error);
      res.status(500).json({
        error: {
          message: "Failed to toggle tracking",
          code: "TOGGLE_TRACKING_ERROR",
        },
      });
    }
  },
);

// Get tracking history for bus (operators only)
router.get(
  "/bus/:busId/history",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { date, limit = 100 } = req.query;

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

      // In a real app, you'd store location history in a separate collection
      // For now, return mock data or implement a proper tracking history system
      res.json({
        message: "Tracking history feature coming soon",
        bus: {
          id: bus._id,
          busNumber: bus.busNumber,
        },
        currentLocation: bus.currentLocation,
        note: "Implement location history tracking in production",
      });
    } catch (error) {
      console.error("Get tracking history error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get tracking history",
          code: "GET_TRACKING_HISTORY_ERROR",
        },
      });
    }
  },
);

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

module.exports = router;
