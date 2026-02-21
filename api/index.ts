console.log("[Vercel] API Entry Point Initializing...");

let app;
try {
    const { createServer } = await import("../server/index");
    console.log("[Vercel] createServer imported successfully");
    app = createServer();
    console.log("[Vercel] Express app created successfully");
} catch (error) {
    console.error("[Vercel] FATAL: Failed to initialize Express app:", error);
    const express = (await import("express")).default;
    app = express();
    app.all("*", (req, res) => {
        console.error(`[Vercel] Request to ${req.url} failed due to previous initialization error`);
        res.status(500).json({
            error: "Server initialization failed",
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });
    });
}

export default app;
