import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
  pgEnum,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "superadmin",
  "admin",
  "consumer",
]);

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  fullName: varchar("full_name", { length: 80 }).notNull(),
  firstName: varchar("first_name", { length: 80 }),
  lastName: varchar("last_name", { length: 80 }),

  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 80 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),

  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("consumer"),
  mustResetPassword: boolean("must_reset_password").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),

  profileImageUrl: text("profile_image_url"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
export type UserRole = (typeof userRoleEnum.enumValues)[number];
