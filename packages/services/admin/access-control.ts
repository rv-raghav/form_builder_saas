import { eq, and, asc } from "drizzle-orm";
import { db } from "@repo/database";
import {
  rolesTable,
  pagesTable,
  componentsTable,
  rolePagePermissionsTable,
  roleComponentPermissionsTable,
  type SelectUser,
} from "@repo/database/schema";
import { AdminError } from "./errors";

export type RoleAccessControlDto = {
  role: { id: number; name: string; slug: string };
  pages: {
    slug: string;
    name: string;
    path: string | null;
    category: string;
    has_access: boolean;
    components: {
      slug: string;
      name: string;
      description: string;
      has_access: boolean;
    }[];
  }[];
};

export class AccessControlService {
  private assertAdmin(actor: SelectUser) {
    if (actor.role !== "admin" && actor.role !== "superadmin") {
      throw new AdminError("You do not have permission to perform this action.", 403);
    }
  }

  async list(actor: SelectUser): Promise<RoleAccessControlDto[]> {
    this.assertAdmin(actor);

    const roles = await db.select().from(rolesTable).orderBy(asc(rolesTable.id));
    const pages = await db.select().from(pagesTable).orderBy(asc(pagesTable.id));
    const components = await db
      .select()
      .from(componentsTable)
      .orderBy(asc(componentsTable.id));

    const pagePerms = await db.select().from(rolePagePermissionsTable);
    const componentPerms = await db.select().from(roleComponentPermissionsTable);

    const pageAccessByRole = new Map<string, boolean>();
    for (const p of pagePerms) {
      pageAccessByRole.set(`${p.roleId}:${p.pageId}`, p.hasAccess);
    }
    const compAccessByRole = new Map<string, boolean>();
    for (const c of componentPerms) {
      compAccessByRole.set(`${c.roleId}:${c.componentId}`, c.hasAccess);
    }

    const componentsByPageId = new Map<number, (typeof components)[number][]>();
    for (const comp of components) {
      const list = componentsByPageId.get(comp.pageId) ?? [];
      list.push(comp);
      componentsByPageId.set(comp.pageId, list);
    }

    return roles.map((role) => ({
      role: { id: role.id, name: role.name, slug: role.slug },
      pages: pages.map((page) => ({
        slug: page.slug,
        name: page.name,
        path: page.path,
        category: page.category,
        has_access:
          role.slug === "superadmin"
            ? true
            : (pageAccessByRole.get(`${role.id}:${page.id}`) ?? false),
        components: (componentsByPageId.get(page.id) ?? []).map((comp) => ({
          slug: comp.slug,
          name: comp.name,
          description: comp.description ?? "",
          has_access:
            role.slug === "superadmin"
              ? true
              : (compAccessByRole.get(`${role.id}:${comp.id}`) ?? false),
        })),
      })),
    }));
  }

  private async findRole(roleId: number) {
    const [role] = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.id, roleId))
      .limit(1);
    if (!role) throw new AdminError("Role not found.", 404);
    return role;
  }

  private async findPageBySlug(pageSlug: string) {
    const [page] = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, pageSlug))
      .limit(1);
    if (!page) throw new AdminError("Page not found.", 404);
    return page;
  }

  private async findComponentBySlug(componentSlug: string) {
    const [component] = await db
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.slug, componentSlug))
      .limit(1);
    if (!component) throw new AdminError("Component not found.", 404);
    return component;
  }

  async togglePage(
    actor: SelectUser,
    roleId: number,
    pageSlug: string,
  ): Promise<void> {
    this.assertAdmin(actor);
    if (actor.role !== "superadmin") {
      throw new AdminError("Only Super Admin can change role permissions.", 403);
    }

    const role = await this.findRole(roleId);
    if (role.slug === "superadmin") {
      throw new AdminError("Super Admin permissions cannot be modified.", 400);
    }

    const page = await this.findPageBySlug(pageSlug);
    const [existing] = await db
      .select()
      .from(rolePagePermissionsTable)
      .where(
        and(
          eq(rolePagePermissionsTable.roleId, roleId),
          eq(rolePagePermissionsTable.pageId, page.id),
        ),
      )
      .limit(1);

    const nextAccess = !(existing?.hasAccess ?? false);

    await db
      .insert(rolePagePermissionsTable)
      .values({ roleId, pageId: page.id, hasAccess: nextAccess })
      .onConflictDoUpdate({
        target: [
          rolePagePermissionsTable.roleId,
          rolePagePermissionsTable.pageId,
        ],
        set: { hasAccess: nextAccess },
      });
  }

  async toggleComponent(
    actor: SelectUser,
    roleId: number,
    componentSlug: string,
  ): Promise<void> {
    this.assertAdmin(actor);
    if (actor.role !== "superadmin") {
      throw new AdminError("Only Super Admin can change role permissions.", 403);
    }

    const role = await this.findRole(roleId);
    if (role.slug === "superadmin") {
      throw new AdminError("Super Admin permissions cannot be modified.", 400);
    }

    const component = await this.findComponentBySlug(componentSlug);
    const [existing] = await db
      .select()
      .from(roleComponentPermissionsTable)
      .where(
        and(
          eq(roleComponentPermissionsTable.roleId, roleId),
          eq(roleComponentPermissionsTable.componentId, component.id),
        ),
      )
      .limit(1);

    const nextAccess = !(existing?.hasAccess ?? false);

    await db
      .insert(roleComponentPermissionsTable)
      .values({
        roleId,
        componentId: component.id,
        hasAccess: nextAccess,
      })
      .onConflictDoUpdate({
        target: [
          roleComponentPermissionsTable.roleId,
          roleComponentPermissionsTable.componentId,
        ],
        set: { hasAccess: nextAccess },
      });
  }

  async setAllPageComponents(
    actor: SelectUser,
    roleId: number,
    pageSlug: string,
    grant: boolean,
  ): Promise<void> {
    this.assertAdmin(actor);
    if (actor.role !== "superadmin") {
      throw new AdminError("Only Super Admin can change role permissions.", 403);
    }

    const role = await this.findRole(roleId);
    if (role.slug === "superadmin") {
      throw new AdminError("Super Admin permissions cannot be modified.", 400);
    }

    const page = await this.findPageBySlug(pageSlug);
    const pageComponents = await db
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.pageId, page.id));

    await db
      .insert(rolePagePermissionsTable)
      .values({ roleId, pageId: page.id, hasAccess: grant })
      .onConflictDoUpdate({
        target: [
          rolePagePermissionsTable.roleId,
          rolePagePermissionsTable.pageId,
        ],
        set: { hasAccess: grant },
      });

    for (const comp of pageComponents) {
      await db
        .insert(roleComponentPermissionsTable)
        .values({ roleId, componentId: comp.id, hasAccess: grant })
        .onConflictDoUpdate({
          target: [
            roleComponentPermissionsTable.roleId,
            roleComponentPermissionsTable.componentId,
          ],
          set: { hasAccess: grant },
        });
    }
  }
}

export const accessControlService = new AccessControlService();
