import type { Request, Response } from "express";

/**
 * Controller handling post submission and presentation.
 */

export function handleGetPostAdd(req: Request, res: Response) {
  return res.render("addPost");
}
