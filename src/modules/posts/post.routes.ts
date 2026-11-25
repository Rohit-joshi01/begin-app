import { Router } from "express";
import { handleGetPostAdd } from "./post.controller.ts";

const router = Router();

router.get("/new", handleGetPostAdd);

export default router;
