const express = require("express");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Admin Dashboard Statistics
router.get("/dashboard", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // User statistics
    const totalUsers = await User.countDocuments({ role: "user" });
    const activeUsers = await User.countDocuments({
      role: "user",
      status: "active",
    });
    const newUsersToday = await User.countDocuments({
      role: "user",
      createdAt: { $gte: startOfDay },
    });
    const newUsersThisMonth = await User.countDocuments({
      role: "user",
      createdAt: { $gte: startOfMonth },
    });

    // Bus statistics
    const totalBuses = await Bus.countDocuments();
    const activeBuses = await Bus.countDocuments({ status: "active" });
    const busesInMaintenance = await Bus.countDocuments({
      status: "maintenance",
    });

    // Route statistics
    const totalRoutes = await Route.countDocuments();
    const activeRoutes = await Route.countDocuments({ status: "active" });

    // Booking statistics
    const totalBookings = await Booking.countDocuments();
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: startOfDay },
    });
    const confirmedBookings = await Booking.countDocuments({
      status: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    // Revenue statistics
    const revenueStats = await Booking.aggregate([
      {
        $match: {
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.totalAmount" },
          monthlyRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfMonth] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
          weeklyRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfWeek] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
          dailyRevenue: {
            $sum: {
              $cond: [
                { $gte: ["$createdAt", startOfDay] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const revenue = revenueStats[0] || {
      totalRevenue: 0,
      monthlyRevenue: 0,
      weeklyRevenue: 0,
      dailyRevenue: 0,
    };

    // Recent activity
    const recentUsers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email phone createdAt status");

    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("bus", "busNumber busType")
      .populate("route", "name origin destination")
      .sort({ createdAt: -1 })
      .limit(10);

    // Popular routes
    const popularRoutes = await Route.find({ status: "active" })
      .sort({ "popularity.bookingCount": -1 })
      .limit(5)
      .select("name origin destination popularity");

    // System health
    const systemHealth = {
      database: "connected",
      totalUsers,
      totalBuses,
      totalRoutes,
      activeBookings: confirmedBookings,
      uptime: process.uptime(),
    };

    res.json({
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          newToday: newUsersToday,
          newThisMonth: newUsersThisMonth,
        },
        buses: {
          total: totalBuses,
          active: activeBuses,
          maintenance: busesInMaintenance,
        },
        routes: {
          total: totalRoutes,
          active: activeRoutes,
        },
        bookings: {
          total: totalBookings,
          today: todayBookings,
          confirmed: confirmedBookings,
          cancelled: cancelledBookings,
        },
        revenue,
      },
      recentActivity: {
        users: recentUsers,
        bookings: recentBookings,
      },
      popularRoutes,
      systemHealth,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get dashboard data",
        code: "DASHBOARD_ERROR",
      },
    });
  }
});

// User Management
router.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (role) query.role = role;

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const users = await User.find(query)
      .select("-password")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get users",
        code: "GET_USERS_ERROR",
      },
    });
  }
});

// Update user status/role
router.put("/users/:userId", async (req, res) => {
  try {
    const { status, role } = req.body;
    const updates = {};

    if (status) updates.status = status;
    if (role) updates.role = role;

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
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update user",
        code: "UPDATE_USER_ERROR",
      },
    });
  }
});

// Delete user
router.delete("/users/:userId", async (req, res) => {
  try {
    // Check if user has active bookings
    const activeBookings = await Booking.countDocuments({
      user: req.params.userId,
      status: { $in: ["confirmed", "pending"] },
      "journey.date": { $gte: new Date() },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        error: {
          message: "Cannot delete user with active bookings",
          code: "HAS_ACTIVE_BOOKINGS",
        },
      });
    }

    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      error: {
        message: "Failed to delete user",
        code: "DELETE_USER_ERROR",
      },
    });
  }
});

// Booking Management
router.get("/bookings", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      date,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query["journey.date"] = {
        $gte: searchDate,
        $lt: nextDay,
      };
    }

    if (search) {
      query.bookingNumber = { $regex: search, $options: "i" };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("bus", "busNumber busType operator")
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
    console.error("Get bookings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get bookings",
        code: "GET_BOOKINGS_ERROR",
      },
    });
  }
});

