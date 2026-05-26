import { eq, and, gt } from "drizzle-orm";
import { db } from "@repo/database";
import { sessionsTable, usersTable } from "@repo/database/schema";
import type { SelectSession, SelectUser } from "@repo/database/schema";
import { generateSecureToken, hashToken } from "./password";

const SESSION_COOKIE_NAME = "session_id";
const DEFAULT_SESSION_DAYS = 7;
const REMEMBER_SESSION_DAYS = 30;

export { SESSION_COOKIE_NAME };

export function getSessionExpiry(rememberMe = false): Date {
  const days = rememberMe ? REMEMBER_SESSION_DAYS : DEFAULT_SESSION_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createSession(
  userId: string,
  rememberMe = false,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSecureToken();
  const expiresAt = getSessionExpiry(rememberMe);

  await db.insert(sessionsTable).values({
    userId,
    tokenHash: hashToken(token),
    rememberMe,
    expiresAt,
  });

  return { token, expiresAt };
}

export async function revokeSession(token: string): Promise<void> {
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.tokenHash, hashToken(token)));
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await db.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
}

export async function getUserBySessionToken(
  token: string,
): Promise<SelectUser | null> {
  const record = await getSessionRecordByToken(token);
  return record?.user ?? null;
}

async function getSessionRecordByToken(
  token: string,
): Promise<{ user: SelectUser; session: SelectSession } | null> {
  const now = new Date();
  const rows = await db
    .select({ user: usersTable, session: sessionsTable })
    .from(sessionsTable)
    .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
    .where(
      and(
        eq(sessionsTable.tokenHash, hashToken(token)),
        gt(sessionsTable.expiresAt, now),
      ),
    )
    .limit(1);

  const record = rows[0];
  if (!record?.user || !record.user.isActive) return null;
  return record;
}

export async function extendSession(token: string): Promise<Date | null> {
  const record = await getSessionRecordByToken(token);
  if (!record) return null;

  const expiresAt = getSessionExpiry(record.session.rememberMe);
  await db
    .update(sessionsTable)
    .set({ expiresAt })
    .where(eq(sessionsTable.tokenHash, hashToken(token)));

  return expiresAt;
}
