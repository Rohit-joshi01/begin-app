import { seedDatabase } from "../src/infrastructure/database/seed.ts";
import mongoose from "mongoose";

seedDatabase()
  .then(() => {
    mongoose.connection.close();
    process.exit(0);
  })
  .catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
