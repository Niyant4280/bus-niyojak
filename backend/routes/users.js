const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const {
  authenticateToken,
  requireOwnershipOrAdmin,
} = require("../middleware/auth");

const router = express.Router();

// Get user profile
router.get(
  "/:userId",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId)
        .select("-password")
        .populate("bookingHistory");

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      res.json({ user });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get user profile",
          code: "GET_USER_ERROR",
        },
      });
    }
  },
);

// Update user profile
router.put(
  "/:userId",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const allowedUpdates = [
        "name",
        "phone",
        "dateOfBirth",
        "gender",
        "address",
        "emergencyContact",
        "preferences",
        "profileImage",
      ];

      const updates = {};
      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      const user = await User.findByIdAndUpdate(req.params.userId, updates, {
        new: true,
        runValidators: true,
      }).select("-password");

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update user error:", error);

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
          message: "Failed to update profile",
          code: "UPDATE_USER_ERROR",
        },
      });
    }
  },
);

// Get user bookings
router.get(
  "/:userId/bookings",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      const query = { user: req.params.userId };

      if (status) {
        query.status = status;
      }

      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const bookings = await Booking.find(query)
        .populate("bus", "busNumber busType")
        .populate("route", "name origin destination")
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
      console.error("Get user bookings error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get user bookings",
          code: "GET_BOOKINGS_ERROR",
        },
      });
    }
  },
);

// Get user travel history with statistics
router.get(
  "/:userId/travel-history",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const { year, month } = req.query;

      // Build date filter
      let dateFilter = {};
      if (year) {
        const startDate = new Date(year, month ? month - 1 : 0, 1);
        const endDate = month
          ? new Date(year, month, 0)
          : new Date(parseInt(year) + 1, 0, 0);

        dateFilter = {
          "journey.date": {
            $gte: startDate,
            $lte: endDate,
          },
        };
      }

      // Get completed bookings
      const bookings = await Booking.find({
        user: userId,
        status: "completed",
        ...dateFilter,
      })
        .populate("bus", "busNumber busType operator")
        .populate("route", "name origin destination distance")
        .sort({ "journey.date": -1 });

      // Calculate statistics
      const stats = {
        totalTrips: bookings.length,
        totalAmount: bookings.reduce(
          (sum, booking) => sum + booking.pricing.totalAmount,
          0,
        ),
        totalDistance: bookings.reduce((sum, booking) => {
          return sum + (booking.route?.distance?.total || 0);
        }, 0),
        averageRating: 0,
        favoriteRoute: null,
        busTypesUsed: new Set(),
        monthlyStats: {},
      };

      // Calculate average rating
      const ratingsSum = bookings.reduce((sum, booking) => {
        if (booking.feedback?.rating) {
          return sum + booking.feedback.rating;
        }
        return sum;
      }, 0);

      const ratingsCount = bookings.filter((b) => b.feedback?.rating).length;
      stats.averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : 0;

      // Find favorite route
      const routeCounts = {};
      bookings.forEach((booking) => {
        if (booking.route) {
          const routeId = booking.route._id.toString();
          routeCounts[routeId] = (routeCounts[routeId] || 0) + 1;
        }
      });

      const mostUsedRouteId = Object.keys(routeCounts).reduce(
        (a, b) => (routeCounts[a] > routeCounts[b] ? a : b),
        null,
      );

      if (mostUsedRouteId) {
        stats.favoriteRoute = bookings.find(
          (b) => b.route._id.toString() === mostUsedRouteId,
        ).route;
      }

      // Collect bus types
      bookings.forEach((booking) => {
        if (booking.bus?.busType) {
          stats.busTypesUsed.add(booking.bus.busType);
        }
      });
      stats.busTypesUsed = Array.from(stats.busTypesUsed);

      // Monthly statistics
      bookings.forEach((booking) => {
        const month = booking.journey.date.toISOString().slice(0, 7); // YYYY-MM
        if (!stats.monthlyStats[month]) {
          stats.monthlyStats[month] = {
            trips: 0,
            amount: 0,
            distance: 0,
          };
        }
        stats.monthlyStats[month].trips += 1;
        stats.monthlyStats[month].amount += booking.pricing.totalAmount;
        stats.monthlyStats[month].distance +=
          booking.route?.distance?.total || 0;
      });

      res.json({
        bookings,
        statistics: stats,
      });
    } catch (error) {
      console.error("Get travel history error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get travel history",
          code: "GET_HISTORY_ERROR",
        },
      });
    }
  },
);

