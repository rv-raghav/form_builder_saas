import { pgTable, uuid, varchar, pgEnum, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const overrideTypeEnum = pgEnum("permission_override_type", [
  "page",
  "component",
]);

export const overrideActionEnum = pgEnum("permission_override_action", [
  "grant",
  "revoke",
]);

export const userPermissionOverridesTable = pgTable(
  "user_permission_overrides",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    overrideType: overrideTypeEnum("override_type").notNull(),
    slug: varchar("slug", { length: 80 }).notNull(),
    action: overrideActionEnum("action").notNull(),
  },
  (t) => [unique().on(t.userId, t.overrideType, t.slug)],
);

export type SelectUserPermissionOverride =
  typeof userPermissionOverridesTable.$inferSelect;
