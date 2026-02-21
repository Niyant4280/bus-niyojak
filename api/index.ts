import express from "express";

let app;

export default async function (req, res) {
    try {
        if (!app) {
            console.log("[Vercel] Lazy-loading server modules...");
            const { createServer } = await import("../server/index");
            app = createServer();
            console.log("[Vercel] Express app initialized");
        }
        return app(req, res);
    } catch (error) {
        console.error("[Vercel] FATAL Initialization Error:", error);

        // Return a JSON error even if the main app fails to load
        if (!res.headersSent) {
            res.status(500).json({
                error: "Vercel function initialization failed",
                details: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                path: req.url
            });
        }
    }
}
