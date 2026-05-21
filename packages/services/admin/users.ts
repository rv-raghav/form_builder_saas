import {
  eq,
  or,
  ilike,
  and,
  asc,
  desc,
  count,
} from "drizzle-orm";
import { db } from "@repo/database";
import {
  usersTable,
  rolesTable,
  userPermissionOverridesTable,
  type SelectUser,
  type UserRole,
} from "@repo/database/schema";
import { hashPassword } from "../auth/password";
import { AdminError } from "./errors";
import {
  canManageTargetRole,
  roleSlugFromId,
  userHasPermissionOverrides,
} from "../permissions/resolver";

export type UserListDto = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  is_superadmin: boolean;
  has_overrides?: boolean;
  date_joined: string;
  last_login: string | null;
};

function toUserListDto(
  user: SelectUser,
  hasOverrides: boolean,
): UserListDto {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    first_name: user.firstName ?? "",
    last_name: user.lastName ?? "",
    role: user.role,
    is_active: user.isActive,
    is_superadmin: user.role === "superadmin",
    has_overrides: hasOverrides,
    date_joined: user.createdAt?.toISOString() ?? new Date().toISOString(),
    last_login: null,
  };
}

const SORTABLE_COLUMNS = new Set([
  "id",
  "username",
  "email",
  "first_name",
  "last_name",
  "is_active",
]);

function parseDataTablesQuery(query: Record<string, unknown>) {
  const draw = Number(query.draw ?? 1);
  const start = Number(query.start ?? 0);
  const length = Math.min(Number(query.length ?? 20), 100);
  const search =
    typeof query["search[value]"] === "string" ? query["search[value]"] : "";

  let orderColumn = "id";
  let orderDir: "asc" | "desc" = "asc";
  const orderColIdx = query["order[0][column]"];
  const orderDirRaw = query["order[0][dir]"];
  if (orderColIdx !== undefined) {
    const colIdx = Number(orderColIdx);
    const colData = query[`columns[${colIdx}][data]`];
    if (typeof colData === "string" && SORTABLE_COLUMNS.has(colData)) {
      orderColumn = colData;
    }
  }
  if (orderDirRaw === "desc") orderDir = "desc";

  return { draw, start, length, search, orderColumn, orderDir };
}

export class AdminUsersService {
  private assertAdmin(actor: SelectUser) {
    if (actor.role !== "admin" && actor.role !== "superadmin") {
      throw new AdminError("You do not have permission to perform this action.", 403);
    }
  }

  private assertCanModifyUser(actor: SelectUser, target: SelectUser) {
    this.assertAdmin(actor);
    if (target.role === "superadmin" && actor.role !== "superadmin") {
      throw new AdminError("Cannot modify a Super Admin.", 403);
    }
    if (target.id === actor.id && actor.role !== "superadmin") {
      throw new AdminError("Cannot modify your own account through this endpoint.", 403);
    }
  }

  async listUsers(
    actor: SelectUser,
    query: Record<string, unknown>,
  ): Promise<{
    draw: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: UserListDto[];
  }> {
    this.assertAdmin(actor);

    const { draw, start, length, search, orderColumn, orderDir } =
      parseDataTablesQuery(query);

    const [totalRow] = await db.select({ value: count() }).from(usersTable);
    const recordsTotal = Number(totalRow?.value ?? 0);

    const conditions = [];
    if (search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(usersTable.username, term),
          ilike(usersTable.email, term),
          ilike(usersTable.firstName, term),
          ilike(usersTable.lastName, term),
        ),
      );
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [filteredRow] = await db
      .select({ value: count() })
      .from(usersTable)
      .where(whereClause);
    const recordsFiltered = Number(filteredRow?.value ?? 0);

    const orderFn = orderDir === "desc" ? desc : asc;
    const orderCol =
      orderColumn === "username"
        ? usersTable.username
        : orderColumn === "email"
          ? usersTable.email
          : orderColumn === "first_name"
            ? usersTable.firstName
            : orderColumn === "last_name"
              ? usersTable.lastName
              : orderColumn === "is_active"
                ? usersTable.isActive
                : usersTable.id;

    const rows = await db
      .select()
      .from(usersTable)
      .where(whereClause)
      .orderBy(orderFn(orderCol))
      .limit(length)
      .offset(start);

    const data: UserListDto[] = [];
    for (const user of rows) {
      const hasOverrides = await userHasPermissionOverrides(user.id);
      data.push(toUserListDto(user, hasOverrides));
    }

