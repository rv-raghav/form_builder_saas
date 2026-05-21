import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { usersTable } from "./schema";
import { seedRbac } from "./seed-rbac";
import { seedForms } from "./seed-forms";
import { seedResponses } from "./seed-responses";

const DEMO_PASSWORD = "Demo123!";

const demoUsers = [
  {
    email: "superadmin@demo.com",
    username: "superadmin",
    fullName: "Super Admin",
    firstName: "Super",
    lastName: "Admin",
    role: "superadmin" as const,
  },
  {
    email: "admin@demo.com",
    username: "admin",
    fullName: "Platform Admin",
    firstName: "Platform",
    lastName: "Admin",
    role: "admin" as const,
  },
  {
    email: "creator@demo.com",
    username: "creator",
    fullName: "Demo Creator",
    firstName: "Demo",
    lastName: "Creator",
    role: "consumer" as const,
  },
];

async function seed() {
  await seedRbac();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const user of demoUsers) {
    const existing = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, user.email))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(usersTable)
        .set({
          passwordHash,
          role: user.role,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          mustResetPassword: false,
          isActive: true,
          emailVerified: true,
        })
        .where(eq(usersTable.email, user.email));
      console.log(`Updated demo user: ${user.email}`);
    } else {
      await db.insert(usersTable).values({
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        passwordHash,
        mustResetPassword: false,
        isActive: true,
        emailVerified: true,
      });
      console.log(`Created demo user: ${user.email}`);
    }
  }

  await seedForms();
  await seedResponses();

  console.log(`\nDemo password for all users: ${DEMO_PASSWORD}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
