import { z } from "zod";

const DEFAULT_SESSION_SECRET = "dev-session-secret-change-me";
const DEFAULT_CSRF_SECRET = "dev-csrf-secret-change-me";

const nodeEnvSchema = z
  .enum(["development", "production", "prod", "test"])
  .default("development")
  .transform((value) => (value === "prod" ? "production" : value));

const envSchema = z.object({
  NODE_ENV: nodeEnvSchema,
  SESSION_SECRET: z.string().min(16).default(DEFAULT_SESSION_SECRET),
  CSRF_SECRET: z.string().min(16).default(DEFAULT_CSRF_SECRET),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  COOKIE_SAMESITE: z
    .enum(["lax", "strict", "none"])
    .optional()
    .default("lax"),
  COOKIE_DOMAIN: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:8000"),
  EMAIL_FROM: z.string().optional().default("noreply@loomform.local"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_ID: z.string().optional(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().optional(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().optional(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);

  const parsed = safeParseResult.data;
  const cookieSecure = parsed.COOKIE_SECURE ?? parsed.NODE_ENV === "production";

  if (parsed.NODE_ENV === "production") {
    if (parsed.SESSION_SECRET === DEFAULT_SESSION_SECRET) {
      throw new Error("SESSION_SECRET must be changed for production.");
    }
    if (parsed.CSRF_SECRET === DEFAULT_CSRF_SECRET) {
      throw new Error("CSRF_SECRET must be changed for production.");
    }
  }

  if (parsed.COOKIE_SAMESITE === "none" && !cookieSecure) {
    throw new Error("COOKIE_SAMESITE=none requires COOKIE_SECURE=true.");
  }

  return {
    ...parsed,
    COOKIE_SECURE: cookieSecure,
  };
}

export const env = createEnv(process.env);
