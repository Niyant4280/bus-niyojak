import { RequestHandler } from "express";
import { LoginResponse, User } from "../../shared/types";

const mockAdminUser: User = {
  id: "admin-1",
  email: process.env.ADMIN_EMAIL ?? "admin@busniyojak.com",
  name: "System Administrator",
  role: "admin",
  phone: "+91-9876543210",
  isVerified: true,
  createdAt: new Date("2024-01-01"),
  lastLogin: new Date(),
};

export const adminLogin: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const adminEmail = process.env.ADMIN_EMAIL ?? "admin@busniyojak.com";
    const adminPassword = process.env.ADMIN_PASSWORD ?? "BusAdmin2024!";

    console.log(`Admin login attempt for: ${email}`);

    // Check if database is connected for visibility
    const mongoose = (await import("mongoose")).default;
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    console.log(`Database status: ${dbStatus}`);

    const validPairs = [
      { email: adminEmail, password: adminPassword },
    ];

    if (validPairs.some((p) => p.email === email && p.password === password)) {
      const token = `admin-jwt-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const refreshToken = `refresh-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const response: LoginResponse = {
        user: mockAdminUser,
        token,
        refreshToken,
        _metadata: { db: dbStatus }
      };
      return res.json(response);
    }

    return res.status(401).json({ error: "Invalid admin credentials" });
  } catch (error) {
    console.error("Critical error during admin login:", error);
    const mongoose = (await import("mongoose")).default;
    return res.status(500).json({
      error: "Internal server error during login",
      details: error instanceof Error ? error.message : "Unknown error",
      dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    });
  }
};

export const verifyAdminToken: RequestHandler = (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token && token.startsWith("admin-jwt-")) return res.json({ valid: true, user: mockAdminUser });
  return res.status(401).json({ error: "Invalid or expired token" });
};

export const requireAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (token && token.startsWith("admin-jwt-")) return next();
  return res.status(401).json({ error: "Admin access required" });
};

export const adminLogout: RequestHandler = (_req, res) => res.json({ message: "Logged out" });
export const getAdminProfile: RequestHandler = (_req, res) => res.json(mockAdminUser);


