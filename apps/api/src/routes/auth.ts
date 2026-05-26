import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createHash, randomBytes } from "crypto";
import {
  authService,
  AuthError,
  SESSION_COOKIE_NAME,
} from "@repo/services/auth";
import { SESSION_COOKIE, setSessionCookie, clearSessionCookie, setCsrfCookie } from "../lib/cookies";
import { csrfProtection } from "../middleware/csrf";
import { env } from "../env";

const authRouter = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: "Too many requests. Please try again later." },
});

function generateCsrfToken(): string {
  return createHash("sha256")
    .update(randomBytes(32))
    .update(env.CSRF_SECRET)
    .digest("hex");
}

function getSessionToken(req: { cookies?: Record<string, string> }): string | undefined {
  return req.cookies?.[SESSION_COOKIE] ?? req.cookies?.[SESSION_COOKIE_NAME];
}

authRouter.get("/auth/csrf/", (_req, res) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  res.json({ csrfToken });
});

authRouter.post("/auth/register/", authLimiter, csrfProtection, async (req, res) => {
  try {
    const result = await authService.register(req.body);
    const loginResult = await authService.login({
      username: result.user.email,
      password: req.body.password,
      remember_me: false,
    });
    setSessionCookie(res, loginResult.session.token, loginResult.session.expiresAt);
    res.status(201).json({
      user: loginResult.user,
      must_reset_password: loginResult.must_reset_password,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ detail: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/auth/login/", authLimiter, csrfProtection, async (req, res) => {
  try {
    const result = await authService.login({
      username: req.body.username,
      password: req.body.password,
      remember_me: req.body.remember_me ?? false,
    });
    setSessionCookie(res, result.session.token, result.session.expiresAt);
    res.json({
      user: result.user,
      must_reset_password: result.must_reset_password,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ detail: err.message });
      return;
    }
    throw err;
  }
});

authRouter.post("/auth/logout/", csrfProtection, async (req, res) => {
  await authService.logout(getSessionToken(req));
  clearSessionCookie(res);
  res.json({ success: true });
});

authRouter.get("/auth/me/", async (req, res) => {
  const user = await authService.me(getSessionToken(req));
  if (!user) {
    res.status(401).json({ detail: "Authentication credentials were not provided." });
    return;
  }
  res.json(user);
});

authRouter.post("/auth/refresh/", csrfProtection, async (req, res) => {
  const token = getSessionToken(req);
  const expiresAt = await authService.refresh(token);
  if (!token || !expiresAt) {
    res.status(401).json({ detail: "Session expired." });
    return;
  }
  setSessionCookie(res, token, expiresAt);
  res.json({ success: true });
});

authRouter.post(
  "/auth/force-password-change/",
  csrfProtection,
  async (req, res) => {
    try {
      const token = getSessionToken(req);
      if (!token) {
        res.status(401).json({ detail: "Unauthorized." });
        return;
      }
      await authService.forcePasswordChange(token, req.body);
      res.json({ success: true, message: "Password changed successfully." });
    } catch (err) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
);

authRouter.post("/password-reset/", authLimiter, csrfProtection, async (req, res) => {
  await authService.requestPasswordReset(req.body.email ?? "");
  res.json({
    success: true,
    message: "If an account exists, a password reset email has been sent.",
  });
});

authRouter.post(
  "/password-reset-confirm/",
  authLimiter,
  csrfProtection,
  async (req, res) => {
    try {
      await authService.confirmPasswordReset({
        token: req.body.token,
        password: req.body.password,
        password2: req.body.password2,
      });
      res.json({ success: true, message: "Password reset successfully." });
    } catch (err) {
      if (err instanceof AuthError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
      }
      throw err;
    }
  },
);

export { authRouter };
