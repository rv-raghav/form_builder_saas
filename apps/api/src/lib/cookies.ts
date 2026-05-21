import type { CookieOptions, Response } from "express";
import { env } from "../env";

export const SESSION_COOKIE = "session_id";
export const CSRF_COOKIE = "csrftoken";

function baseCookieOptions(maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE ?? false,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: maxAgeMs,
    path: "/",
  };
}

export function setSessionCookie(
  res: Response,
  token: string,
  expiresAt: Date,
): void {
  const maxAge = expiresAt.getTime() - Date.now();
  res.cookie(SESSION_COOKIE, token, baseCookieOptions(maxAge));
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    path: "/",
    domain: env.COOKIE_DOMAIN || undefined,
  });
}

export function setCsrfCookie(res: Response, token: string): void {
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: env.COOKIE_SECURE ?? false,
    sameSite: "lax",
    domain: env.COOKIE_DOMAIN || undefined,
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
}
