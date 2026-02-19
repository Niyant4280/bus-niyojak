const express = require("express");
const router = express.Router();
const GTFSRoute = require("../models/GTFSRoute");
const GTFSStop = require("../models/GTFSStop");
const GTFSTrip = require("../models/GTFSTrip");
const GTFSStopTime = require("../models/GTFSStopTime");
const GTFSCalendar = require("../models/GTFSCalendar");
const GTFSShape = require("../models/GTFSShape");

// Get all routes
router.get("/routes", async (req, res) => {
  try {
    const { page = 1, limit = 50, search, type } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { route_short_name: { $regex: search, $options: "i" } },
        { route_long_name: { $regex: search, $options: "i" } }
      ];
    }
    
    if (type) {
      query.route_type = parseInt(type);
    }

    const routes = await GTFSRoute.find(query)
      .sort({ route_sort_order: 1, route_short_name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GTFSRoute.countDocuments(query);

    res.json({
      success: true,
      data: routes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching routes",
      error: error.message
    });
  }
});

// Get route by ID
router.get("/routes/:routeId", async (req, res) => {
  try {
    const route = await GTFSRoute.findOne({ 
      route_id: req.params.routeId,
      isActive: true 
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    res.json({
      success: true,
      data: route
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching route",
      error: error.message
    });
  }
});

// Get all stops
router.get("/stops", async (req, res) => {
  try {
    const { page = 1, limit = 100, search, lat, lng, radius = 5 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isActive: true };
    
    if (search) {
      query.stop_name = { $regex: search, $options: "i" };
    }
    
    if (lat && lng) {
      // Geospatial search within radius (in km)
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      };
    }

    const stops = await GTFSStop.find(query)
      .sort({ stop_name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await GTFSStop.countDocuments(query);

    res.json({
      success: true,
      data: stops,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stops",
      error: error.message
    });
  }
});

// Get stop by ID
router.get("/stops/:stopId", async (req, res) => {
  try {
    const stop = await GTFSStop.findOne({ 
      stop_id: req.params.stopId,
      isActive: true 
    });

    if (!stop) {
      return res.status(404).json({
        success: false,
        message: "Stop not found"
      });
    }

    res.json({
      success: true,
      data: stop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stop",
      error: error.message
    });
  }
});

// Get trips for a route
router.get("/routes/:routeId/trips", async (req, res) => {
  try {
    const { service_id, direction_id } = req.query;
    
    let query = { 
      route_id: req.params.routeId,
      isActive: true 
    };
    
    if (service_id) {
      query.service_id = service_id;
    }
    
    if (direction_id !== undefined) {
      query.direction_id = parseInt(direction_id);
    }

    const trips = await GTFSTrip.find(query)
      .sort({ trip_id: 1 });

    res.json({
      success: true,
      data: trips
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching trips",
      error: error.message
    });
  }
});

// Get stop times for a trip
router.get("/trips/:tripId/stops", async (req, res) => {
  try {
    const stopTimes = await GTFSStopTime.find({ 
      trip_id: req.params.tripId 
    }).sort({ stop_sequence: 1 });

    // Get stop details for this trip
    const stopIds = stopTimes.map(st => st.stop_id);
    const stopsData = await GTFSStop.find({ 
      stop_id: { $in: stopIds },
      isActive: true 
    });

    // Create a map for quick stop lookup
    const stopMap = {};
    stopsData.forEach(stop => {
      stopMap[stop.stop_id] = stop;
    });

    // Add stop data to stop times
    const stopTimesWithData = stopTimes.map(st => ({
      ...st.toObject(),
      stop_id: {
        stop_id: st.stop_id,
        stop_name: stopMap[st.stop_id]?.stop_name || st.stop_id,
        stop_lat: stopMap[st.stop_id]?.stop_lat || 0,
        stop_lon: stopMap[st.stop_id]?.stop_lon || 0
      }
    }));

    res.json({
      success: true,
      data: stopTimes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching stop times",
      error: error.message
    });
  }
});

// Get route shape
router.get("/routes/:routeId/shape", async (req, res) => {
  try {
    // Get trips for the route
    const trips = await GTFSTrip.find({ 
      route_id: req.params.routeId,
      isActive: true 
    }).distinct("shape_id");

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No shape data found for this route"
      });
    }

    // Get shape points for the first available shape
    const shapeId = trips[0];
    const shapePoints = await GTFSShape.find({ 
      shape_id: shapeId 
    })
    .sort({ shape_pt_sequence: 1 });

    res.json({
      success: true,
      data: {
        shape_id: shapeId,
        points: shapePoints
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching route shape",
      error: error.message
    });
  }
});

// Search routes between two stops
router.get("/search", async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and to parameters are required"
      });
    }

    // Find stops by name
    const fromStop = await GTFSStop.findOne({
      stop_name: { $regex: from, $options: "i" },
      isActive: true
    });

    const toStop = await GTFSStop.findOne({
      stop_name: { $regex: to, $options: "i" },
      isActive: true
    });

    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: "One or both stops not found"
      });
    }

    // Find trips that pass through both stops
    const fromStopTimes = await GTFSStopTime.find({ stop_id: fromStop.stop_id });
    const toStopTimes = await GTFSStopTime.find({ stop_id: toStop.stop_id });

    const fromTripIds = fromStopTimes.map(st => st.trip_id);
    const toTripIds = toStopTimes.map(st => st.trip_id);

    // Find common trips
    const commonTripIds = fromTripIds.filter(id => toTripIds.includes(id));

    if (commonTripIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No direct routes found between these stops"
      });
    }

    // Get trip details
    const trips = await GTFSTrip.find({ 
      trip_id: { $in: commonTripIds },
      isActive: true 
    });

    // Get route details
    const routeIds = [...new Set(trips.map(t => t.route_id))];
    const routes = await GTFSRoute.find({ 
      route_id: { $in: routeIds },
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        from: fromStop,
        to: toStop,
        routes: routes,
        trips: trips
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching routes",
      error: error.message
    });
  }
});

// Get nearby stops
router.get("/stops/nearby", async (req, res) => {
  try {
    const { lat, lng, radius = 2 } = req.query; // Default 2km radius
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required"
      });
    }

    const nearbyStops = await GTFSStop.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      }
    })
    .sort({ location: 1 })
    .limit(20);

    res.json({
      success: true,
      data: nearbyStops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching nearby stops",
      error: error.message
    });
  }
});

// Get service calendar
router.get("/calendar", async (req, res) => {
  try {
    const calendar = await GTFSCalendar.find({ isActive: true });
    
    res.json({
      success: true,
      data: calendar
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching calendar",
      error: error.message
    });
  }
});

// Get route statistics
router.get("/stats", async (req, res) => {
  try {
    const routeCount = await GTFSRoute.countDocuments({ isActive: true });
    const stopCount = await GTFSStop.countDocuments({ isActive: true });
    const tripCount = await GTFSTrip.countDocuments({ isActive: true });
    const stopTimeCount = await GTFSStopTime.countDocuments();
    const shapeCount = await GTFSShape.countDocuments();

    res.json({
      success: true,
      data: {
        routes: routeCount,
        stops: stopCount,
        trips: tripCount,
        stopTimes: stopTimeCount,
        shapes: shapeCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message
    });
  }
});

module.exports = router; 