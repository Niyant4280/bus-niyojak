const express = require("express");
const Route = require("../models/Route");
const Bus = require("../models/Bus");
const {
  authenticateToken,
  requireOperator,
  optionalAuth,
} = require("../middleware/auth");

const router = express.Router();

// Search routes (public)
router.get("/search", optionalAuth, async (req, res) => {
  try {
    const { from, to, date, passengers = 1, sortBy = "popularity" } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        error: {
          message: "Origin and destination are required",
          code: "MISSING_LOCATIONS",
        },
      });
    }

    // Find routes between cities
    const routes = await Route.findRoutes(from, to);

    if (routes.length === 0) {
      return res.json({
        routes: [],
        message: "No routes found between these locations",
      });
    }

    // Update search count for analytics
    routes.forEach((route) => {
      route.updatePopularity("search");
      route.save();
    });

    // Get buses for each route
    const routesWithBuses = await Promise.all(
      routes.map(async (route) => {
        const buses = await Bus.find({
          route: route._id,
          status: "active",
        })
          .populate("operator", "name email phone")
          .select("-seats.passengerInfo");

        // Calculate available seats for the date
        let availableBuses = [];
        if (date) {
          availableBuses = await Promise.all(
            buses.map(async (bus) => {
              const searchDate = new Date(date);
              const nextDay = new Date(searchDate);
              nextDay.setDate(nextDay.getDate() + 1);

              const bookedSeats = await require("../models/Booking")
                .find({
                  bus: bus._id,
                  status: { $in: ["confirmed", "pending"] },
                  "journey.date": { $gte: searchDate, $lt: nextDay },
                })
                .select("passengers.seatNumber");

              const bookedSeatNumbers = new Set();
              bookedSeats.forEach((booking) => {
                booking.passengers.forEach((passenger) => {
                  bookedSeatNumbers.add(passenger.seatNumber);
                });
              });

              const availableSeats =
                bus.capacity.total - bookedSeatNumbers.size;

              return {
                ...bus.toObject(),
                availableSeats,
                canAccommodate: availableSeats >= passengers,
              };
            }),
          );

          availableBuses = availableBuses.filter((bus) => bus.canAccommodate);
        } else {
          availableBuses = buses.map((bus) => ({
            ...bus.toObject(),
            availableSeats: bus.capacity.available,
            canAccommodate: bus.capacity.available >= passengers,
          }));
        }

        return {
          ...route.toObject(),
          buses: availableBuses,
          hasBuses: availableBuses.length > 0,
        };
      }),
    );

    // Filter routes that have available buses
    const availableRoutes = routesWithBuses.filter((route) => route.hasBuses);

    // Sort routes
    switch (sortBy) {
      case "price":
        availableRoutes.sort(
          (a, b) => a.pricing.basePrice - b.pricing.basePrice,
        );
        break;
      case "duration":
        availableRoutes.sort(
          (a, b) => a.duration.estimated - b.duration.estimated,
        );
        break;
      case "rating":
        availableRoutes.sort(
          (a, b) => b.popularity.rating.average - a.popularity.rating.average,
        );
        break;
      case "popularity":
      default:
        availableRoutes.sort(
          (a, b) => b.popularity.bookingCount - a.popularity.bookingCount,
        );
        break;
    }

    res.json({
      routes: availableRoutes,
      totalFound: availableRoutes.length,
      searchCriteria: { from, to, date, passengers },
    });
  } catch (error) {
    console.error("Route search error:", error);
    res.status(500).json({
      error: {
        message: "Failed to search routes",
        code: "ROUTE_SEARCH_ERROR",
      },
    });
  }
});

// Get all routes
router.get("/", optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "active",
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { status };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { "origin.name": { $regex: search, $options: "i" } },
        { "destination.name": { $regex: search, $options: "i" } },
        { routeNumber: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const routes = await Route.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Route.countDocuments(query);

    res.json({
      routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get routes error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get routes",
        code: "GET_ROUTES_ERROR",
      },
    });
  }
});

// Get popular routes
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularRoutes = await Route.getPopularRoutes(parseInt(limit));

    res.json({
      routes: popularRoutes,
    });
  } catch (error) {
    console.error("Get popular routes error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get popular routes",
        code: "GET_POPULAR_ROUTES_ERROR",
      },
    });
  }
});

// Get single route details
router.get("/:routeId", async (req, res) => {
  try {
    const route = await Route.findById(req.params.routeId);

    if (!route) {
      return res.status(404).json({
        error: {
          message: "Route not found",
          code: "ROUTE_NOT_FOUND",
        },
      });
    }

    // Get buses operating on this route
    const buses = await Bus.find({
      route: req.params.routeId,
      status: "active",
    })
      .populate("operator", "name email phone")
      .select("-seats.passengerInfo");

    res.json({
      route,
      buses,
      busCount: buses.length,
    });
  } catch (error) {
    console.error("Get route error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get route details",
        code: "GET_ROUTE_ERROR",
      },
    });
  }
});

