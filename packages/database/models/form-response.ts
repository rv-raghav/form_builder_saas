import { pgTable, uuid, timestamp, jsonb } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

/** Reserved for Phase 4–5 submission storage. */
export const formResponsesTable = pgTable("form_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  formId: uuid("form_id")
    .notNull()
    .references(() => formsTable.id, { onDelete: "cascade" }),
  answers: jsonb("answers").$type<Record<string, unknown>>().notNull().default({}),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
