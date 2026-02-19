const express = require("express");
const User = require("../models/User");
const Booking = require("../models/Booking");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Notification model (in a real app, you'd have a separate Notification model)
const notifications = new Map(); // In-memory storage for demo

// Get user notifications
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, unreadOnly = false } = req.query;

    const userId = req.user._id.toString();
    const userNotifications = notifications.get(userId) || [];

    // Filter notifications
    let filteredNotifications = userNotifications;

    if (type) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.type === type,
      );
    }

    if (unreadOnly === "true") {
      filteredNotifications = filteredNotifications.filter((n) => !n.read);
    }

    // Sort by timestamp (newest first)
    filteredNotifications.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp),
    );

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex,
    );

    // Count unread notifications
    const unreadCount = userNotifications.filter((n) => !n.read).length;

    res.json({
      notifications: paginatedNotifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredNotifications.length,
        pages: Math.ceil(filteredNotifications.length / limit),
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get notifications",
        code: "GET_NOTIFICATIONS_ERROR",
      },
    });
  }
});

// Mark notification as read
router.put("/:notificationId/read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notificationId = req.params.notificationId;

    const userNotifications = notifications.get(userId) || [];
    const notification = userNotifications.find((n) => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({
        error: {
          message: "Notification not found",
          code: "NOTIFICATION_NOT_FOUND",
        },
      });
    }

    notification.read = true;
    notification.readAt = new Date();

    res.json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({
      error: {
        message: "Failed to mark notification as read",
        code: "MARK_READ_ERROR",
      },
    });
  }
});

// Mark all notifications as read
router.put("/mark-all-read", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const userNotifications = notifications.get(userId) || [];

    userNotifications.forEach((notification) => {
      if (!notification.read) {
        notification.read = true;
        notification.readAt = new Date();
      }
    });

    res.json({
      message: "All notifications marked as read",
      count: userNotifications.length,
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    res.status(500).json({
      error: {
        message: "Failed to mark all notifications as read",
        code: "MARK_ALL_READ_ERROR",
      },
    });
  }
});

// Delete notification
router.delete("/:notificationId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const notificationId = req.params.notificationId;

    let userNotifications = notifications.get(userId) || [];
    const initialLength = userNotifications.length;

    userNotifications = userNotifications.filter(
      (n) => n.id !== notificationId,
    );

    if (userNotifications.length === initialLength) {
      return res.status(404).json({
        error: {
          message: "Notification not found",
          code: "NOTIFICATION_NOT_FOUND",
        },
      });
    }

    notifications.set(userId, userNotifications);

    res.json({
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      error: {
        message: "Failed to delete notification",
        code: "DELETE_NOTIFICATION_ERROR",
      },
    });
  }
});

// Send notification (internal function)
function sendNotification(userId, notification) {
  const userNotifications = notifications.get(userId) || [];

  const newNotification = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...notification,
    timestamp: new Date(),
    read: false,
  };

  userNotifications.unshift(newNotification);

  // Keep only last 100 notifications per user
  if (userNotifications.length > 100) {
    userNotifications.splice(100);
  }

  notifications.set(userId, userNotifications);

  return newNotification;
}

// Send booking confirmation notification
function sendBookingConfirmation(userId, booking) {
  return sendNotification(userId, {
    type: "booking_confirmation",
    title: "Booking Confirmed",
    message: `Your booking ${booking.bookingNumber} has been confirmed for ${booking.journey.date}`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
    },
    priority: "high",
    category: "booking",
  });
}

// Send journey reminder notification
function sendJourneyReminder(userId, booking) {
  return sendNotification(userId, {
    type: "journey_reminder",
    title: "Journey Reminder",
    message: `Your journey from ${booking.route.origin.name} to ${booking.route.destination.name} is tomorrow at ${booking.journey.departureTime}`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
    },
    priority: "medium",
    category: "reminder",
  });
}

// Send boarding reminder notification
function sendBoardingReminder(userId, booking) {
  return sendNotification(userId, {
    type: "boarding_reminder",
    title: "Boarding Soon",
    message: `Your bus ${booking.bus.busNumber} is departing in 30 minutes. Please reach the boarding point.`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      busNumber: booking.bus.busNumber,
    },
    priority: "urgent",
    category: "boarding",
  });
}

// Send payment reminder notification
function sendPaymentReminder(userId, booking) {
  return sendNotification(userId, {
    type: "payment_reminder",
    title: "Payment Pending",
    message: `Payment for booking ${booking.bookingNumber} is still pending. Please complete payment to confirm your seat.`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      amount: booking.pricing.totalAmount,
    },
    priority: "high",
    category: "payment",
  });
}

// Send cancellation notification
function sendCancellationNotification(userId, booking, reason) {
  return sendNotification(userId, {
    type: "booking_cancelled",
    title: "Booking Cancelled",
    message: `Your booking ${booking.bookingNumber} has been cancelled. ${reason ? `Reason: ${reason}` : ""}`,
    data: {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      refundAmount: booking.refundableAmount,
    },
    priority: "high",
    category: "cancellation",
  });
}

// Send system notification
function sendSystemNotification(userId, title, message, type = "info") {
  return sendNotification(userId, {
    type: "system",
    title,
    message,
    priority: type === "urgent" ? "urgent" : "medium",
    category: "system",
  });
}

