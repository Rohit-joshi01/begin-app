import config from "./config/env.js";
import { connectDB, disconnectDB } from "./infrastructure/database/connection.js";
import app from "./app.js";

/**
 * Server lifecycle controller.
 * Initializes database connectivity, starts HTTP listener,
 * and orchestrates graceful shutdown routines.
 */

let server: any = null;

export async function startServer(): Promise<any> {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`Begin backend started in ${config.env} mode at http://localhost:${config.port}`);
    });

    return server;
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

export async function stopServer(): Promise<void> {
  if (server) {
    await new Promise<void>((resolve) => server.close(resolve));
    console.log("HTTP server closed.");
  }
  await disconnectDB();
}

// Graceful shutdown listeners
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Starting graceful shutdown...");
  await stopServer();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received. Starting graceful shutdown...");
  await stopServer();
  process.exit(0);
});

// Run directly when executed
if (process.argv[1] && (process.argv[1].endsWith("server.js") || process.argv[1].endsWith("server.ts") || process.argv[1].endsWith("index.js") || process.argv[1].endsWith("index.ts"))) {
  startServer();
}

export default server;
