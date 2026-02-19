import { RequestHandler } from "express";
import { Bus } from "@shared/types";

// In-memory storage for buses
let buses: Bus[] = [
  {
    id: "1",
    busId: "BUS-001",
    busNumber: "DL-01-AB-1234",
    busType: "Standard",
    acType: "AC",
    avgMileage: 8.5,
    lastMaintenanceDate: "2024-01-15",
    nextMaintenanceDate: "2024-04-15",
    busStatus: "Active",
    capacity: 50,
    fuelType: "CNG",
    registrationDate: "2020-03-15",
    manufacturer: "Tata Motors",
    model: "Starbus",
    year: 2020,
    assignedRoute: "Route-101",
    driverId: "DRV-001",
    conductorId: "CON-001",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "2",
    busId: "BUS-002",
    busNumber: "DL-02-CD-5678",
    busType: "Deluxe",
    acType: "Non-AC",
    avgMileage: 7.2,
    lastMaintenanceDate: "2024-02-10",
    nextMaintenanceDate: "2024-05-10",
    busStatus: "Active",
    capacity: 45,
    fuelType: "Diesel",
    registrationDate: "2019-08-20",
    manufacturer: "Ashok Leyland",
    model: "JanBus",
    year: 2019,
    assignedRoute: "Route-102",
    driverId: "DRV-002",
    conductorId: "CON-002",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "3",
    busId: "BUS-003",
    busNumber: "DL-03-EF-9012",
    busType: "Premium",
    acType: "AC",
    avgMileage: 9.1,
    lastMaintenanceDate: "2024-01-20",
    nextMaintenanceDate: "2024-04-20",
    busStatus: "Active",
    capacity: 55,
    fuelType: "CNG",
    registrationDate: "2021-05-10",
    manufacturer: "Volvo",
    model: "B7R",
    year: 2021,
    assignedRoute: "Route-103",
    driverId: "DRV-003",
    conductorId: "CON-003",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "4",
    busId: "BUS-004",
    busNumber: "DL-04-GH-3456",
    busType: "Standard",
    acType: "Non-AC",
    avgMileage: 6.8,
    lastMaintenanceDate: "2024-03-05",
    nextMaintenanceDate: "2024-06-05",
    busStatus: "In Maintenance",
    capacity: 40,
    fuelType: "Diesel",
    registrationDate: "2018-12-15",
    manufacturer: "Mahindra",
    model: "Cruzio",
    year: 2018,
    assignedRoute: "Route-104",
    driverId: "DRV-004",
    conductorId: "CON-004",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "5",
    busId: "BUS-005",
    busNumber: "DL-05-IJ-7890",
    busType: "Mini",
    acType: "AC",
    avgMileage: 10.2,
    lastMaintenanceDate: "2024-02-15",
    nextMaintenanceDate: "2024-05-15",
    busStatus: "Active",
    capacity: 25,
    fuelType: "Electric",
    registrationDate: "2022-08-30",
    manufacturer: "BYD",
    model: "K9",
    year: 2022,
    assignedRoute: "Route-105",
    driverId: "DRV-005",
    conductorId: "CON-005",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "6",
    busId: "BUS-006",
    busNumber: "DL-06-KL-2468",
    busType: "Deluxe",
    acType: "AC",
    avgMileage: 8.3,
    lastMaintenanceDate: "2024-01-25",
    nextMaintenanceDate: "2024-04-25",
    busStatus: "Active",
    capacity: 48,
    fuelType: "CNG",
    registrationDate: "2020-11-20",
    manufacturer: "Scania",
    model: "Metrolink",
    year: 2020,
    assignedRoute: "Route-106",
    driverId: "DRV-006",
    conductorId: "CON-006",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "7",
    busId: "BUS-007",
    busNumber: "DL-07-MN-1357",
    busType: "Standard",
    acType: "Non-AC",
    avgMileage: 7.5,
    lastMaintenanceDate: "2024-03-10",
    nextMaintenanceDate: "2024-06-10",
    busStatus: "Active",
    capacity: 42,
    fuelType: "Diesel",
    registrationDate: "2019-06-05",
    manufacturer: "Force Motors",
    model: "Traveller",
    year: 2019,
    assignedRoute: "Route-107",
    driverId: "DRV-007",
    conductorId: "CON-007",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "8",
    busId: "BUS-008",
    busNumber: "DL-08-OP-9753",
    busType: "Premium",
    acType: "AC",
    avgMileage: 8.9,
    lastMaintenanceDate: "2024-02-20",
    nextMaintenanceDate: "2024-05-20",
    busStatus: "Active",
    capacity: 52,
    fuelType: "CNG",
    registrationDate: "2021-03-12",
    manufacturer: "Mercedes-Benz",
    model: "Citaro",
    year: 2021,
    assignedRoute: "Route-108",
    driverId: "DRV-008",
    conductorId: "CON-008",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "9",
    busId: "BUS-009",
    busNumber: "DL-09-QR-8642",
    busType: "Deluxe",
    acType: "Non-AC",
    avgMileage: 6.9,
    lastMaintenanceDate: "2024-01-30",
    nextMaintenanceDate: "2024-04-30",
    busStatus: "Retired",
    capacity: 38,
    fuelType: "Diesel",
    registrationDate: "2017-09-18",
    manufacturer: "Eicher",
    model: "Skyline",
    year: 2017,
    assignedRoute: "Route-109",
    driverId: "DRV-009",
    conductorId: "CON-009",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  },
  {
    id: "10",
    busId: "BUS-010",
    busNumber: "DL-10-ST-6420",
    busType: "Standard",
    acType: "AC",
    avgMileage: 7.8,
    lastMaintenanceDate: "2024-03-01",
    nextMaintenanceDate: "2024-06-01",
    busStatus: "Active",
    capacity: 46,
    fuelType: "CNG",
    registrationDate: "2020-07-25",
    manufacturer: "Tata Motors",
    model: "Ultra",
    year: 2020,
    assignedRoute: "Route-110",
    driverId: "DRV-010",
    conductorId: "CON-010",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  }
];

