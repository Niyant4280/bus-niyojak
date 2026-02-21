import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();

function listFiles(dir: string, depth = 0): any[] {
    if (depth > 2) return ['...'];
    try {
        const items = fs.readdirSync(dir);
        return items.map(item => {
            const fullPath = path.join(dir, item);
            const isDir = fs.statSync(fullPath).isDirectory();
            return {
                name: item,
                type: isDir ? 'dir' : 'file',
                children: isDir ? listFiles(fullPath, depth + 1) : undefined
            };
        });
    } catch (e) {
        return [String(e)];
    }
}

app.get('*', async (req, res) => {
    try {
        const taskDir = '/var/task';
        const structure = listFiles(taskDir);

        res.status(200).json({
            status: 'DEBUG_OK',
            cwd: process.cwd(),
            taskDir,
            structure
        });
    } catch (error) {
        res.status(500).json({
            status: 'DEBUG_ERROR',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});

export default app;
