import { createServer } from "../server/index";
import express from "express";

console.log("[Vercel] API Entry Point Initializing with Static Import...");

let app;
try {
    app = createServer();
    console.log("[Vercel] Express app initialized successfully");
} catch (error) {
    console.error("[Vercel] FATAL Initialization Error:", error);
    app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Vercel function initialization failed",
            details: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    });
}

export default app;
