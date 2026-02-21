import { createServer } from "../server/index";
import express from "express";

let app;

export default (req, res) => {
    try {
        if (!app) {
            console.log("[Vercel] Initializing Express app...");
            app = createServer();
            console.log("[Vercel] Express app initialized");
        }
        return app(req, res);
    } catch (error) {
        console.error("[Vercel] FATAL Execution Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                error: "Vercel function execution failed",
                details: error instanceof Error ? error.message : String(error),
                path: req.url
            });
        }
    }
};
