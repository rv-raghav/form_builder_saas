import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formStatusEnum = pgEnum("form_status", ["draft", "published"]);
export const formVisibilityEnum = pgEnum("form_visibility", [
  "public",
  "unlisted",
]);

export const formsTable = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  description: text("description"),
  status: formStatusEnum("status").notNull().default("draft"),
  visibility: formVisibilityEnum("visibility").notNull().default("unlisted"),
  theme: varchar("theme", { length: 40 }).notNull().default("default"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;
export type FormStatus = (typeof formStatusEnum.enumValues)[number];
export type FormVisibility = (typeof formVisibilityEnum.enumValues)[number];
