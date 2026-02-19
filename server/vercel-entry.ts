import { createServer } from "./index";

// Export the Express app for use as a Vercel serverless function
// This does NOT call app.listen() - Vercel handles that
const app = createServer();

export default app;
export { createServer };