// Add/Remove saved route
router.post(
  "/:userId/saved-routes",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const { from, to, nickname } = req.body;

      if (!from || !to) {
        return res.status(400).json({
          error: {
            message: "From and to locations are required",
            code: "MISSING_LOCATIONS",
          },
        });
      }

      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      // Check if route already saved
      const existingRoute = user.savedRoutes.find(
        (route) =>
          route.from.toLowerCase() === from.toLowerCase() &&
          route.to.toLowerCase() === to.toLowerCase(),
      );

      if (existingRoute) {
        return res.status(409).json({
          error: {
            message: "Route already saved",
            code: "ROUTE_EXISTS",
          },
        });
      }

      user.savedRoutes.push({
        from: from.trim(),
        to: to.trim(),
        nickname: nickname ? nickname.trim() : `${from} to ${to}`,
        createdAt: new Date(),
      });

      await user.save();

      res.json({
        message: "Route saved successfully",
        savedRoutes: user.savedRoutes,
      });
    } catch (error) {
      console.error("Save route error:", error);
      res.status(500).json({
        error: {
          message: "Failed to save route",
          code: "SAVE_ROUTE_ERROR",
        },
      });
    }
  },
);

// Remove saved route
router.delete(
  "/:userId/saved-routes/:routeId",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      user.savedRoutes = user.savedRoutes.filter(
        (route) => route._id.toString() !== req.params.routeId,
      );

      await user.save();

      res.json({
        message: "Route removed successfully",
        savedRoutes: user.savedRoutes,
      });
    } catch (error) {
      console.error("Remove route error:", error);
      res.status(500).json({
        error: {
          message: "Failed to remove route",
          code: "REMOVE_ROUTE_ERROR",
        },
      });
    }
  },
);

// Update user preferences
router.put(
  "/:userId/preferences",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const { preferences } = req.body;

      if (!preferences) {
        return res.status(400).json({
          error: {
            message: "Preferences object is required",
            code: "MISSING_PREFERENCES",
          },
        });
      }

      const user = await User.findByIdAndUpdate(
        req.params.userId,
        { preferences },
        { new: true, runValidators: true },
      ).select("-password");

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      res.json({
        message: "Preferences updated successfully",
        preferences: user.preferences,
      });
    } catch (error) {
      console.error("Update preferences error:", error);
      res.status(500).json({
        error: {
          message: "Failed to update preferences",
          code: "UPDATE_PREFERENCES_ERROR",
        },
      });
    }
  },
);

// Get user dashboard data
router.get(
  "/:userId/dashboard",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const userId = req.params.userId;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      // Get upcoming bookings
      const upcomingBookings = await Booking.find({
        user: userId,
        status: { $in: ["confirmed", "pending"] },
        "journey.date": { $gte: now },
      })
        .populate("bus", "busNumber busType")
        .populate("route", "name origin destination")
        .sort({ "journey.date": 1 })
        .limit(5);

      // Get recent bookings
      const recentBookings = await Booking.find({
        user: userId,
        "journey.date": { $lt: now },
      })
        .populate("bus", "busNumber busType")
        .populate("route", "name origin destination")
        .sort({ "journey.date": -1 })
        .limit(5);

      // Calculate statistics
      const totalBookings = await Booking.countDocuments({ user: userId });
      const monthlyBookings = await Booking.countDocuments({
        user: userId,
        createdAt: { $gte: startOfMonth },
      });

      const yearlySpent = await Booking.aggregate([
        {
          $match: {
            user: require("mongoose").Types.ObjectId(userId),
            status: "completed",
            createdAt: { $gte: startOfYear },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$pricing.totalAmount" },
          },
        },
      ]);

      const user = await User.findById(userId).select(
        "loyaltyPoints savedRoutes",
      );

      const dashboardData = {
        user: {
          loyaltyPoints: user?.loyaltyPoints || 0,
          savedRoutesCount: user?.savedRoutes?.length || 0,
        },
        statistics: {
          totalBookings,
          monthlyBookings,
          yearlySpent: yearlySpent[0]?.total || 0,
          upcomingTrips: upcomingBookings.length,
        },
        upcomingBookings,
        recentBookings,
        quickStats: {
          thisMonth: monthlyBookings,
          thisYear: totalBookings,
          loyalty: user?.loyaltyPoints || 0,
        },
      };

      res.json(dashboardData);
    } catch (error) {
      console.error("Get dashboard error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get dashboard data",
          code: "DASHBOARD_ERROR",
        },
      });
    }
  },
);

// Delete user account
router.delete(
  "/:userId",
  authenticateToken,
  requireOwnershipOrAdmin,
  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);

      if (!user) {
        return res.status(404).json({
          error: {
            message: "User not found",
            code: "USER_NOT_FOUND",
          },
        });
      }

      // Check if user has active bookings
      const activeBookings = await Booking.countDocuments({
        user: req.params.userId,
        status: { $in: ["confirmed", "pending"] },
        "journey.date": { $gte: new Date() },
      });

      if (activeBookings > 0) {
        return res.status(400).json({
          error: {
            message: "Cannot delete account with active bookings",
            code: "HAS_ACTIVE_BOOKINGS",
          },
        });
      }

      // Soft delete by marking as inactive
      user.status = "inactive";
      user.email = `deleted_${Date.now()}_${user.email}`;
      user.phone = `deleted_${Date.now()}_${user.phone}`;

      await user.save();

      res.json({
        message: "Account deleted successfully",
      });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({
        error: {
          message: "Failed to delete account",
          code: "DELETE_USER_ERROR",
        },
      });
    }
  },
);

module.exports = router;