// Update booking status
router.put("/bookings/:bookingId", async (req, res) => {
  try {
    const { status, cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.bookingId);

    if (!booking) {
      return res.status(404).json({
        error: {
          message: "Booking not found",
          code: "BOOKING_NOT_FOUND",
        },
      });
    }

    if (status === "cancelled") {
      booking.cancel(cancellationReason || "Cancelled by admin", "admin");
    } else {
      booking.status = status;
    }

    await booking.save();

    res.json({
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update booking",
        code: "UPDATE_BOOKING_ERROR",
      },
    });
  }
});

// System Settings
router.get("/settings", async (req, res) => {
  try {
    // In a real app, you'd fetch settings from database
    const settings = {
      siteName: "Bus नियोजक",
      siteDescription: "Nepal's leading bus booking platform",
      adminEmail: "admin@busniyojak.com",
      supportEmail: "support@busniyojak.com",
      enableRegistrations: true,
      enableBookings: true,
      requireEmailVerification: true,
      enableNotifications: true,
      maintenanceMode: false,
      maxBookingsPerUser: 5,
      bookingCancellationHours: 2,
      commissionRate: 5,
      autoApproveOperators: false,
      enableRatings: true,
      minRatingToDisplay: 3,
    };

    res.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get settings",
        code: "GET_SETTINGS_ERROR",
      },
    });
  }
});

// Update system settings
router.put("/settings", async (req, res) => {
  try {
    const { settings } = req.body;

    // In a real app, you'd save settings to database
    // For now, just return success

    res.json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update settings",
        code: "UPDATE_SETTINGS_ERROR",
      },
    });
  }
});

// Analytics and Reports
router.get("/analytics/revenue", async (req, res) => {
  try {
    const { period = "month", year = new Date().getFullYear() } = req.query;

    let groupBy;
    let startDate;
    let endDate;

    if (period === "year") {
      groupBy = { $year: "$createdAt" };
      startDate = new Date(year - 5, 0, 1);
      endDate = new Date(parseInt(year) + 1, 0, 1);
    } else if (period === "month") {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      };
      startDate = new Date(year, 0, 1);
      endDate = new Date(parseInt(year) + 1, 0, 1);
    } else {
      groupBy = {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
        day: { $dayOfMonth: "$createdAt" },
      };
      startDate = new Date(year, new Date().getMonth(), 1);
      endDate = new Date(year, new Date().getMonth() + 1, 1);
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          "payment.status": "completed",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
          passengers: { $sum: { $size: "$passengers" } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json({ revenueData });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get analytics data",
        code: "ANALYTICS_ERROR",
      },
    });
  }
});

// Export data
router.get("/export/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate, format = "json" } = req.query;

    let data;
    let filename;

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    switch (type) {
      case "users":
        data = await User.find(dateFilter).select("-password");
        filename = `users_${Date.now()}`;
        break;

      case "bookings":
        data = await Booking.find(dateFilter)
          .populate("user", "name email phone")
          .populate("bus", "busNumber busType")
          .populate("route", "name origin destination");
        filename = `bookings_${Date.now()}`;
        break;

      case "revenue":
        data = await Booking.aggregate([
          { $match: { ...dateFilter, "payment.status": "completed" } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              revenue: { $sum: "$pricing.totalAmount" },
              bookings: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        filename = `revenue_${Date.now()}`;
        break;

      default:
        return res.status(400).json({
          error: {
            message: "Invalid export type",
            code: "INVALID_EXPORT_TYPE",
          },
        });
    }

    if (format === "csv") {
      // In a real app, you'd convert to CSV
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.csv"`,
      );
      res.send("CSV export not implemented yet");
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}.json"`,
      );
      res.json(data);
    }
  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      error: {
        message: "Failed to export data",
        code: "EXPORT_ERROR",
      },
    });
  }
});

module.exports = router;
