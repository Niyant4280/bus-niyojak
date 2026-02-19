const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import models
const GTFSStop = require("../models/GTFSStop");

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB successfully");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

const GTFS_DATA_PATH = path.join(__dirname, "../../routes");

// Import stops only
async function importStopsOnly() {
  try {
    console.log("🔄 Importing stops only...");
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
      location: {
        type: "Point",
        coordinates: [parseFloat(stop.stop_lon), parseFloat(stop.stop_lat)]
      }
    }));

    await GTFSStop.insertMany(stops);
    console.log(`✅ Imported ${stops.length} stops`);
    
  } catch (error) {
    console.error("❌ Error importing stops:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

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

// Run import
importStopsOnly(); 