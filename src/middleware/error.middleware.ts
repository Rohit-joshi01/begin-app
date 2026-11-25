import type { Request, Response, NextFunction } from "express";
import config from "../config/env.ts";

/**
 * Global application error handler.
 * Distinguishes between operational errors and uncaught exceptions,
 * providing JSON or rendered error pages depending on request context.
 */

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";

  if (config.env === "development") {
    console.error(`[ERROR ${statusCode}] ${req.method} ${req.url}:`, err);
  }

  // If request expects JSON or is an API route, send JSON payload
  if (req.xhr || req.headers.accept?.includes("application/json") || req.path?.startsWith("/api/")) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(err.details ? { details: err.details } : {}),
      ...(config.env === "development" ? { stack: err.stack } : {}),
    });
  }

  // Otherwise render user-friendly error view
  return res.status(statusCode).render("error", {
    message,
  });
};
