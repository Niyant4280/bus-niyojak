import { RequestHandler } from "express";
import { Bus, BusRoute } from "../../shared/types.js";
import { BusModel } from "../models/Bus.js";
import { RouteModel } from "../models/Route.js";

// GET /api/admin/buses - Get all buses
export const getBuses: RequestHandler = async (req, res) => {
  try {
    const buses = await BusModel.find().sort({ createdAt: -1 });
    res.json({ buses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};

// POST /api/admin/buses - Create new bus
export const createBus: RequestHandler = async (req, res) => {
  try {
    const {
      busId,
      busNumber,
      busType,
      acType,
      avgMileage,
      lastMaintenanceDate,
      nextMaintenanceDate,
      busStatus,
      capacity,
      fuelType,
      registrationDate,
      manufacturer,
      model,
      year,
      assignedRoute,
      driverId,
      conductorId
    } = req.body;

    // Validate required fields
    if (!busId || !busNumber || !busType || !acType || !busStatus || !capacity || !fuelType || !manufacturer || !model || !year) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if bus ID already exists
    const existingId = await BusModel.findOne({ busId });
    if (existingId) {
      return res.status(400).json({ error: "Bus ID already exists" });
    }

    // Check if bus number already exists
    const existingNumber = await BusModel.findOne({ busNumber });
    if (existingNumber) {
      return res.status(400).json({ error: "Bus number already exists" });
    }

    const newBus = new BusModel({
      busId,
      busNumber,
      busType,
      acType,
      avgMileage: avgMileage || 0,
      lastMaintenanceDate: lastMaintenanceDate || "",
      nextMaintenanceDate: nextMaintenanceDate || "",
      busStatus,
      capacity,
      fuelType,
      registrationDate: registrationDate || "",
      manufacturer,
      model,
      year,
      assignedRoute,
      driverId,
      conductorId
    });

    await newBus.save();
    res.status(201).json({ bus: newBus });
  } catch (error) {
    console.error("Error creating bus:", error);
    res.status(500).json({ error: "Failed to create bus" });
  }
};

// PUT /api/admin/buses/:id - Update bus
export const updateBus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if bus ID already exists (excluding current bus)
    if (updateData.busId) {
      const existingId = await BusModel.findOne({ busId: updateData.busId, _id: { $ne: id } });
      if (existingId) {
        return res.status(400).json({ error: "Bus ID already exists" });
      }
    }

    // Check if bus number already exists (excluding current bus)
    if (updateData.busNumber) {
      const existingNumber = await BusModel.findOne({ busNumber: updateData.busNumber, _id: { $ne: id } });
      if (existingNumber) {
        return res.status(400).json({ error: "Bus number already exists" });
      }
    }

    const updatedBus = await BusModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date().toISOString() },
      { new: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ error: "Bus not found" });
    }

    res.json({ bus: updatedBus });
  } catch (error) {
    res.status(500).json({ error: "Failed to update bus" });
  }
};

// DELETE /api/admin/buses/:id - Delete bus
export const deleteBus: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBus = await BusModel.findByIdAndDelete(id);

    if (!deletedBus) {
      return res.status(404).json({ error: "Bus not found" });
    }

    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bus" });
  }
};

// GET /api/routes - Get all routes
export const getAllRoutes: RequestHandler = async (req, res) => {
  try {
    const routes = await RouteModel.find().sort({ routeName: 1 });
    res.json({ success: true, routes });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch routes" });
  }
};

// POST /api/routes - Create new route
export const createRoute: RequestHandler = async (req, res) => {
  try {
    const {
      busNumber,
      routeName,
      stops,
      frequency,
      operatingHours,
      capacity
    } = req.body;

    if (!routeName || !stops || stops.length < 2) {
      return res.status(400).json({ error: "Invalid route data. Need name and at least 2 stops." });
    }

    const newRoute = new RouteModel({
      busNumber: busNumber || "Multiple",
      routeName,
      stops,
      frequency: frequency || "Every 30 mins",
      operatingHours: operatingHours || { start: "06:00", end: "22:00" },
      isActive: true,
      capacity: capacity || 50,
      currentPassengers: 0
    });

    await newRoute.save();
    res.status(201).json({ success: true, route: newRoute });
  } catch (error) {
    console.error("Error creating route:", error);
    res.status(500).json({ success: false, error: "Failed to create route" });
  }
};

// GET /api/routes/:id - Get route by ID
export const getRouteById: RequestHandler = async (req, res) => {
  try {
    const route = await RouteModel.findById(req.params.id);
    if (!route) return res.status(404).json({ error: "Route not found" });
    res.json({ route });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch route" });
  }
};

// Legacy functions for existing API compatibility
export const searchBusByNumber: RequestHandler = (req, res) => {
  res.json({ buses: [], total: 0 });
};

export const searchRoutesBetweenStops: RequestHandler = (req, res) => {
  res.json({ routes: [], total: 0 });
};

export const getAllStops: RequestHandler = async (req, res) => {
  try {
    // Extract unique stops from all routes
    const routes = await RouteModel.find();
    const stopsSet = new Map();
    routes.forEach(route => {
      route.stops.forEach(stop => {
        stopsSet.set(stop.name, stop);
      });
    });
    res.json({ stops: Array.from(stopsSet.values()) });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stops" });
  }
};

export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    const activeBuses = await BusModel.countDocuments({ busStatus: "Active" });
    const totalRoutes = await RouteModel.countDocuments();

    res.json({
      activeBuses,
      totalRoutes,
      crewMembers: 10, // Placeholder as crew is not yet persistent
      dailyPassengers: 1250, // Placeholder
      pendingAds: 2 // Placeholder
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const getLiveBusLocations: RequestHandler = (req, res) => {
  res.json({ locations: [] });
};

export const computeRouteOverlap: RequestHandler = (req, res) => {
  res.json({
    overlapRatio: 0,
    overlappingSegments: []
  });
};