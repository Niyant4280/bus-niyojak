const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Bus = require("../models/Bus");
const Route = require("../models/Route");
const Booking = require("../models/Booking");
const {
  authenticateToken,
  requireOperator,
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// Get dashboard analytics (admin only)
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      period = "month",
      year = new Date().getFullYear(),
      month,
    } = req.query;

    // Build date range
    let startDate, endDate;

    if (period === "year") {
      startDate = new Date(year, 0, 1);
      endDate = new Date(parseInt(year) + 1, 0, 1);
    } else if (period === "month") {
      const targetMonth = month ? parseInt(month) - 1 : new Date().getMonth();
      startDate = new Date(year, targetMonth, 1);
      endDate = new Date(year, targetMonth + 1, 1);
    } else {
      // week
      const now = new Date();
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
    }

    // Revenue analytics
    const revenueData = await Booking.aggregate([
      {
        $match: {
          "payment.status": "completed",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id:
            period === "year"
              ? { $month: "$createdAt" }
              : { $dayOfMonth: "$createdAt" },
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
          passengers: { $sum: { $size: "$passengers" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User growth analytics
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          role: "user",
        },
      },
      {
        $group: {
          _id:
            period === "year"
              ? { $month: "$createdAt" }
              : { $dayOfMonth: "$createdAt" },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Booking status distribution
    const bookingStats = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "completed"] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Route popularity
    const routePopularity = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $lookup: {
          from: "routes",
          localField: "route",
          foreignField: "_id",
          as: "routeInfo",
        },
      },
      { $unwind: "$routeInfo" },
      {
        $group: {
          _id: "$route",
          routeName: { $first: "$routeInfo.name" },
          origin: { $first: "$routeInfo.origin.name" },
          destination: { $first: "$routeInfo.destination.name" },
          bookings: { $sum: 1 },
          revenue: { $sum: "$pricing.totalAmount" },
          passengers: { $sum: { $size: "$passengers" } },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
    ]);

    // Bus performance
    const busPerformance = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          status: { $in: ["confirmed", "completed"] },
        },
      },
      {
        $lookup: {
          from: "buses",
          localField: "bus",
          foreignField: "_id",
          as: "busInfo",
        },
      },
      { $unwind: "$busInfo" },
      {
        $group: {
          _id: "$bus",
          busNumber: { $first: "$busInfo.busNumber" },
          busType: { $first: "$busInfo.busType" },
          bookings: { $sum: 1 },
          revenue: { $sum: "$pricing.totalAmount" },
          passengers: { $sum: { $size: "$passengers" } },
          capacity: { $first: "$busInfo.capacity.total" },
        },
      },
      {
        $addFields: {
          occupancyRate: {
            $multiply: [
              {
                $divide: [
                  "$passengers",
                  { $multiply: ["$capacity", "$bookings"] },
                ],
              },
              100,
            ],
          },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Summary statistics
    const totalRevenue = revenueData.reduce(
      (sum, item) => sum + item.revenue,
      0,
    );
    const totalBookings = revenueData.reduce(
      (sum, item) => sum + item.bookings,
      0,
    );
    const totalPassengers = revenueData.reduce(
      (sum, item) => sum + item.passengers,
      0,
    );
    const averageBookingValue =
      totalBookings > 0 ? totalRevenue / totalBookings : 0;

    res.json({
      period,
      dateRange: { startDate, endDate },
      summary: {
        totalRevenue,
        totalBookings,
        totalPassengers,
        averageBookingValue: Math.round(averageBookingValue),
        newUsers: userGrowth.reduce((sum, item) => sum + item.newUsers, 0),
      },
      revenue: revenueData,
      userGrowth,
      bookingStats,
      routePopularity,
      busPerformance,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get dashboard analytics",
        code: "DASHBOARD_ANALYTICS_ERROR",
      },
    });
  }
});

// Get revenue analytics
router.get("/revenue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      period = "month",
      year = new Date().getFullYear(),
      operatorId,
    } = req.query;

    let matchStage = {
      "payment.status": "completed",
    };

    // Add operator filter if specified
    if (operatorId) {
      const operatorBuses = await Bus.find({ operator: operatorId }).select(
        "_id",
      );
      matchStage.bus = { $in: operatorBuses.map((bus) => bus._id) };
    }

    // Build date filter
    if (period === "month") {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);
      matchStage.createdAt = { $gte: startDate, $lt: endDate };
    }

    const revenueAnalytics = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id:
            period === "month"
              ? { $month: "$createdAt" }
              : {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                  day: { $dayOfMonth: "$createdAt" },
                },
          revenue: { $sum: "$pricing.totalAmount" },
          bookings: { $sum: 1 },
          passengers: { $sum: { $size: "$passengers" } },
          averageBookingValue: { $avg: "$pricing.totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Revenue by payment method
    const paymentMethodRevenue = await Booking.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$payment.method",
          revenue: { $sum: "$pricing.totalAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      period,
      year,
      operatorId,
      revenueData: revenueAnalytics,
      paymentMethodBreakdown: paymentMethodRevenue,
      totalRevenue: revenueAnalytics.reduce(
        (sum, item) => sum + item.revenue,
        0,
      ),
      totalBookings: revenueAnalytics.reduce(
        (sum, item) => sum + item.bookings,
        0,
      ),
    });
  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get revenue analytics",
        code: "REVENUE_ANALYTICS_ERROR",
      },
    });
  }
});

