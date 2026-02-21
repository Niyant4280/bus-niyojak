import { createServer } from "../server/index";
import express from "express";

let app;
try {
    app = createServer();
} catch (error) {
    console.error("Failed to initialize Express app:", error);
    app = express();
    app.all("*", (req, res) => {
        res.status(500).json({
            error: "Server initialization failed",
            message: error instanceof Error ? error.message : "Unknown error"
        });
    });
}

export default app;