// GET /api/admin/buses - Get all buses
export const getBuses: RequestHandler = (req, res) => {
  try {
    res.json({ buses });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses" });
  }
};

// POST /api/admin/buses - Create new bus
export const createBus: RequestHandler = (req, res) => {
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
    if (buses.find(b => b.busId === busId)) {
      return res.status(400).json({ error: "Bus ID already exists" });
    }

    // Check if bus number already exists
    if (buses.find(b => b.busNumber === busNumber)) {
      return res.status(400).json({ error: "Bus number already exists" });
    }

    const newBus: Bus = {
      id: Date.now().toString(),
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
      conductorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    buses.push(newBus);
    res.status(201).json({ bus: newBus });
  } catch (error) {
    res.status(500).json({ error: "Failed to create bus" });
  }
};

// PUT /api/admin/buses/:id - Update bus
export const updateBus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const busIndex = buses.findIndex(b => b.id === id);
    if (busIndex === -1) {
      return res.status(404).json({ error: "Bus not found" });
    }

    // Check if bus ID already exists (excluding current bus)
    if (updateData.busId && buses.find(b => b.busId === updateData.busId && b.id !== id)) {
      return res.status(400).json({ error: "Bus ID already exists" });
    }

    // Check if bus number already exists (excluding current bus)
    if (updateData.busNumber && buses.find(b => b.busNumber === updateData.busNumber && b.id !== id)) {
      return res.status(400).json({ error: "Bus number already exists" });
    }

    buses[busIndex] = {
      ...buses[busIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({ bus: buses[busIndex] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update bus" });
  }
};

// DELETE /api/admin/buses/:id - Delete bus
export const deleteBus: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;

    const busIndex = buses.findIndex(b => b.id === id);
    if (busIndex === -1) {
      return res.status(404).json({ error: "Bus not found" });
    }

    buses.splice(busIndex, 1);
    res.json({ message: "Bus deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bus" });
  }
};

// Legacy functions for existing API compatibility
export const searchBusByNumber: RequestHandler = (req, res) => {
  res.json({ buses: [], total: 0 });
};

export const searchRoutesBetweenStops: RequestHandler = (req, res) => {
  res.json({ routes: [], total: 0 });
};

export const getAllStops: RequestHandler = (req, res) => {
  res.json({ stops: [] });
};

export const getAllRoutes: RequestHandler = (req, res) => {
  res.json({ routes: [] });
};

export const getRouteById: RequestHandler = (req, res) => {
  res.json({ route: null });
};

export const getDashboardStats: RequestHandler = (req, res) => {
  res.json({
    activeBuses: buses.filter(b => b.busStatus === "Active").length,
    totalRoutes: 0,
    crewMembers: 0,
    dailyPassengers: 0,
    pendingAds: 0
  });
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