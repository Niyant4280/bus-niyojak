const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          message: "Access token required",
          code: "NO_TOKEN",
        },
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: {
          message: "Invalid token - user not found",
          code: "INVALID_TOKEN",
        },
      });
    }

    if (user.status !== "active") {
      return res.status(401).json({
        error: {
          message: "Account is not active",
          code: "INACTIVE_ACCOUNT",
        },
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        error: {
          message: "Invalid token",
          code: "INVALID_TOKEN",
        },
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: {
          message: "Token expired",
          code: "TOKEN_EXPIRED",
        },
      });
    }

    console.error("Authentication error:", error);
    res.status(500).json({
      error: {
        message: "Authentication failed",
        code: "AUTH_ERROR",
      },
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      },
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: {
        message: "Admin access required",
        code: "ADMIN_REQUIRED",
      },
    });
  }

  next();
};

// Middleware to check if user is operator or admin
const requireOperator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      },
    });
  }

  if (!["operator", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      error: {
        message: "Operator or admin access required",
        code: "OPERATOR_REQUIRED",
      },
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: {
        message: "Authentication required",
        code: "AUTH_REQUIRED",
      },
    });
  }

  const resourceUserId =
    req.params.userId || req.body.userId || req.query.userId;

  if (req.user.role === "admin" || req.user._id.toString() === resourceUserId) {
    return next();
  }

  return res.status(403).json({
    error: {
      message: "Access denied - insufficient permissions",
      code: "ACCESS_DENIED",
    },
  });
};

// Optional authentication - doesn't throw error if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.status === "active") {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore authentication errors for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
};

// Rate limiting helper
const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const requests = new Map();

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(key)) {
      const userRequests = requests
        .get(key)
        .filter((time) => time > windowStart);
      requests.set(key, userRequests);
    } else {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    if (userRequests.length >= max) {
      return res.status(429).json({
        error: {
          message: "Too many requests",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: Math.ceil(windowMs / 1000),
        },
      });
    }

    userRequests.push(now);
    next();
  };
};

// Validate API key for external integrations
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: "API key required",
        code: "API_KEY_REQUIRED",
      },
    });
  }

  // In a real app, you'd validate against stored API keys
  // For now, we'll just check against a simple env variable
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      error: {
        message: "Invalid API key",
        code: "INVALID_API_KEY",
      },
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOperator,
  requireOwnershipOrAdmin,
  optionalAuth,
  createRateLimiter,
  validateApiKey,
};
