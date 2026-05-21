import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z.string().min(16).default("dev-session-secret-change-me"),
  CSRF_SECRET: z.string().min(16).default("dev-csrf-secret-change-me"),
  COOKIE_SECURE: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  COOKIE_DOMAIN: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:8000"),
  EMAIL_FROM: z.string().optional().default("noreply@chaiforms.local"),
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
  return safeParseResult.data;
}

export const env = createEnv(process.env);