// Get user analytics
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = "month", year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);

    // User registration trends
    const userRegistrations = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          role: "user",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          newUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // User status distribution
    const userStatusDistribution = await User.aggregate([
      { $match: { role: "user" } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Active users (users with bookings in the period)
    const activeUsers = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$user",
          bookings: { $sum: 1 },
          totalSpent: { $sum: "$pricing.totalAmount" },
        },
      },
      {
        $group: {
          _id: null,
          activeUserCount: { $sum: 1 },
          averageBookingsPerUser: { $avg: "$bookings" },
          averageSpentPerUser: { $avg: "$totalSpent" },
        },
      },
    ]);

    // User engagement by month
    const userEngagement = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            user: "$user",
          },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          activeUsers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period,
      year,
      userRegistrations,
      userStatusDistribution,
      activeUserStats: activeUsers[0] || {
        activeUserCount: 0,
        averageBookingsPerUser: 0,
        averageSpentPerUser: 0,
      },
      userEngagement,
    });
  } catch (error) {
    console.error("User analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get user analytics",
        code: "USER_ANALYTICS_ERROR",
      },
    });
  }
});

// Get booking analytics
router.get("/bookings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = "month", year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);

    // Booking trends
    const bookingTrends = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          bookings: { $sum: 1 },
          confirmed: {
            $sum: { $cond: [{ $eq: ["$status", "confirmed"] }, 1, 0] },
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Cancellation analysis
    const cancellationAnalysis = await Booking.aggregate([
      {
        $match: {
          status: "cancelled",
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: "$cancellation.cancelledBy",
          count: { $sum: 1 },
          refundAmount: { $sum: "$cancellation.refundAmount" },
        },
      },
    ]);

    // Peak booking hours
    const peakHours = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { bookings: -1 } },
    ]);

    // Average booking value by month
    const avgBookingValue = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          "payment.status": "completed",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          averageValue: { $avg: "$pricing.totalAmount" },
          minValue: { $min: "$pricing.totalAmount" },
          maxValue: { $max: "$pricing.totalAmount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period,
      year,
      bookingTrends,
      cancellationAnalysis,
      peakHours: peakHours.slice(0, 10),
      avgBookingValue,
    });
  } catch (error) {
    console.error("Booking analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get booking analytics",
        code: "BOOKING_ANALYTICS_ERROR",
      },
    });
  }
});

