import { Router } from "express";
import { renderHomePage } from "./home.controller.js";
import { requireOnboarded } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/", requireOnboarded, renderHomePage);

export default router;
