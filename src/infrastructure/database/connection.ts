/**
 * Re-export proxy - kept for backward compatibility.
 * All new code should import from infrastructure/database/index.js.
 */
export { connectDB, disconnectDB } from "./mongodb/index.js";
export { default } from "./mongodb/connection.js";
