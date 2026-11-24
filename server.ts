/**
 * Root server proxy delegating to src/server.ts.
 */

import "./src/server.ts";
export { app } from "./src/app.ts";
export { startServer, stopServer } from "./src/server.ts";
