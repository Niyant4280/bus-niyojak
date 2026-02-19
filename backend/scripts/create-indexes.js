const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

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

async function createIndexes() {
  try {
    console.log("🔧 Creating geospatial indexes...");
    
    // Wait for connection to be ready
    await mongoose.connection.asPromise();
    
    // Get the database instance
    const db = mongoose.connection.db;
    
    // Create 2dsphere index for stops
    console.log("📍 Creating 2dsphere index for stops...");
    await db.collection("gtfsstops").createIndex({ location: "2dsphere" });
    console.log("✅ 2dsphere index created for stops");
    
    // Create other useful indexes
    console.log("🔍 Creating search indexes...");
    await db.collection("gtfsstops").createIndex({ stop_name: "text" });
    await db.collection("gtfsroutes").createIndex({ route_short_name: "text", route_long_name: "text" });
    console.log("✅ Text search indexes created");
    
    console.log("🎉 All indexes created successfully!");
    
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Run the script
createIndexes(); 