// Create new route (operators and admins only)
router.post("/", authenticateToken, requireOperator, async (req, res) => {
  try {
    const routeData = req.body;

    // Validate required fields
    const requiredFields = [
      "routeNumber",
      "name",
      "origin",
      "destination",
      "distance",
      "duration",
      "pricing",
      "operatingHours",
    ];
    const missingFields = requiredFields.filter((field) => !routeData[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: {
          message: `Missing required fields: ${missingFields.join(", ")}`,
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    // Check if route number already exists
    const existingRoute = await Route.findOne({
      routeNumber: routeData.routeNumber.toUpperCase(),
    });
    if (existingRoute) {
      return res.status(409).json({
        error: {
          message: "Route with this number already exists",
          code: "ROUTE_NUMBER_EXISTS",
        },
      });
    }

    const route = new Route(routeData);
    await route.save();

    res.status(201).json({
      message: "Route created successfully",
      route,
    });
  } catch (error) {
    console.error("Create route error:", error);

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
          message: "Route number already exists",
          code: "DUPLICATE_ROUTE_NUMBER",
        },
      });
    }

    res.status(500).json({
      error: {
        message: "Failed to create route",
        code: "CREATE_ROUTE_ERROR",
      },
    });
  }
});

// Update route
router.put(
  "/:routeId",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const route = await Route.findById(req.params.routeId);

      if (!route) {
        return res.status(404).json({
          error: {
            message: "Route not found",
            code: "ROUTE_NOT_FOUND",
          },
        });
      }

      // Check if there are active bookings
      const activeBuses = await Bus.find({
        route: req.params.routeId,
        status: "active",
      });
      const busIds = activeBuses.map((bus) => bus._id);

      const activeBookings = await require("../models/Booking").countDocuments({
        bus: { $in: busIds },
        status: { $in: ["confirmed", "pending"] },
        "journey.date": { $gte: new Date() },
      });

      if (activeBookings > 0) {
        const restrictedFields = [
          "origin",
          "destination",
          "distance",
          "duration",
        ];
        const updatingRestricted = restrictedFields.some(
          (field) => req.body[field] !== undefined,
        );

        if (updatingRestricted) {
          return res.status(400).json({
            error: {
              message: "Cannot update core route details with active bookings",
              code: "HAS_ACTIVE_BOOKINGS",
            },
          });
        }
      }

      // Update route
      Object.keys(req.body).forEach((key) => {
        route[key] = req.body[key];
      });

      await route.save();

      res.json({
        message: "Route updated successfully",
        route,
      });
    } catch (error) {
      console.error("Update route error:", error);

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
          message: "Failed to update route",
          code: "UPDATE_ROUTE_ERROR",
        },
      });
    }
  },
);

// Add route rating
router.post("/:routeId/rating", authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: {
          message: "Rating must be between 1 and 5",
          code: "INVALID_RATING",
        },
      });
    }

    const route = await Route.findById(req.params.routeId);

    if (!route) {
      return res.status(404).json({
        error: {
          message: "Route not found",
          code: "ROUTE_NOT_FOUND",
        },
      });
    }

    // Check if user has completed a trip on this route
    const completedBooking = await require("../models/Booking").findOne({
      user: req.user._id,
      route: req.params.routeId,
      status: "completed",
    });

    if (!completedBooking) {
      return res.status(403).json({
        error: {
          message: "You can only rate routes you have traveled on",
          code: "NO_COMPLETED_BOOKING",
        },
      });
    }

    route.addRating(rating);
    await route.save();

    res.json({
      message: "Rating added successfully",
      newAverage: route.popularity.rating.average,
      totalRatings: route.popularity.rating.count,
    });
  } catch (error) {
    console.error("Add rating error:", error);
    res.status(500).json({
      error: {
        message: "Failed to add rating",
        code: "ADD_RATING_ERROR",
      },
    });
  }
});

