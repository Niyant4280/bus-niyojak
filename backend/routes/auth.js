const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { authenticateToken, createRateLimiter } = require("../middleware/auth");

const router = express.Router();

// Rate limiters
const loginLimiter = createRateLimiter(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const registerLimiter = createRateLimiter(60 * 60 * 1000, 3); // 3 registrations per hour

// Helper function to generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Helper function to generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, type: "refresh" }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register new user
router.post("/register", registerLimiter, async (req, res) => {
  try {
    const { name, email, phone, password, dateOfBirth, gender, address } =
      req.body;

    // Validation
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        error: {
          message: "Name, email, phone, and password are required",
          code: "MISSING_REQUIRED_FIELDS",
        },
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: {
          message: "Password must be at least 6 characters long",
          code: "INVALID_PASSWORD",
        },
      });
    }

    // Check if user already exists
    const existingUser = await User.findByEmailOrPhone(email, phone);
    if (existingUser) {
      const field =
        existingUser.email === email.toLowerCase() ? "email" : "phone";
      return res.status(409).json({
        error: {
          message: `User with this ${field} already exists`,
          code: "USER_EXISTS",
          field,
        },
      });
    }

    // Create new user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      status: "active", // Auto-activate for now, in production you might want email verification
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: "User registered successfully",
      user: userResponse,
      tokens: {
        accessToken: token,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: "7d",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        error: {
          message: `User with this ${field} already exists`,
          code: "DUPLICATE_FIELD",
          field,
        },
      });
    }

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
        message: "Registration failed",
        code: "REGISTRATION_ERROR",
      },
    });
  }
});

// Login user
router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({
        error: {
          message: "Email/phone and password are required",
          code: "MISSING_CREDENTIALS",
        },
      });
    }

    // Find user by email or phone
    const user = await User.findByEmailOrPhone(identifier);
    if (!user) {
      return res.status(401).json({
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: "Invalid credentials",
          code: "INVALID_CREDENTIALS",
        },
      });
    }

    // Check user status
    if (user.status !== "active") {
      return res.status(401).json({
        error: {
          message: `Account is ${user.status}. Please contact support.`,
          code: "ACCOUNT_NOT_ACTIVE",
        },
      });
    }

    // Update login history
    user.loginHistory.push({
      timestamp: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers["user-agent"],
      location: req.headers["x-forwarded-for"] || "Unknown",
    });

    // Keep only last 10 login records
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save();

    // Generate tokens
    const token = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Login successful",
      user: userResponse,
      tokens: {
        accessToken: token,
        refreshToken,
        tokenType: "Bearer",
        expiresIn: "7d",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: {
        message: "Login failed",
        code: "LOGIN_ERROR",
      },
    });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: {
          message: "Refresh token required",
          code: "MISSING_REFRESH_TOKEN",
        },
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    if (decoded.type !== "refresh") {
      return res.status(401).json({
        error: {
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user || user.status !== "active") {
      return res.status(401).json({
        error: {
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id, user.role);
    const newRefreshToken = generateRefreshToken(user._id);

    res.json({
      tokens: {
        accessToken: newToken,
        refreshToken: newRefreshToken,
        tokenType: "Bearer",
        expiresIn: "7d",
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(401).json({
        error: {
          message: "Invalid refresh token",
          code: "INVALID_REFRESH_TOKEN",
        },
      });
    }

    res.status(500).json({
      error: {
        message: "Token refresh failed",
        code: "REFRESH_ERROR",
      },
    });
  }
});

// Get current user profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("bookingHistory");

    res.json({
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      error: {
        message: "Failed to get user profile",
        code: "PROFILE_ERROR",
      },
    });
  }
});

// Change password
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          message: "Current password and new password are required",
          code: "MISSING_PASSWORDS",
        },
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: {
          message: "New password must be at least 6 characters long",
          code: "INVALID_NEW_PASSWORD",
        },
      });
    }

    const user = await User.findById(req.user._id);

    // Verify current password
    const isValidPassword = await user.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({
        error: {
          message: "Current password is incorrect",
          code: "INVALID_CURRENT_PASSWORD",
        },
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      error: {
        message: "Failed to change password",
        code: "PASSWORD_CHANGE_ERROR",
      },
    });
  }
});

// Logout (in a real app, you might want to blacklist the token)
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    // In a real application, you would add the token to a blacklist
    // For now, we'll just return a success message
    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      error: {
        message: "Logout failed",
        code: "LOGOUT_ERROR",
      },
    });
  }
});

// Verify email (placeholder for email verification)
router.post("/verify-email", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: {
          message: "Verification token required",
          code: "MISSING_TOKEN",
        },
      });
    }

    // In a real app, you would verify the token and update user status
    res.json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      error: {
        message: "Email verification failed",
        code: "VERIFICATION_ERROR",
      },
    });
  }
});

// Request password reset (placeholder)
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          message: "Email is required",
          code: "MISSING_EMAIL",
        },
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration
    res.json({
      message:
        "If an account with this email exists, a password reset link has been sent",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({
      error: {
        message: "Password reset request failed",
        code: "RESET_ERROR",
      },
    });
  }
});

module.exports = router;
