/**
 * Root entrypoint delegating to modular server initialization.
 * Preserves compatibility with existing npm start/dev commands and tools.
 */

import "./src/server.ts";
export { app } from "./src/app.ts";
export { startServer, stopServer } from "./src/server.ts";
