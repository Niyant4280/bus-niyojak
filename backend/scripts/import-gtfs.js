const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const GTFSRoute = require("../models/GTFSRoute");
const GTFSStop = require("../models/GTFSStop");
const GTFSTrip = require("../models/GTFSTrip");
const GTFSStopTime = require("../models/GTFSStopTime");
const GTFSCalendar = require("../models/GTFSCalendar");
const GTFSShape = require("../models/GTFSShape");

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

const GTFS_DATA_PATH = path.join(__dirname, "../../routes");

// Helper function to read CSV file
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

// Import routes
async function importRoutes() {
  try {
    console.log("🔄 Importing routes...");
    const routesData = await readCSV(path.join(GTFS_DATA_PATH, "routes.csv"));
    
    // Clear existing routes
    await GTFSRoute.deleteMany({});
    
    const routes = routesData.map(route => ({
      route_id: route.route_id,
      agency_id: route.agency_id || "",
      route_short_name: route.route_short_name,
      route_long_name: route.route_long_name,
      route_desc: route.route_desc || "",
      route_type: parseInt(route.route_type) || 1,
      route_url: route.route_url || "",
      route_color: route.route_color || "",
      route_text_color: route.route_text_color || "",
      route_sort_order: parseInt(route.route_sort_order) || 0,
      continuous_pickup: route.continuous_pickup || "",
      continuous_drop_off: route.continuous_drop_off || "",
    }));

    await GTFSRoute.insertMany(routes);
    console.log(`✅ Imported ${routes.length} routes`);
  } catch (error) {
    console.error("❌ Error importing routes:", error);
  }
}

// Import stops
async function importStops() {
  try {
    console.log("🔄 Importing stops...");
    const stopsData = await readCSV(path.join(GTFS_DATA_PATH, "stops.csv"));
    
    // Clear existing stops
    await GTFSStop.deleteMany({});
    
    const stops = stopsData.map(stop => ({
      stop_id: stop.stop_id,
      stop_code: stop.stop_code || "",
      stop_name: stop.stop_name,
      stop_desc: stop.stop_desc || "",
      stop_lat: parseFloat(stop.stop_lat),
      stop_lon: parseFloat(stop.stop_lon),
    }));

    await GTFSStop.insertMany(stops);
    console.log(`✅ Imported ${stops.length} stops`);
  } catch (error) {
    console.error("❌ Error importing stops:", error);
  }
}

// Import calendar
async function importCalendar() {
  try {
    console.log("🔄 Importing calendar...");
    const calendarData = await readCSV(path.join(GTFS_DATA_PATH, "calendar.csv"));
    
    // Clear existing calendar
    await GTFSCalendar.deleteMany({});
    
    const calendar = calendarData.map(cal => ({
      service_id: cal.service_id,
      monday: parseInt(cal.monday),
      tuesday: parseInt(cal.tuesday),
      wednesday: parseInt(cal.wednesday),
      thursday: parseInt(cal.thursday),
      friday: parseInt(cal.friday),
      saturday: parseInt(cal.saturday),
      sunday: parseInt(cal.sunday),
      start_date: cal.start_date,
      end_date: cal.end_date,
    }));

    await GTFSCalendar.insertMany(calendar);
    console.log(`✅ Imported ${calendar.length} calendar entries`);
  } catch (error) {
    console.error("❌ Error importing calendar:", error);
  }
}

// Import trips
async function importTrips() {
  try {
    console.log("🔄 Importing trips...");
    const tripsData = await readCSV(path.join(GTFS_DATA_PATH, "trips.csv"));
    
    // Clear existing trips
    await GTFSTrip.deleteMany({});
    
    const trips = tripsData.map(trip => ({
      route_id: trip.route_id,
      service_id: trip.service_id,
      trip_id: trip.trip_id,
      trip_headsign: trip.trip_headsign || "",
      trip_short_name: trip.trip_short_name || "",
      direction_id: parseInt(trip.direction_id) || 0,
      block_id: trip.block_id || "",
      shape_id: trip.shape_id || "",
      wheelchair_accessible: parseInt(trip.wheelchair_accessible) || 0,
      bikes_allowed: parseInt(trip.bikes_allowed) || 0,
    }));

    await GTFSTrip.insertMany(trips);
    console.log(`✅ Imported ${trips.length} trips`);
  } catch (error) {
    console.error("❌ Error importing trips:", error);
  }
}

