import { createServer } from "../server/index";
import express from "express";

console.log("[Vercel] API Entry Point Initializing with Static Imports...");

let app;
try {
    app = createServer();
    console.log("[Vercel] Express app created successfully");
} catch (error) {
    console.error("[Vercel] FATAL: Failed to initialize Express app:", error);
    app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Server initialization failed",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
    });
}

export default app;
