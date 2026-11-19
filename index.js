import express from "express";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./database/connection.js";
import authRoutes from "./routes/auth.routes.js";
import appRoutes from "./routes/app.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ─── Database ─────────────────────────────────────────────────────────────────
connectDB();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.static(path.resolve("./public")));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ─── View Engine ──────────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/", appRoutes);
app.use("/auth", authRoutes);

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
