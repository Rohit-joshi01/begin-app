/**
 * Root server proxy delegating to src/server.ts.
 */

import "./src/server.js";
export { app } from "./src/app.js";
export { startServer, stopServer } from "./src/server.js";
