import type { Request, Response, NextFunction } from "express";
import { CSRF_COOKIE } from "../lib/cookies";
import { logger } from "@repo/logger";

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
    logger.warn(
      `CSRF verification failed for ${req.method} ${req.originalUrl}. ` +
        `Cookie token: ${cookieToken ? "[PRESENT]" : "[MISSING]"}, ` +
        `Header token: ${headerToken ? "[PRESENT]" : "[MISSING]"}, ` +
        `Match: ${cookieToken && headerToken && cookieToken === headerToken}`
    );
    res.status(403).json({ detail: "CSRF verification failed." });
    return;
  }

  next();
}
