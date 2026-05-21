import { pgTable, integer, boolean, unique } from "drizzle-orm/pg-core";
import { rolesTable } from "./role";
import { pagesTable } from "./page";

export const rolePagePermissionsTable = pgTable(
  "role_page_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
    pageId: integer("page_id")
      .notNull()
      .references(() => pagesTable.id, { onDelete: "cascade" }),
    hasAccess: boolean("has_access").notNull().default(false),
  },
  (t) => [unique().on(t.roleId, t.pageId)],
);
