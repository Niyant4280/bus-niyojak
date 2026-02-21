import { createServer } from "../server/index.js";
import express from "express";

let app;

export default (req, res) => {
    try {
        if (!app) {
            console.log("[Vercel] Bootstrapping Express app...");
            app = createServer();
            console.log("[Vercel] App ready");
        }
        return app(req, res);
    } catch (error) {
        console.error("[Vercel] FATAL Runtime Error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                error: "Vercel function runtime failure",
                details: error instanceof Error ? error.message : String(error),
                path: req.url
            });
        }
    }
};
