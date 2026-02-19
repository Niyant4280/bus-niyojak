const express = require("express");
const router = express.Router();
const GTFSRoute = require("../models/GTFSRoute");
const GTFSStop = require("../models/GTFSStop");
const GTFSTrip = require("../models/GTFSTrip");
const GTFSStopTime = require("../models/GTFSStopTime");
const GTFSCalendar = require("../models/GTFSCalendar");

// Search buses between two locations
router.post("/search", async (req, res) => {
  try {
    const { from, to, date, time, passengers = 1, wheelchair = false } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: "From and to locations are required"
      });
    }

    // Parse date and time
    const searchDate = date ? new Date(date) : new Date();
    const searchTime = time || new Date().toTimeString().slice(0, 5);
    const dayOfWeek = searchDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Find stops by name or coordinates
    let fromStop, toStop;

    if (typeof from === "object" && from.lat && from.lng) {
      // Search by coordinates
      fromStop = await GTFSStop.findOne({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [from.lng, from.lat]
            },
            $maxDistance: 2000 // 2km radius
          }
        }
      });
    } else {
      // Search by name
      fromStop = await GTFSStop.findOne({
        stop_name: { $regex: from, $options: "i" },
        isActive: true
      });
    }

    if (typeof to === "object" && to.lat && to.lng) {
      toStop = await GTFSStop.findOne({
        isActive: true,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [to.lng, to.lat]
            },
            $maxDistance: 2000
          }
        }
      });
    } else {
      toStop = await GTFSStop.findOne({
        stop_name: { $regex: to, $options: "i" },
        isActive: true
      });
    }

    if (!fromStop || !toStop) {
      return res.status(404).json({
        success: false,
        message: "One or both locations not found"
      });
    }

    // Get available service IDs for the day
    const dayMap = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayMap[dayOfWeek];
    
    const availableServices = await GTFSCalendar.find({
      isActive: true,
      [dayName]: 1,
      start_date: { $lte: searchDate.toISOString().slice(0, 10).replace(/-/g, "") },
      end_date: { $gte: searchDate.toISOString().slice(0, 10).replace(/-/g, "") }
    }).distinct("service_id");

    if (availableServices.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No service available on this day"
      });
    }

    // Find trips that pass through both stops
    const fromStopTimes = await GTFSStopTime.find({ 
      stop_id: fromStop.stop_id 
    });
    const toStopTimes = await GTFSStopTime.find({ 
      stop_id: toStop.stop_id 
    });

    const fromTripIds = fromStopTimes.map(st => st.trip_id);
    const toTripIds = toStopTimes.map(st => st.trip_id);

    // Find common trips
    const commonTripIds = fromTripIds.filter(id => toTripIds.includes(id));

    if (commonTripIds.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: "No direct routes found between these locations"
      });
    }

          // Get trip details with route information
      const trips = await GTFSTrip.find({ 
        trip_id: { $in: commonTripIds },
        service_id: { $in: availableServices },
        isActive: true 
      });

      // Get route details for these trips
      const routeIds = [...new Set(trips.map(t => t.route_id))];
      const routes = await GTFSRoute.find({ 
        route_id: { $in: routeIds },
        isActive: true 
      });

      // Create a map for quick route lookup
      const routeMap = {};
      routes.forEach(route => {
        routeMap[route.route_id] = route;
      });

    // Filter trips by time and create search results
    const searchResults = [];
    
    for (const trip of trips) {
      const fromStopTime = fromStopTimes.find(st => st.trip_id === trip.trip_id);
      const toStopTime = toStopTimes.find(st => st.trip_id === trip.trip_id);
      
      if (!fromStopTime || !toStopTime) continue;

      // Check if departure time is after current time
      if (fromStopTime.departure_time < searchTime) continue;

      // Calculate duration
      const duration = calculateDuration(fromStopTime.departure_time, toStopTime.arrival_time);
      
      // Get route information
      const route = routeMap[trip.route_id];
      if (!route) continue;
      
      // Calculate frequency (mock data for now)
      const frequency = getFrequency(route);
      
      // Calculate next departure
      const nextDeparture = fromStopTime.departure_time;
      
      // Get all stops for this trip
      const tripStops = await GTFSStopTime.find({ 
        trip_id: trip.trip_id 
      }).sort({ stop_sequence: 1 });

      // Get stop details for this trip
      const stopIds = tripStops.map(st => st.stop_id);
      const stopsData = await GTFSStop.find({ 
        stop_id: { $in: stopIds },
        isActive: true 
      });

      // Create a map for quick stop lookup
      const stopMap = {};
      stopsData.forEach(stop => {
        stopMap[stop.stop_id] = stop;
      });

      const stops = tripStops.map(st => {
        const stopData = stopMap[st.stop_id];
        return {
          id: st.stop_id,
          name: stopData ? stopData.stop_name : st.stop_id,
          lat: stopData ? stopData.stop_lat : 0,
          lng: stopData ? stopData.stop_lon : 0,
          arrivalTime: st.arrival_time,
          departureTime: st.departure_time
        };
      });

      // Check wheelchair accessibility
      if (wheelchair && trip.wheelchair_accessible !== 1) continue;

      searchResults.push({
        tripId: trip.trip_id,
        routeId: route.route_id,
        busNumber: route.route_short_name,
        routeName: route.route_long_name,
        from: fromStop.stop_name,
        to: toStop.stop_name,
        stops: stops,
        frequency: frequency,
        nextDeparture: nextDeparture,
        duration: duration,
        isActive: true,
        rating: 4.5, // Mock rating
        capacity: 50, // Mock capacity
        currentPassengers: Math.floor(Math.random() * 30) + 10, // Mock passenger count
        wheelchairAccessible: trip.wheelchair_accessible === 1,
        bikesAllowed: trip.bikes_allowed === 1,
        price: calculatePrice(duration), // Mock price calculation
        estimatedArrival: toStopTime.arrival_time
      });
    }

    // Sort by departure time
    searchResults.sort((a, b) => a.nextDeparture.localeCompare(b.nextDeparture));

    res.json({
      success: true,
      data: searchResults,
      searchInfo: {
        from: fromStop.stop_name,
        to: toStop.stop_name,
        date: searchDate.toISOString().slice(0, 10),
        time: searchTime,
        totalResults: searchResults.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching buses",
      error: error.message
    });
  }
});

