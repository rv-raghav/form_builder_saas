import { eq, and } from "drizzle-orm";
import { db } from "@repo/database";
import {
  usersTable,
  userPermissionOverridesTable,
  type SelectUser,
} from "@repo/database/schema";
import { AdminError } from "./errors";
import {
  getEffectivePermissions,
  type EffectivePermissionsResponse,
  type OverrideAction,
} from "../permissions/resolver";

export class UserOverridesService {
  private assertAdmin(actor: SelectUser) {
    if (actor.role !== "admin" && actor.role !== "superadmin") {
      throw new AdminError("You do not have permission to perform this action.", 403);
    }
  }

  async getEffective(
    actor: SelectUser,
    userId: string,
  ): Promise<EffectivePermissionsResponse> {
    this.assertAdmin(actor);
    const target = await this.findUser(userId);
    if (target.role === "superadmin") {
      throw new AdminError(
        "SuperAdmin has all permissions; overrides not applicable.",
        400,
      );
    }

    const result = await getEffectivePermissions(userId);
    if (!result) throw new AdminError("User not found.", 404);
    return result;
  }

  async upsertOverride(
    actor: SelectUser,
    userId: string,
    body: {
      override_type: "page" | "component";
      slug: string;
      action: OverrideAction;
    },
  ): Promise<void> {
    this.assertAdmin(actor);
    const target = await this.findUser(userId);
    if (target.role === "superadmin") {
      throw new AdminError("Cannot override Super Admin permissions.", 400);
    }

    await db
      .insert(userPermissionOverridesTable)
      .values({
        userId,
        overrideType: body.override_type,
        slug: body.slug,
        action: body.action,
      })
      .onConflictDoUpdate({
        target: [
          userPermissionOverridesTable.userId,
          userPermissionOverridesTable.overrideType,
          userPermissionOverridesTable.slug,
        ],
        set: { action: body.action },
      });
  }

  async deleteBySlug(
    actor: SelectUser,
    userId: string,
    overrideType: "page" | "component",
    slug: string,
  ): Promise<void> {
    this.assertAdmin(actor);
    await this.findUser(userId);

    await db
      .delete(userPermissionOverridesTable)
      .where(
        and(
          eq(userPermissionOverridesTable.userId, userId),
          eq(userPermissionOverridesTable.overrideType, overrideType),
          eq(userPermissionOverridesTable.slug, slug),
        ),
      );
  }

  async clearAll(actor: SelectUser, userId: string): Promise<void> {
    this.assertAdmin(actor);
    await this.findUser(userId);

    await db
      .delete(userPermissionOverridesTable)
      .where(eq(userPermissionOverridesTable.userId, userId));
  }

  private async findUser(userId: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) throw new AdminError("User not found.", 404);
    return user;
  }
}

export const userOverridesService = new UserOverridesService();
