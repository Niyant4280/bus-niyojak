import express from 'express';
import mongoose from 'mongoose';

const app = express();

app.get('*', async (req, res) => {
    try {
        const dbStatus = mongoose.connection.readyState;
        res.status(200).json({
            status: 'DEBUG_OK',
            message: 'Isolated debug function is running',
            env: {
                NODE_ENV: process.env.NODE_ENV,
                HAS_MONO_URI: !!process.env.MONGODB_URI
            },
            database: {
                state: dbStatus,
                stateName: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbStatus] || 'unknown'
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'DEBUG_ERROR',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

export default app;
