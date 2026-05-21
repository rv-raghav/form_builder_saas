import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formFieldsTable = pgTable("form_fields", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  type: varchar("type", { length: 40 }).notNull(),
  label: varchar("label", { length: 200 }).notNull(),
  placeholder: varchar("placeholder", { length: 500 }),
  required: boolean("required").notNull().default(false),
  options: jsonb("options").$type<string[] | null>(),
  validation: jsonb("validation").$type<Record<string, unknown> | null>(),
});

export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;
