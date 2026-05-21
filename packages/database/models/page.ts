import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const pagesTable = pgTable("pages", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  path: varchar("path", { length: 255 }),
  category: varchar("category", { length: 80 }).notNull().default("main"),
});

export type SelectPage = typeof pagesTable.$inferSelect;
