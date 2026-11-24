/**
 * Root entrypoint delegating to modular server initialization.
 * Preserves compatibility with existing npm start/dev commands and tools.
 */

import "./src/server.js";
export { app } from "./src/app.js";
export { startServer, stopServer } from "./src/server.js";