// Get route details with stops
router.get("/routes/:routeId/details", async (req, res) => {
  try {
    const { routeId } = req.params;
    const { service_id, direction_id } = req.query;

    // Get route information
    const route = await GTFSRoute.findOne({ 
      route_id: routeId,
      isActive: true 
    });

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    // Get trips for this route
    let tripQuery = { 
      route_id: routeId,
      isActive: true 
    };
    
    if (service_id) tripQuery.service_id = service_id;
    if (direction_id !== undefined) tripQuery.direction_id = parseInt(direction_id);

    const trips = await GTFSTrip.find(tripQuery);

    if (trips.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No trips found for this route"
      });
    }

    // Get a sample trip to show stops
    const sampleTrip = trips[0];
    const stopTimes = await GTFSStopTime.find({ 
      trip_id: sampleTrip.trip_id 
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

    const stops = stopTimes.map(st => {
      const stopData = stopMap[st.stop_id];
      return {
        id: st.stop_id,
        name: stopData ? stopData.stop_name : st.stop_id,
        lat: stopData ? stopData.stop_lat : 0,
        lng: stopData ? stopData.stop_lon : 0,
        arrivalTime: st.arrival_time,
        departureTime: st.departure_time,
        sequence: st.stop_sequence
      };
    });

    // Get route statistics
    const totalTrips = trips.length;
    const totalStops = stops.length;
    const estimatedDuration = calculateDuration(stops[0].departureTime, stops[stops.length - 1].arrivalTime);

    res.json({
      success: true,
      data: {
        route: route,
        stops: stops,
        statistics: {
          totalTrips,
          totalStops,
          estimatedDuration,
          frequency: getFrequency(route),
          operatingDays: getOperatingDays(route.route_id)
        },
        trips: trips.slice(0, 10) // Limit to first 10 trips
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching route details",
      error: error.message
    });
  }
});

// Get real-time bus locations (mock data for now)
router.get("/realtime/:routeId", async (req, res) => {
  try {
    const { routeId } = req.params;
    
    // Mock real-time data
    const realtimeData = {
      routeId,
      buses: [
        {
          busId: "BUS001",
          currentStop: "Central Station",
          nextStop: "City Mall",
          estimatedArrival: "5 min",
          passengers: Math.floor(Math.random() * 40) + 10,
          location: {
            lat: 28.6448 + (Math.random() - 0.5) * 0.01,
            lng: 77.216721 + (Math.random() - 0.5) * 0.01
          },
          status: "on_time", // on_time, delayed, early
          speed: Math.floor(Math.random() * 30) + 20 // km/h
        }
      ],
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: realtimeData
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching real-time data",
      error: error.message
    });
  }
});

// Helper functions
function calculateDuration(departureTime, arrivalTime) {
  const dep = parseTime(departureTime);
  const arr = parseTime(arrivalTime);
  
  let diff = arr - dep;
  if (diff < 0) diff += 24 * 60; // Handle overnight trips
  
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} hr`;
  return `${hours} hr ${minutes} min`;
}

function parseTime(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getFrequency(route) {
  // Mock frequency based on route type
  const routeTypes = {
    "R": "Every 5-10 min", // Rapid
    "Y": "Every 8-12 min", // Yellow
    "B": "Every 10-15 min", // Blue
    "G": "Every 12-18 min", // Green
    "V": "Every 15-20 min", // Violet
    "M": "Every 15-20 min", // Magenta
    "A": "Every 20-25 min", // Aqua
    "O": "Every 30-45 min"  // Orange/Airport
  };
  
  const routePrefix = route.route_short_name?.charAt(0) || "G";
  return routeTypes[routePrefix] || "Every 15-20 min";
}

function getOperatingDays(routeId) {
  // Mock operating days
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
}

function calculatePrice(duration) {
  // Mock price calculation based on duration
  const durationInMinutes = parseInt(duration);
  if (durationInMinutes <= 30) return 20;
  if (durationInMinutes <= 60) return 35;
  if (durationInMinutes <= 90) return 50;
  return 65;
}

module.exports = router; 