// Broadcast notification to all users (admin only)
router.post("/broadcast", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      title,
      message,
      type = "announcement",
      priority = "medium",
      targetRole,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        error: {
          message: "Title and message are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    // Get target users
    const query = targetRole
      ? { role: targetRole, status: "active" }
      : { status: "active" };
    const users = await User.find(query).select("_id");

    let sentCount = 0;
    users.forEach((user) => {
      sendNotification(user._id.toString(), {
        type,
        title,
        message,
        priority,
        category: "announcement",
        from: "admin",
      });
      sentCount++;
    });

    res.json({
      message: "Broadcast notification sent successfully",
      sentTo: sentCount,
      targetRole: targetRole || "all",
    });
  } catch (error) {
    console.error("Broadcast notification error:", error);
    res.status(500).json({
      error: {
        message: "Failed to send broadcast notification",
        code: "BROADCAST_ERROR",
      },
    });
  }
});

// Send custom notification (admin only)
router.post("/send", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      title,
      message,
      type = "custom",
      priority = "medium",
      data,
    } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        error: {
          message: "User ID, title, and message are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: {
          message: "User not found",
          code: "USER_NOT_FOUND",
        },
      });
    }

    const notification = sendNotification(userId, {
      type,
      title,
      message,
      priority,
      category: "custom",
      data,
      from: "admin",
    });

    res.json({
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({
      error: {
        message: "Failed to send notification",
        code: "SEND_NOTIFICATION_ERROR",
      },
    });
  }
});

// Get notification settings
router.get("/settings", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "preferences.notifications",
    );

    const defaultSettings = {
      email: true,
      sms: true,
      push: true,
      bookingConfirmation: true,
      journeyReminder: true,
      boardingReminder: true,
      paymentReminder: true,
      promotions: false,
      systemUpdates: true,
    };

    const settings = {
      ...defaultSettings,
      ...user.preferences?.notifications,
    };

    res.json({ settings });
  } catch (error) {
    console.error("Get notification settings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get notification settings",
        code: "GET_SETTINGS_ERROR",
      },
    });
  }
});

// Update notification settings
router.put("/settings", authenticateToken, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        error: {
          message: "Settings object is required",
          code: "INVALID_SETTINGS",
        },
      });
    }

    const user = await User.findById(req.user._id);

    if (!user.preferences) {
      user.preferences = {};
    }

    user.preferences.notifications = {
      ...user.preferences.notifications,
      ...settings,
    };

    await user.save();

    res.json({
      message: "Notification settings updated successfully",
      settings: user.preferences.notifications,
    });
  } catch (error) {
    console.error("Update notification settings error:", error);
    res.status(500).json({
      error: {
        message: "Failed to update notification settings",
        code: "UPDATE_SETTINGS_ERROR",
      },
    });
  }
});

// Automated notification triggers (these would be called by cron jobs or booking events)

// Function to send automated reminders
async function sendAutomatedReminders() {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const nextDay = new Date(tomorrow);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get bookings for tomorrow
    const tomorrowBookings = await Booking.find({
      status: "confirmed",
      "journey.date": { $gte: tomorrow, $lt: nextDay },
      "notifications.reminderSent": false,
    })
      .populate("user", "_id")
      .populate("route", "origin destination")
      .populate("bus", "busNumber");

    tomorrowBookings.forEach((booking) => {
      sendJourneyReminder(booking.user._id.toString(), booking);
      booking.notifications.reminderSent = true;
      booking.save();
    });

    console.log(`Sent ${tomorrowBookings.length} journey reminders`);
  } catch (error) {
    console.error("Send automated reminders error:", error);
  }
}

// Function to send boarding reminders
async function sendBoardingReminders() {
  try {
    const now = new Date();
    const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);

    // Get bookings departing in 30 minutes
    const upcomingBookings = await Booking.find({
      status: "confirmed",
      "notifications.boardingReminder": false,
    })
      .populate("user", "_id")
      .populate("bus", "busNumber");

    upcomingBookings.forEach((booking) => {
      const [depHour, depMinute] = booking.journey.departureTime
        .split(":")
        .map(Number);
      const departureDateTime = new Date(booking.journey.date);
      departureDateTime.setHours(depHour, depMinute, 0, 0);

      // Check if departure is in approximately 30 minutes
      const timeDiff = Math.abs(departureDateTime - in30Minutes);
      if (timeDiff < 5 * 60 * 1000) {
        // Within 5 minutes of 30-minute mark
        sendBoardingReminder(booking.user._id.toString(), booking);
        booking.notifications.boardingReminder = true;
        booking.save();
      }
    });
  } catch (error) {
    console.error("Send boarding reminders error:", error);
  }
}

// Export notification functions for use in other routes
module.exports = router;
module.exports.sendBookingConfirmation = sendBookingConfirmation;
module.exports.sendJourneyReminder = sendJourneyReminder;
module.exports.sendBoardingReminder = sendBoardingReminder;
module.exports.sendPaymentReminder = sendPaymentReminder;
module.exports.sendCancellationNotification = sendCancellationNotification;
module.exports.sendSystemNotification = sendSystemNotification;
module.exports.sendAutomatedReminders = sendAutomatedReminders;
module.exports.sendBoardingReminders = sendBoardingReminders;
