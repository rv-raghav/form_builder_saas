import type { Request, Response, NextFunction } from "express";
import { CSRF_COOKIE } from "../lib/cookies";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[CSRF_COOKIE] as string | undefined;
  const headerToken = req.get("X-CSRFToken");

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ detail: "CSRF verification failed." });
    return;
  }

  next();
}