// Get operator analytics (for specific operator or admin)
router.get(
  "/operator/:operatorId?",
  authenticateToken,
  requireOperator,
  async (req, res) => {
    try {
      const operatorId = req.params.operatorId || req.user._id;
      const { period = "month", year = new Date().getFullYear() } = req.query;

      // Check permissions
      if (
        req.user.role === "operator" &&
        operatorId !== req.user._id.toString()
      ) {
        return res.status(403).json({
          error: {
            message: "Access denied - can only view own analytics",
            code: "ACCESS_DENIED",
          },
        });
      }

      const startDate = new Date(year, 0, 1);
      const endDate = new Date(parseInt(year) + 1, 0, 1);

      // Get operator's buses
      const operatorBuses = await Bus.find({ operator: operatorId }).select(
        "_id busNumber busType",
      );
      const busIds = operatorBuses.map((bus) => bus._id);

      if (busIds.length === 0) {
        return res.json({
          operatorId,
          message: "No buses found for this operator",
          analytics: {},
        });
      }

      // Revenue analytics
      const revenueData = await Booking.aggregate([
        {
          $match: {
            bus: { $in: busIds },
            "payment.status": "completed",
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            revenue: { $sum: "$pricing.totalAmount" },
            bookings: { $sum: 1 },
            passengers: { $sum: { $size: "$passengers" } },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Bus performance
      const busPerformance = await Booking.aggregate([
        {
          $match: {
            bus: { $in: busIds },
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $lookup: {
            from: "buses",
            localField: "bus",
            foreignField: "_id",
            as: "busInfo",
          },
        },
        { $unwind: "$busInfo" },
        {
          $group: {
            _id: "$bus",
            busNumber: { $first: "$busInfo.busNumber" },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$payment.status", "completed"] },
                  "$pricing.totalAmount",
                  0,
                ],
              },
            },
            passengers: { $sum: { $size: "$passengers" } },
            cancellations: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Route performance
      const routePerformance = await Booking.aggregate([
        {
          $match: {
            bus: { $in: busIds },
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $lookup: {
            from: "routes",
            localField: "route",
            foreignField: "_id",
            as: "routeInfo",
          },
        },
        { $unwind: "$routeInfo" },
        {
          $group: {
            _id: "$route",
            routeName: { $first: "$routeInfo.name" },
            bookings: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$payment.status", "completed"] },
                  "$pricing.totalAmount",
                  0,
                ],
              },
            },
            passengers: { $sum: { $size: "$passengers" } },
          },
        },
        { $sort: { revenue: -1 } },
      ]);

      // Summary statistics
      const totalRevenue = revenueData.reduce(
        (sum, item) => sum + item.revenue,
        0,
      );
      const totalBookings = revenueData.reduce(
        (sum, item) => sum + item.bookings,
        0,
      );
      const totalPassengers = revenueData.reduce(
        (sum, item) => sum + item.passengers,
        0,
      );

      res.json({
        operatorId,
        period,
        year,
        summary: {
          totalBuses: operatorBuses.length,
          totalRevenue,
          totalBookings,
          totalPassengers,
          averageBookingValue:
            totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0,
        },
        revenueData,
        busPerformance,
        routePerformance,
        busDetails: operatorBuses,
      });
    } catch (error) {
      console.error("Operator analytics error:", error);
      res.status(500).json({
        error: {
          message: "Failed to get operator analytics",
          code: "OPERATOR_ANALYTICS_ERROR",
        },
      });
    }
  },
);

// Get route analytics
router.get("/routes", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = "month", year = new Date().getFullYear() } = req.query;

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(parseInt(year) + 1, 0, 1);

    // Route popularity and performance
    const routeAnalytics = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $lookup: {
          from: "routes",
          localField: "route",
          foreignField: "_id",
          as: "routeInfo",
        },
      },
      { $unwind: "$routeInfo" },
      {
        $group: {
          _id: "$route",
          routeName: { $first: "$routeInfo.name" },
          origin: { $first: "$routeInfo.origin.name" },
          destination: { $first: "$routeInfo.destination.name" },
          distance: { $first: "$routeInfo.distance.total" },
          bookings: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$payment.status", "completed"] },
                "$pricing.totalAmount",
                0,
              ],
            },
          },
          passengers: { $sum: { $size: "$passengers" } },
          avgRating: { $avg: "$feedback.rating" },
          cancellations: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
        },
      },
      {
        $addFields: {
          cancellationRate: {
            $multiply: [{ $divide: ["$cancellations", "$bookings"] }, 100],
          },
          revenuePerKm: {
            $divide: ["$revenue", "$distance"],
          },
        },
      },
      { $sort: { bookings: -1 } },
    ]);

    // Route demand by month
    const routeDemand = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            route: "$route",
          },
          bookings: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          routes: { $sum: 1 },
          totalBookings: { $sum: "$bookings" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      period,
      year,
      routeAnalytics,
      routeDemand,
      totalRoutes: routeAnalytics.length,
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
});

// Export analytics data
router.get("/export", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type, format = "json", startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        error: {
          message: "Export type is required",
          code: "MISSING_TYPE",
        },
      });
    }

    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    let data;
    let filename;

    switch (type) {
      case "revenue":
        data = await Booking.aggregate([
          { $match: { "payment.status": "completed", ...dateFilter } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              revenue: { $sum: "$pricing.totalAmount" },
              bookings: { $sum: 1 },
              passengers: { $sum: { $size: "$passengers" } },
            },
          },
          { $sort: { _id: 1 } },
        ]);
        filename = "revenue_analytics";
        break;

      case "bookings":
        data = await Booking.find(dateFilter)
          .populate("user", "name email")
          .populate("bus", "busNumber operator")
          .populate("route", "name origin destination")
          .select("bookingNumber status pricing passengers journey createdAt");
        filename = "booking_data";
        break;

      case "users":
        data = await User.find({ ...dateFilter, role: "user" }).select(
          "name email phone status createdAt loyaltyPoints",
        );
        filename = "user_data";
        break;

      default:
        return res.status(400).json({
          error: {
            message: "Invalid export type",
            code: "INVALID_TYPE",
          },
        });
    }

    // Set appropriate headers
    const timestamp = new Date().toISOString().split("T")[0];
    const fullFilename = `${filename}_${timestamp}.${format}`;

    if (format === "csv") {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fullFilename}"`,
      );
      // Convert to CSV (simplified - in production, use a proper CSV library)
      const csv = convertToCSV(data);
      res.send(csv);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fullFilename}"`,
      );
      res.json({
        exportType: type,
        exportDate: new Date(),
        dateRange: { startDate, endDate },
        data,
      });
    }
  } catch (error) {
    console.error("Export analytics error:", error);
    res.status(500).json({
      error: {
        message: "Failed to export analytics data",
        code: "EXPORT_ERROR",
      },
    });
  }
});

// Helper function to convert data to CSV
function convertToCSV(data) {
  if (!data.length) return "";

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" ? `"${value}"` : value;
        })
        .join(","),
    ),
  ].join("\n");

  return csvContent;
}

module.exports = router;
