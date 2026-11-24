import express, { Application } from "express";
import path from "path";
import cookieParser from "cookie-parser";

import { attachUser } from "./middleware/auth.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

import authRoutes from "./modules/auth/index.js";
import onboardingRoutes from "./modules/onboarding/index.js";
import profileRoutes from "./modules/profiles/index.js";
import startupRoutes from "./modules/startups/index.js";
import discoveryRoutes from "./modules/discovery/index.js";
import postRoutes from "./modules/posts/index.js";
import homeRoutes from "./modules/home/index.js";

/**
 * Express application factory configuring middleware pipelines,
 * template rendering engines, static public folders, and module routes.
 */

export function createApp(): Application {
  const app = express();

  // Static assets
  app.use(express.static("public"));
  app.use(express.static(path.resolve("./public")));

  // Request parsing
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use(cookieParser());

  // Template engine
  app.set("view engine", "ejs");
  app.set("views", path.resolve("./views"));

  // Global authentication session attachment
  app.use(attachUser);

  // Feature module route registrations
  app.use("/post", postRoutes);
  app.use("/api/auth", authRoutes);
  app.use("/auth", authRoutes);
  app.use("/user", authRoutes);
  app.use("/onboarding", onboardingRoutes);
  app.use("/profile", profileRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/startup", startupRoutes);
  app.use("/api/startup", startupRoutes);
  app.use("/discovery", discoveryRoutes);
  app.use("/api/discovery", discoveryRoutes);
  app.use("/", homeRoutes);

  // Centralized error handling middleware
  app.use(errorHandler);

  return app;
}

export const app: Application = createApp();
export default app;
