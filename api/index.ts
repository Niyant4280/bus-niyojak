import { createServer } from "../server/index";

import express from "express";
import mongoose from "mongoose";

let app;
try {
    // Attempt database connection if URI exists
    const mongodbUri = process.env.MONGODB_URI;
    if (mongodbUri) {
        mongoose.connect(mongodbUri).catch(err => {
            console.error("MongoDB background connection failed:", err);
        });
    }

    app = createServer();
} catch (error) {
    console.error("Failed to initialize Express app:", error);
    // Fallback app if creation fails
    app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Server initialization failed",
            message: error instanceof Error ? error.message : "Unknown error",
            dbStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
        });
    });
}

export default app;
