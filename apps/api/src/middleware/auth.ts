import type { Request, Response, NextFunction } from "express";
import { authService } from "@repo/services/auth";
import type { AuthUserDto } from "@repo/services/auth";
import { SESSION_COOKIE } from "../lib/cookies";
import { SESSION_COOKIE_NAME } from "@repo/services/auth";

export type AuthedRequest = Request & { user?: AuthUserDto };

function getSessionToken(req: Request): string | undefined {
  return (
    req.cookies?.[SESSION_COOKIE] ??
    req.cookies?.[SESSION_COOKIE_NAME]
  );
}

export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await authService.me(getSessionToken(req));
  if (!user) {
    res.status(401).json({ detail: "Authentication credentials were not provided." });
    return;
  }
  req.user = user;
  next();
}

export function requireAdmin(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): void {
  if (!req.user) {
    res.status(401).json({ detail: "Authentication credentials were not provided." });
    return;
  }
  if (req.user.role !== "admin" && req.user.role !== "superadmin") {
    res.status(403).json({ detail: "You do not have permission to perform this action." });
    return;
  }
  next();
}