// Get route schedules and next departures
router.get("/:routeId/schedules", async (req, res) => {
  try {
    const { date } = req.query;

    const route = await Route.findById(req.params.routeId);

    if (!route) {
      return res.status(404).json({
        error: {
          message: "Route not found",
          code: "ROUTE_NOT_FOUND",
        },
      });
    }

    // Get buses operating on this route
    const buses = await Bus.find({
      route: req.params.routeId,
      status: "active",
    })
      .populate("operator", "name phone")
      .select("busNumber busType schedule pricing capacity");

    // Generate schedule for the date
    const schedules = [];
    const targetDate = date ? new Date(date) : new Date();

    buses.forEach((bus) => {
      // Use route operating hours or bus schedule
      const startTime =
        bus.schedule?.departureTime || route.operatingHours.start;
      const frequency = route.operatingHours.frequency;
      const endTime = bus.schedule?.arrivalTime || route.operatingHours.end;

      const [startHour, startMinute] = startTime.split(":").map(Number);
      const [endHour, endMinute] = endTime.split(":").map(Number);

      let currentTime = startHour * 60 + startMinute;
      const endTimeMinutes = endHour * 60 + endMinute;

      while (currentTime <= endTimeMinutes) {
        const hour = Math.floor(currentTime / 60);
        const minute = currentTime % 60;
        const departureTime = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

        schedules.push({
          bus: {
            id: bus._id,
            busNumber: bus.busNumber,
            busType: bus.busType,
            operator: bus.operator,
          },
          departureTime,
          estimatedArrival: route.getNextDeparture(
            new Date(
              targetDate.getTime() + route.duration.estimated * 60 * 1000,
            ),
          ),
          price: bus.pricing?.basePrice || route.pricing.basePrice,
          availableSeats: bus.capacity.available,
        });

        currentTime += frequency;
      }
    });

    // Sort by departure time
    schedules.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

    res.json({
      route: {
        id: route._id,
        name: route.name,
        origin: route.origin,
        destination: route.destination,
        duration: route.duration,
        distance: route.distance,
      },
      date: targetDate.toISOString().split("T")[0],
      schedules,
      totalDepartures: schedules.length,
    });
  } catch (error) {
    console.error("Get schedules error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get route schedules",
        code: "GET_SCHEDULES_ERROR",
      },
    });
  }
});

// Get route analytics (operators and admins only)
router.get(
  "/:routeId/analytics",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const { period = "month", year = new Date().getFullYear() } = req.query;

      const route = await Route.findById(req.params.routeId);

      if (!route) {
        return res.status(404).json({
          error: {
            message: "Route not found",
            code: "ROUTE_NOT_FOUND",
          },
        });
      }

      // Get buses on this route
      const buses = await Bus.find({ route: req.params.routeId });
      const busIds = buses.map((bus) => bus._id);

      // Build date range
      let startDate, endDate;
      if (period === "month") {
        startDate = new Date(year, 0, 1);
        endDate = new Date(parseInt(year) + 1, 0, 1);
      } else {
        startDate = new Date(year, new Date().getMonth(), 1);
        endDate = new Date(year, new Date().getMonth() + 1, 1);
      }

      // Get booking analytics
      const bookingStats = await require("../models/Booking").aggregate([
        {
          $match: {
            bus: { $in: busIds },
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id:
              period === "month"
                ? { $month: "$createdAt" }
                : { $dayOfMonth: "$createdAt" },
            bookings: { $sum: 1 },
            revenue: { $sum: "$pricing.totalAmount" },
            passengers: { $sum: { $size: "$passengers" } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Calculate occupancy rate
      const totalCapacity = buses.reduce(
        (sum, bus) => sum + bus.capacity.total,
        0,
      );
      const totalPassengers = bookingStats.reduce(
        (sum, stat) => sum + stat.passengers,
        0,
      );
      const occupancyRate =
        totalCapacity > 0 ? (totalPassengers / totalCapacity) * 100 : 0;

      res.json({
        route: {
          id: route._id,
          name: route.name,
          routeNumber: route.routeNumber,
        },
        analytics: {
          bookingStats,
          summary: {
            totalBookings: bookingStats.reduce(
              (sum, stat) => sum + stat.bookings,
              0,
            ),
            totalRevenue: bookingStats.reduce(
              (sum, stat) => sum + stat.revenue,
              0,
            ),
            totalPassengers,
            occupancyRate: Math.round(occupancyRate),
            averageRating: route.popularity.rating.average,
          },
          period,
          year,
        },
      });
    } catch (error) {
      console.error("Route analytics error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get route analytics",
          code: "ROUTE_ANALYTICS_ERROR",
        },
      });
    }
  },
);

// Delete route (soft delete - mark as inactive)
router.delete(
  "/:routeId",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const route = await Route.findById(req.params.routeId);

      if (!route) {
        return res.status(404).json({
          error: {
            message: "Route not found",
            code: "ROUTE_NOT_FOUND",
          },
        });
      }

      // Check for active buses
      const activeBuses = await Bus.countDocuments({
        route: req.params.routeId,
        status: "active",
      });

      if (activeBuses > 0) {
        return res.status(400).json({
          error: {
            message: "Cannot delete route with active buses",
            code: "HAS_ACTIVE_BUSES",
          },
        });
      }

      // Soft delete - mark as inactive
      route.status = "inactive";
      await route.save();

      res.json({
        message: "Route marked as inactive successfully",
      });
    } catch (error) {
      console.error("Delete route error:", error);
      res.status(500).json({
        error: {
          message: "Failed to delete route",
          code: "DELETE_ROUTE_ERROR",
        },
      });
    }
  },
);

module.exports = router;