// Import stop times (in batches due to large size)
async function importStopTimes() {
  try {
    console.log("🔄 Importing stop times...");
    
    // Clear existing stop times
    await GTFSStopTime.deleteMany({});
    
    const batchSize = 500; // Reduced batch size for memory efficiency
    let processed = 0;
    let batch = [];
    
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path.join(GTFS_DATA_PATH, "stop_times.csv"))
        .pipe(csv());
      
      stream.on("data", (data) => {
        batch.push({
          trip_id: data.trip_id,
          arrival_time: data.arrival_time,
          departure_time: data.departure_time,
          stop_id: data.stop_id,
          stop_sequence: parseInt(data.stop_sequence),
          stop_headsign: data.stop_headsign || "",
          pickup_type: parseInt(data.pickup_type) || 0,
          drop_off_type: parseInt(data.drop_off_type) || 0,
          continuous_pickup: parseInt(data.continuous_pickup) || 0,
          continuous_drop_off: parseInt(data.continuous_drop_off) || 0,
          timepoint: parseInt(data.timepoint) || 1,
        });

        if (batch.length >= batchSize) {
          // Process batch asynchronously without blocking the stream
          const currentBatch = [...batch];
          batch = [];
          
          processBatch(currentBatch).catch(error => {
            console.error("❌ Error processing batch:", error);
          });
        }
      });
      
      stream.on("end", async () => {
        // Wait for all batches to complete
        if (batch.length > 0) {
          try {
            await GTFSStopTime.insertMany(batch);
            processed += batch.length;
          } catch (error) {
            console.error("❌ Error inserting final batch:", error);
          }
        }
        
        // Wait a bit for any remaining async operations
        setTimeout(() => {
          console.log(`✅ Imported ${processed} stop times`);
          resolve();
        }, 1000);
      });
      
      stream.on("error", reject);
    });
    
    async function processBatch(batchData) {
      try {
        await GTFSStopTime.insertMany(batchData);
        processed += batchData.length;
        console.log(`📊 Processed ${processed} stop times...`);
      } catch (error) {
        console.error("❌ Error inserting batch:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error importing stop times:", error);
  }
}

// Import shapes (in batches due to large size)
async function importShapes() {
  try {
    console.log("🔄 Importing shapes...");
    
    // Clear existing shapes
    await GTFSShape.deleteMany({});
    
    const batchSize = 500; // Reduced batch size for memory efficiency
    let processed = 0;
    let batch = [];
    
    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path.join(GTFS_DATA_PATH, "shapes.csv"))
        .pipe(csv());
      
      stream.on("data", (data) => {
        batch.push({
          shape_id: data.shape_id,
          shape_pt_lat: parseFloat(data.shape_pt_lat),
          shape_pt_lon: parseFloat(data.shape_pt_lon),
          shape_pt_sequence: parseInt(data.shape_pt_sequence),
          shape_dist_traveled: parseFloat(data.shape_dist_traveled) || 0,
        });

        if (batch.length >= batchSize) {
          // Process batch asynchronously without blocking the stream
          const currentBatch = [...batch];
          batch = [];
          
          processBatch(currentBatch).catch(error => {
            console.error("❌ Error processing batch:", error);
          });
        }
      });
      
      stream.on("end", async () => {
        // Wait for all batches to complete
        if (batch.length > 0) {
          try {
            await GTFSShape.insertMany(batch);
            processed += batch.length;
          } catch (error) {
            console.error("❌ Error inserting final batch:", error);
          }
        }
        
        // Wait a bit for any remaining async operations
        setTimeout(() => {
          console.log(`✅ Imported ${processed} shape points`);
          resolve();
        }, 1000);
      });
      
      stream.on("error", reject);
    });
    
    async function processBatch(batchData) {
      try {
        await GTFSShape.insertMany(batchData);
        processed += batchData.length;
        console.log(`📊 Processed ${processed} shape points...`);
      } catch (error) {
        console.error("❌ Error inserting batch:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error importing shapes:", error);
  }
}

// Main import function
async function importAllGTFSData() {
  try {
    console.log("🚀 Starting GTFS data import...");
    
    await importRoutes();
    await importStops();
    await importCalendar();
    await importTrips();
    await importStopTimes();
    await importShapes();
    
    console.log("🎉 GTFS data import completed successfully!");
    
    // Create indexes for better performance
    console.log("🔧 Creating database indexes...");
    await GTFSRoute.createIndexes();
    await GTFSStop.createIndexes();
    await GTFSTrip.createIndexes();
    await GTFSStopTime.createIndexes();
    await GTFSCalendar.createIndexes();
    await GTFSShape.createIndexes();
    
    console.log("✅ Database indexes created successfully!");
    
  } catch (error) {
    console.error("❌ Error during import:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run import if this script is executed directly
if (require.main === module) {
  importAllGTFSData();
}

module.exports = { importAllGTFSData }; 