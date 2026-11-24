import { Router } from "express";
import { renderHomePage } from "./home.controller.ts";
import { requireOnboarded } from "../../middleware/auth.middleware.ts";

const router = Router();

router.get("/", requireOnboarded, renderHomePage);

export default router;
