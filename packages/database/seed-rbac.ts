import { eq } from "drizzle-orm";
import { db } from "./index";
import {
  rolesTable,
  pagesTable,
  componentsTable,
  rolePagePermissionsTable,
  roleComponentPermissionsTable,
} from "./schema";
import {
  PAGE_CATALOG,
  COMPONENT_CATALOG,
  ROLE_CATALOG,
  DEFAULT_ROLE_PAGE_ACCESS,
  DEFAULT_ROLE_COMPONENT_ACCESS,
} from "./catalog";

export async function seedRbac(): Promise<void> {
  for (const role of ROLE_CATALOG) {
    const existing = await db
      .select()
      .from(rolesTable)
      .where(eq(rolesTable.slug, role.slug))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(rolesTable).values({
        slug: role.slug,
        name: role.name,
        description: role.description,
      });
    }
  }

  const pageIdBySlug = new Map<string, number>();

  for (const page of PAGE_CATALOG) {
    const existing = await db
      .select()
      .from(pagesTable)
      .where(eq(pagesTable.slug, page.slug))
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(pagesTable)
        .values({
          slug: page.slug,
          name: page.name,
          path: page.path,
          category: page.category,
        })
        .returning();
      if (inserted) pageIdBySlug.set(page.slug, inserted.id);
    } else {
      pageIdBySlug.set(page.slug, existing[0]!.id);
    }
  }

  for (const comp of COMPONENT_CATALOG) {
    const pageId = pageIdBySlug.get(comp.pageSlug);
    if (!pageId) continue;

    const existing = await db
      .select()
      .from(componentsTable)
      .where(eq(componentsTable.slug, comp.slug))
      .limit(1);

    if (existing.length === 0) {
      const [inserted] = await db
        .insert(componentsTable)
        .values({
          slug: comp.slug,
          name: comp.name,
          description: comp.description,
          pageId,
          category: comp.category,
        })
        .returning();
    }
  }

  const roles = await db.select().from(rolesTable);
  const pages = await db.select().from(pagesTable);
  const components = await db.select().from(componentsTable);

  for (const role of roles) {
    const pageSlugs = DEFAULT_ROLE_PAGE_ACCESS[role.slug] ?? new Set();
    for (const page of pages) {
      const hasAccess = pageSlugs.has(page.slug);
      await db
        .insert(rolePagePermissionsTable)
        .values({
          roleId: role.id,
          pageId: page.id,
          hasAccess,
        })
        .onConflictDoUpdate({
          target: [
            rolePagePermissionsTable.roleId,
            rolePagePermissionsTable.pageId,
          ],
          set: { hasAccess },
        });
    }

    const componentSlugs =
      DEFAULT_ROLE_COMPONENT_ACCESS[role.slug] ?? new Set();
    for (const component of components) {
      const hasAccess = componentSlugs.has(component.slug);
      await db
        .insert(roleComponentPermissionsTable)
        .values({
          roleId: role.id,
          componentId: component.id,
          hasAccess,
        })
        .onConflictDoUpdate({
          target: [
            roleComponentPermissionsTable.roleId,
            roleComponentPermissionsTable.componentId,
          ],
          set: { hasAccess },
        });
    }
  }

  console.log("RBAC catalog and default permissions seeded.");
}
