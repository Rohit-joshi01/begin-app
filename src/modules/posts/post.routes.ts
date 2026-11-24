import { Router } from "express";
import { handleGetPostAdd } from "./post.controller.js";

const router = Router();

router.get("/new", handleGetPostAdd);

export default router;
