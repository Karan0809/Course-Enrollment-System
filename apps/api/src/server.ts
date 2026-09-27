import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

const port = env.port;

async function startServer(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required. Set it in your environment before starting the server.');
  }

  await connectDatabase();

  app.listen(port, () => {
    console.log(`API server running on http://localhost:${port}`);
  });
}

startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown server startup error';
  console.error(message);
  process.exit(1);
});
