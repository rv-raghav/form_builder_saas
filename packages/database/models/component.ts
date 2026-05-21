import { pgTable, serial, varchar, text, integer } from "drizzle-orm/pg-core";
import { pagesTable } from "./page";

export const componentsTable = pgTable("components", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  pageId: integer("page_id")
    .notNull()
    .references(() => pagesTable.id, { onDelete: "cascade" }),
  category: varchar("category", { length: 80 }).notNull().default("general"),
});

export type SelectComponent = typeof componentsTable.$inferSelect;