    return { draw, recordsTotal, recordsFiltered, data };
  }

  async getUser(actor: SelectUser, userId: string): Promise<UserListDto> {
    this.assertAdmin(actor);
    const target = await this.findUserOrThrow(userId);
    this.assertCanModifyUser(actor, target);
    const hasOverrides = await userHasPermissionOverrides(target.id);
    return toUserListDto(target, hasOverrides);
  }

  async createUser(
    actor: SelectUser,
    body: {
      username: string;
      email: string;
      password: string;
      password_confirm?: string;
      first_name?: string;
      last_name?: string;
      role_id?: number | null;
      is_active?: boolean;
    },
  ): Promise<UserListDto> {
    this.assertAdmin(actor);

    if (body.password !== body.password_confirm && body.password_confirm) {
      throw new AdminError("Passwords do not match.", 400);
    }
    if (body.password.length < 8) {
      throw new AdminError("Password must be at least 8 characters.", 400);
    }

    const targetRole = await roleSlugFromId(body.role_id);
    if (!canManageTargetRole(actor.role, targetRole)) {
      throw new AdminError("You cannot assign this role.", 403);
    }

    const email = body.email.trim().toLowerCase();
    const username = body.username.trim();

    const existing = await db
      .select()
      .from(usersTable)
      .where(
        or(eq(usersTable.email, email), eq(usersTable.username, username)),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AdminError("A user with this email or username already exists.", 400);
    }

    const passwordHash = await hashPassword(body.password);
    const fullName =
      [body.first_name, body.last_name].filter(Boolean).join(" ").trim() ||
      username;

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        username,
        fullName,
        firstName: body.first_name?.trim() ?? "",
        lastName: body.last_name?.trim() ?? "",
        passwordHash,
        role: targetRole,
        mustResetPassword: false,
        isActive: body.is_active ?? true,
        emailVerified: false,
      })
      .returning();

    if (!user) throw new AdminError("Failed to create user.", 500);
    return toUserListDto(user, false);
  }

  async updateUser(
    actor: SelectUser,
    userId: string,
    body: {
      username?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      role_id?: number | null;
      is_active?: boolean;
    },
  ): Promise<UserListDto> {
    this.assertAdmin(actor);
    const target = await this.findUserOrThrow(userId);
    this.assertCanModifyUser(actor, target);

    const updates: Partial<typeof usersTable.$inferInsert> = {};

    if (body.username !== undefined) updates.username = body.username.trim();
    if (body.email !== undefined) updates.email = body.email.trim().toLowerCase();
    if (body.first_name !== undefined) updates.firstName = body.first_name.trim();
    if (body.last_name !== undefined) updates.lastName = body.last_name.trim();
    if (body.is_active !== undefined) updates.isActive = body.is_active;

    if (body.role_id !== undefined) {
      const newRole = await roleSlugFromId(body.role_id);
      if (!canManageTargetRole(actor.role, newRole)) {
        throw new AdminError("You cannot assign this role.", 403);
      }
      if (
        target.role === "superadmin" &&
        actor.role !== "superadmin"
      ) {
        throw new AdminError("Cannot change role of a Super Admin.", 403);
      }
      updates.role = newRole;
    }

    if (body.first_name !== undefined || body.last_name !== undefined) {
      const first = body.first_name ?? target.firstName ?? "";
      const last = body.last_name ?? target.lastName ?? "";
      updates.fullName = `${first} ${last}`.trim() || target.fullName;
    }

    const [user] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, userId))
      .returning();

    if (!user) throw new AdminError("User not found.", 404);
    const hasOverrides = await userHasPermissionOverrides(user.id);
    return toUserListDto(user, hasOverrides);
  }

  async deleteUser(actor: SelectUser, userId: string): Promise<void> {
    this.assertAdmin(actor);
    const target = await this.findUserOrThrow(userId);
    this.assertCanModifyUser(actor, target);

    if (target.role === "superadmin") {
      throw new AdminError("Cannot delete a Super Admin.", 403);
    }

    await db.delete(usersTable).where(eq(usersTable.id, userId));
  }

  async setActive(
    actor: SelectUser,
    userId: string,
    active: boolean,
  ): Promise<{ detail: string }> {
    this.assertAdmin(actor);
    const target = await this.findUserOrThrow(userId);
    this.assertCanModifyUser(actor, target);

    if (target.role === "superadmin") {
      throw new AdminError("Cannot change status of a Super Admin.", 403);
    }

    await db
      .update(usersTable)
      .set({ isActive: active })
      .where(eq(usersTable.id, userId));

    return {
      detail: active
        ? "User activated successfully."
        : "User deactivated successfully.",
    };
  }

  async listRoles(): Promise<
    { id: number; name: string; slug: string; description: string }[]
  > {
    const roles = await db.select().from(rolesTable).orderBy(asc(rolesTable.id));
    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? "",
    }));
  }

  async listRolesForActor(actor: SelectUser) {
    const roles = await this.listRoles();
    if (actor.role === "superadmin") return roles;
    return roles.filter((r) => r.slug === "consumer");
  }

  private async findUserOrThrow(userId: string): Promise<SelectUser> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);
    if (!user) throw new AdminError("User not found.", 404);
    return user;
  }
}

export const adminUsersService = new AdminUsersService();

export async function getActorUser(userId: string): Promise<SelectUser> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);
  if (!user) throw new AdminError("Authenticated user not found.", 401);
  return user;
}
