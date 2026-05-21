import { eq, and } from "drizzle-orm";
import { db } from "@repo/database";
import {
  pagesTable,
  componentsTable,
  rolesTable,
  usersTable,
  rolePagePermissionsTable,
  roleComponentPermissionsTable,
  userPermissionOverridesTable,
  type SelectUser,
  type UserRole,
} from "@repo/database/schema";
import { PAGE_CATALOG, COMPONENT_CATALOG } from "@repo/database/catalog";

export type OverrideAction = "grant" | "revoke";

export type AllowedPage = {
  slug: string;
  name: string;
  path: string;
};

export type AllowedComponent = {
  slug: string;
  name: string;
  description?: string;
  category?: string;
};

type OverrideMap = Map<string, OverrideAction>;

async function loadRoleBySlug(slug: string) {
  const [role] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.slug, slug))
    .limit(1);
  return role ?? null;
}

async function loadRolePageAccess(roleId: number): Promise<Map<string, boolean>> {
  const rows = await db
    .select({
      slug: pagesTable.slug,
      hasAccess: rolePagePermissionsTable.hasAccess,
    })
    .from(rolePagePermissionsTable)
    .innerJoin(pagesTable, eq(rolePagePermissionsTable.pageId, pagesTable.id))
    .where(eq(rolePagePermissionsTable.roleId, roleId));

  return new Map(rows.map((r) => [r.slug, r.hasAccess]));
}

async function loadRoleComponentAccess(
  roleId: number,
): Promise<Map<string, boolean>> {
  const rows = await db
    .select({
      slug: componentsTable.slug,
      hasAccess: roleComponentPermissionsTable.hasAccess,
    })
    .from(roleComponentPermissionsTable)
    .innerJoin(
      componentsTable,
      eq(roleComponentPermissionsTable.componentId, componentsTable.id),
    )
    .where(eq(roleComponentPermissionsTable.roleId, roleId));

  return new Map(rows.map((r) => [r.slug, r.hasAccess]));
}

async function loadUserOverrides(userId: string): Promise<OverrideMap> {
  const rows = await db
    .select()
    .from(userPermissionOverridesTable)
    .where(eq(userPermissionOverridesTable.userId, userId));

  const map: OverrideMap = new Map();
  for (const row of rows) {
    map.set(`${row.overrideType}:${row.slug}`, row.action);
  }
  return map;
}

function applyOverride(
  roleDefault: boolean,
  override: OverrideAction | undefined,
): boolean {
  if (override === "grant") return true;
  if (override === "revoke") return false;
  return roleDefault;
}

export async function resolvePermissionsForUser(user: SelectUser): Promise<{
  allowed_pages: AllowedPage[];
  allowed_components: AllowedComponent[];
}> {
  if (user.role === "superadmin") {
    return {
      allowed_pages: PAGE_CATALOG.map((p) => ({
        slug: p.slug,
        name: p.name,
        path: p.path,
      })),
      allowed_components: COMPONENT_CATALOG.map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        category: c.category,
      })),
    };
  }

  const role = await loadRoleBySlug(user.role);
  if (!role) {
    return { allowed_pages: [], allowed_components: [] };
  }

  const pageAccess = await loadRolePageAccess(role.id);
  const componentAccess = await loadRoleComponentAccess(role.id);
  const overrides = await loadUserOverrides(user.id);

  const allowed_pages: AllowedPage[] = [];
  for (const page of PAGE_CATALOG) {
    const roleDefault = pageAccess.get(page.slug) ?? false;
    const override = overrides.get(`page:${page.slug}`);
    if (applyOverride(roleDefault, override)) {
      allowed_pages.push({
        slug: page.slug,
        name: page.name,
        path: page.path,
      });
    }
  }

  const allowed_components: AllowedComponent[] = [];
  for (const comp of COMPONENT_CATALOG) {
    const roleDefault = componentAccess.get(comp.slug) ?? false;
    const override = overrides.get(`component:${comp.slug}`);
    if (applyOverride(roleDefault, override)) {
      allowed_components.push({
        slug: comp.slug,
        name: comp.name,
        description: comp.description,
        category: comp.category,
      });
    }
  }

  return { allowed_pages, allowed_components };
}

export async function userHasPermissionOverrides(
  userId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: userPermissionOverridesTable.id })
    .from(userPermissionOverridesTable)
    .where(eq(userPermissionOverridesTable.userId, userId))
    .limit(1);
  return rows.length > 0;
}

export type EffectivePermissionsResponse = {
  user_id: string;
  username: string;
  user_role: string | null;
  pages: {
    slug: string;
    name: string;
    category: string;
    role_default: boolean;
    override: OverrideAction | null;
    final: boolean;
    components: {
      slug: string;
      name: string;
      description: string;
      role_default: boolean;
      override: OverrideAction | null;
      final: boolean;
    }[];
  }[];
};

export async function getEffectivePermissions(
  userId: string,
): Promise<EffectivePermissionsResponse | null> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (!user) return null;

  const role = await loadRoleBySlug(user.role);
  const pageAccess = role
    ? await loadRolePageAccess(role.id)
    : new Map<string, boolean>();
  const componentAccess = role
    ? await loadRoleComponentAccess(role.id)
    : new Map<string, boolean>();
  const overrides = await loadUserOverrides(userId);

  const componentsByPage = new Map<string, typeof COMPONENT_CATALOG>();
  for (const comp of COMPONENT_CATALOG) {
    const list = componentsByPage.get(comp.pageSlug) ?? [];
    list.push(comp);
    componentsByPage.set(comp.pageSlug, list);
  }

  const pages = PAGE_CATALOG.map((page) => {
    const roleDefault =
      user.role === "superadmin" ? true : (pageAccess.get(page.slug) ?? false);
    const override = overrides.get(`page:${page.slug}`) ?? null;
    const final =
      user.role === "superadmin"
        ? true
        : applyOverride(roleDefault, override ?? undefined);

    const components = (componentsByPage.get(page.slug) ?? []).map((comp) => {
      const compRoleDefault =
        user.role === "superadmin"
          ? true
          : (componentAccess.get(comp.slug) ?? false);
      const compOverride = overrides.get(`component:${comp.slug}`) ?? null;
      return {
        slug: comp.slug,
        name: comp.name,
        description: comp.description,
        role_default: compRoleDefault,
        override: compOverride,
        final:
          user.role === "superadmin"
            ? true
            : applyOverride(compRoleDefault, compOverride ?? undefined),
      };
    });

    return {
      slug: page.slug,
      name: page.name,
      category: page.category,
      role_default: roleDefault,
      override,
      final,
      components,
    };
  });

  return {
    user_id: user.id,
    username: user.username,
    user_role: user.role,
    pages,
  };
}

export async function roleSlugFromId(
  roleId: number | null | undefined,
): Promise<UserRole> {
  if (!roleId) return "consumer";
  const [role] = await db
    .select()
    .from(rolesTable)
    .where(eq(rolesTable.id, roleId))
    .limit(1);
  if (!role) throw new Error("Invalid role_id");
  return role.slug as UserRole;
}

export function canManageTargetRole(
  actorRole: UserRole,
  targetRole: UserRole,
): boolean {
  if (actorRole === "superadmin") return true;
  if (actorRole === "admin") return targetRole === "consumer";
  return false;
}
