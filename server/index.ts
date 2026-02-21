import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  searchBusByNumber,
  searchRoutesBetweenStops,
  getAllStops,
  getAllRoutes,
  getRouteById,
  getDashboardStats,
  getLiveBusLocations,
  computeRouteOverlap,
  getBuses,
  createBus,
  updateBus,
  deleteBus
} from "./routes/buses";
import { adminLogin, verifyAdminToken, adminLogout, getAdminProfile, requireAdmin } from "./routes/admin";
import { listSchedules, getScheduleById, createSchedule, updateSchedule, deleteSchedule } from "./routes/scheduler";
import { listCrew, getCrewById, createCrew, updateCrew, deleteCrew } from "./routes/crew";
import {
  getGTFSRoutes,
  getGTFSStops,
  searchGTFSRoutes,
} from "./routes/gtfs";
import {
  userLogin,
  userRegister,
  verifyUserToken,
  userLogout,
  getUserProfile,
  updateUserProfile,
  requireUser,
  forgotPassword,
} from "./routes/auth";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables locally
dotenv.config();

/**
 * Ensures MongoDB is connected.
 * In a serverless environment like Vercel, this may be called multiple times.
 */
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) return;

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn("MONGODB_URI not found. Running in mock mode.");
    return;
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("✅ Main server connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}

export function createServer() {
  // Ensure DB connection is initiated
  connectToDatabase();

  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Welcome to Bus नियोजक API!" });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  // Bus Management API Routes
  app.get("/api/buses/search", searchBusByNumber);
  app.get("/api/routes/search", searchRoutesBetweenStops);
  app.get("/api/stops", getAllStops);
  app.get("/api/routes", getAllRoutes);
  app.get("/api/routes/:id", getRouteById);
  app.post("/api/routes/overlap", computeRouteOverlap);
  app.get("/api/dashboard/stats", getDashboardStats);
  app.get("/api/buses/locations", getLiveBusLocations);

  // GTFS API Routes
  app.get("/api/gtfs/routes", getGTFSRoutes);
  app.get("/api/gtfs/stops", getGTFSStops);
  app.get("/api/gtfs/search", searchGTFSRoutes);

  // User Authentication API Routes
  app.post("/api/auth/register", userRegister);
  app.post("/api/auth/login", userLogin);
  app.post("/api/auth/logout", userLogout);
  app.get("/api/auth/verify", verifyUserToken);
  app.get("/api/auth/profile", requireUser, getUserProfile);
  app.put("/api/auth/profile", requireUser, updateUserProfile);
  app.post("/api/auth/forgot-password", forgotPassword);

  // Admin Authentication API Routes
  app.post("/api/admin/login", adminLogin);
  app.post("/api/admin/logout", adminLogout);
  app.get("/api/admin/verify", verifyAdminToken);
  app.get("/api/admin/profile", requireAdmin, getAdminProfile);

  // Protected admin routes (require authentication)
  app.get("/api/admin/dashboard/stats", requireAdmin, getDashboardStats);

  // Scheduler Routes (admin)
  app.get("/api/admin/schedules", requireAdmin, listSchedules);
  app.get("/api/admin/schedules/:id", requireAdmin, getScheduleById);
  app.post("/api/admin/schedules", requireAdmin, createSchedule);
  app.put("/api/admin/schedules/:id", requireAdmin, updateSchedule);
  app.delete("/api/admin/schedules/:id", requireAdmin, deleteSchedule);

  // Crew Routes (admin)
  app.get("/api/admin/crew", requireAdmin, listCrew);
  app.get("/api/admin/crew/:id", requireAdmin, getCrewById);
  app.post("/api/admin/crew", requireAdmin, createCrew);
  app.put("/api/admin/crew/:id", requireAdmin, updateCrew);
  app.delete("/api/admin/crew/:id", requireAdmin, deleteCrew);

  // Buses Routes (admin)
  app.get("/api/admin/buses", requireAdmin, getBuses);
  app.post("/api/admin/buses", requireAdmin, createBus);
  app.put("/api/admin/buses/:id", requireAdmin, updateBus);
  app.delete("/api/admin/buses/:id", requireAdmin, deleteBus);

  return app;
}
