import { eq, or, and, isNull, gt } from "drizzle-orm";
import { db } from "@repo/database";
import {
  usersTable,
  passwordResetTokensTable,
} from "@repo/database/schema";
import type { SelectUser } from "@repo/database/schema";
import { logger } from "@repo/logger";
import { env } from "../env";
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
} from "./password";
import {
  createSession,
  revokeSession,
  getUserBySessionToken,
  extendSession,
} from "./session";
import { toAuthUserDto, type AuthUserDto } from "./user-mapper";

export type { AuthUserDto };
export { SESSION_COOKIE_NAME } from "./session";

export class AuthService {
  async register(input: {
    email: string;
    password: string;
    password_confirm: string;
    name?: string;
  }): Promise<{ user: AuthUserDto; must_reset_password: boolean }> {
    if (input.password !== input.password_confirm) {
      throw new AuthError("Passwords do not match.", 400);
    }
    if (input.password.length < 8) {
      throw new AuthError("Password must be at least 8 characters.", 400);
    }

    const email = input.email.trim().toLowerCase();
    const username = email.split("@")[0] ?? email;

    const existing = await db
      .select()
      .from(usersTable)
      .where(
        or(eq(usersTable.email, email), eq(usersTable.username, username)),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AuthError("An account with this email already exists.", 400);
    }

    const passwordHash = await hashPassword(input.password);
    const fullName = input.name?.trim() || username;
    const nameParts = fullName.split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ");

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        username,
        fullName,
        firstName,
        lastName,
        passwordHash,
        role: "consumer",
        mustResetPassword: false,
        isActive: true,
        emailVerified: false,
      })
      .returning();

    if (!user) throw new AuthError("Failed to create user.", 500);

    return {
      user: await toAuthUserDto(user),
      must_reset_password: false,
    };
  }

  async login(input: {
    username: string;
    password: string;
    remember_me?: boolean;
  }): Promise<{
    user: AuthUserDto;
    must_reset_password: boolean;
    session: { token: string; expiresAt: Date };
  }> {
    const identifier = input.username.trim().toLowerCase();

    const rows = await db
      .select()
      .from(usersTable)
      .where(
        or(eq(usersTable.email, identifier), eq(usersTable.username, identifier)),
      )
      .limit(1);

    const user = rows[0];
    if (!user || !user.passwordHash) {
      throw new AuthError("Invalid email or password.", 401);
    }
    if (!user.isActive) {
      throw new AuthError("Account is deactivated.", 403);
    }

    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AuthError("Invalid email or password.", 401);
    }

    const session = await createSession(user.id, input.remember_me ?? false);

    return {
      user: await toAuthUserDto(user),
      must_reset_password: user.mustResetPassword,
      session,
    };
  }

  async me(sessionToken: string | undefined): Promise<AuthUserDto | null> {
    if (!sessionToken) return null;
    const user = await getUserBySessionToken(sessionToken);
    if (!user) return null;
    return await toAuthUserDto(user);
  }

  async logout(sessionToken: string | undefined): Promise<void> {
    if (sessionToken) {
      await revokeSession(sessionToken);
    }
  }

  async refresh(sessionToken: string | undefined): Promise<boolean> {
    if (!sessionToken) return false;
    const expiresAt = await extendSession(sessionToken);
    return expiresAt !== null;
  }

  async forcePasswordChange(
    sessionToken: string,
    input: { new_password: string; new_password_confirm: string },
  ): Promise<void> {
    const user = await getUserBySessionToken(sessionToken);
    if (!user) throw new AuthError("Unauthorized.", 401);

    if (input.new_password !== input.new_password_confirm) {
      throw new AuthError("Passwords do not match.", 400);
    }
    if (input.new_password.length < 8) {
      throw new AuthError("Password must be at least 8 characters.", 400);
    }

    const passwordHash = await hashPassword(input.new_password);
    await db
      .update(usersTable)
      .set({
        passwordHash,
        mustResetPassword: false,
      })
      .where(eq(usersTable.id, user.id));
  }

  async requestPasswordReset(email: string): Promise<void> {
    const normalized = email.trim().toLowerCase();
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, normalized))
      .limit(1);

    const user = rows[0];
    if (!user) {
      return;
    }

    const token = generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokensTable).values({
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
    });

    const resetUrl = `${env.APP_URL}/reset-password?token=${token}`;
    logger.info(`Password reset link for ${normalized}: ${resetUrl}`);
  }

  async confirmPasswordReset(input: {
    token: string;
    password: string;
    password2: string;
  }): Promise<void> {
    if (input.password !== input.password2) {
      throw new AuthError("Passwords do not match.", 400);
    }
    if (input.password.length < 8) {
      throw new AuthError("Password must be at least 8 characters.", 400);
    }

    const now = new Date();
    const rows = await db
      .select()
      .from(passwordResetTokensTable)
      .where(
        and(
          eq(passwordResetTokensTable.tokenHash, hashToken(input.token)),
          gt(passwordResetTokensTable.expiresAt, now),
          isNull(passwordResetTokensTable.usedAt),
        ),
      )
      .limit(1);

    const resetRow = rows[0];
    if (!resetRow) {
      throw new AuthError(
        "Invalid or expired reset link.",
        400,
      );
    }

    const passwordHash = await hashPassword(input.password);
    await db
      .update(usersTable)
      .set({ passwordHash, mustResetPassword: false })
      .where(eq(usersTable.id, resetRow.userId));

    await db
      .update(passwordResetTokensTable)
      .set({ usedAt: now })
      .where(eq(passwordResetTokensTable.id, resetRow.id));
  }
}

export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export const authService = new AuthService();
