import mongoose from "mongoose";
import config from "../../../config/env.js";

/**
 * Database infrastructure layer handling MongoDB connections,
 * monitoring event listeners, and graceful disconnects.
 */

export const connectDB = async (customUri: string | null = null): Promise<typeof mongoose> => {
  try {
    const mongoUri = customUri || config.database.mongoUri;

    if (!mongoUri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed cleanly.");
  } catch (error: any) {
    console.error(`MongoDB Disconnect Error: ${error.message}`);
  }
};

// Event listeners for connection monitoring
(mongoose.connection as any).on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

(mongoose.connection as any).on("error", (err: any) => {
  console.error(`MongoDB Runtime Error: ${err.message}`);
});

export default connectDB;
