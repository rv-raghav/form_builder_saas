import { pgTable, integer, boolean, unique } from "drizzle-orm/pg-core";
import { rolesTable } from "./role";
import { componentsTable } from "./component";

export const roleComponentPermissionsTable = pgTable(
  "role_component_permissions",
  {
    roleId: integer("role_id")
      .notNull()
      .references(() => rolesTable.id, { onDelete: "cascade" }),
    componentId: integer("component_id")
      .notNull()
      .references(() => componentsTable.id, { onDelete: "cascade" }),
    hasAccess: boolean("has_access").notNull().default(false),
  },
  (t) => [unique().on(t.roleId, t.componentId)],
);
