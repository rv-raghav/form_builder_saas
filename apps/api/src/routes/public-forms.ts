import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  publicFormsService,
  FormsError,
} from "@repo/services/forms";

const publicFormsRouter = Router();

function handlePublicError(err: unknown, res: import("express").Response) {
  if (err instanceof FormsError) {
    const { fieldErrors, code } = err.options ?? {};
    res.status(err.statusCode).json({
      detail: err.message,
      ...(code ? { code } : {}),
      ...(fieldErrors ? { errors: fieldErrors } : {}),
    });
    return;
  }
  throw err;
}

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many submissions. Please try again later." },
});

const exploreLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

publicFormsRouter.get("/public/explore/", exploreLimiter, async (_req, res) => {
  try {
    const items = await publicFormsService.listExplore();
    res.json({ results: items });
  } catch (err) {
    handlePublicError(err, res);
  }
});

publicFormsRouter.get("/public/forms/:slug/", async (req, res) => {
  try {
    const form = await publicFormsService.getBySlug(req.params.slug);
    res.json(form);
  } catch (err) {
    handlePublicError(err, res);
  }
});

publicFormsRouter.post(
  "/public/forms/:slug/submit/",
  submitLimiter,
  async (req, res) => {
    try {
      const result = await publicFormsService.submit(req.params.slug, req.body);
      res.status(201).json({ success: true, id: result.id });
    } catch (err) {
      handlePublicError(err, res);
    }
  },
);

export { publicFormsRouter };
