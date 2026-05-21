import { eq } from "drizzle-orm";
import { db } from "./index";
import { usersTable, formsTable, formFieldsTable } from "./schema";

export async function seedForms(): Promise<void> {
  const [creator] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, "creator@demo.com"))
    .limit(1);

  if (!creator) {
    console.log("Skip form seed: creator@demo.com not found.");
    return;
  }

  const samples = [
    {
      title: "Event RSVP",
      slug: "demo-event-rsvp",
      description: "Sample published form for hackathon demo.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "event",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Full name",
          placeholder: "Jane Doe",
          required: true,
          options: null as string[] | null,
        },
        {
          sortOrder: 1,
          type: "email",
          label: "Email",
          placeholder: "you@example.com",
          required: true,
          options: null,
        },
        {
          sortOrder: 2,
          type: "single_select",
          label: "Attendance",
          placeholder: null,
          required: true,
          options: ["Yes, attending", "Maybe", "No"],
        },
      ],
    },
    {
      title: "Product Feedback",
      slug: "demo-product-feedback",
      description: "Published startup-themed feedback form for demos.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "startup",
      fields: [
        {
          sortOrder: 0,
          type: "long_text",
          label: "What did you like?",
          placeholder: "Tell us...",
          required: false,
          options: null,
        },
        {
          sortOrder: 1,
          type: "number",
          label: "Rating (1-10)",
          placeholder: "10",
          required: false,
          options: null,
        },
      ],
    },
    {
      title: "Community signup",
      slug: "demo-community-signup",
      description: "Sample public form — multi-select demo.",
      status: "published" as const,
      visibility: "public" as const,
      theme: "community",
      fields: [
        {
          sortOrder: 0,
          type: "short_text",
          label: "Display name",
          placeholder: "How should we call you?",
          required: true,
          options: null as string[] | null,
        },
        {
          sortOrder: 1,
          type: "multi_select",
          label: "Interests",
          placeholder: null,
          required: false,
          options: ["Design", "Engineering", "Marketing", "Events"],
        },
      ],
    },
  ];

  for (const sample of samples) {
    const existing = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, sample.slug))
      .limit(1);

    let formId: string;
    if (existing.length > 0) {
      formId = existing[0]!.id;
      await db
        .update(formsTable)
        .set({
          title: sample.title,
          description: sample.description,
          status: sample.status,
          visibility: sample.visibility,
          theme: sample.theme,
          publishedAt:
            sample.status === "published" ? new Date() : null,
        })
        .where(eq(formsTable.id, formId));
      await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));
      console.log(`Updated demo form: ${sample.slug}`);
    } else {
      const [form] = await db
        .insert(formsTable)
        .values({
          userId: creator.id,
          title: sample.title,
          slug: sample.slug,
          description: sample.description,
          status: sample.status,
          visibility: sample.visibility,
          theme: sample.theme,
          publishedAt: sample.status === "published" ? new Date() : null,
        })
        .returning();
      if (!form) continue;
      formId = form.id;
      console.log(`Created demo form: ${sample.slug}`);
    }

    await db.insert(formFieldsTable).values(
      sample.fields.map((f) => ({
        formId,
        sortOrder: f.sortOrder,
        type: f.type,
        label: f.label,
        placeholder: f.placeholder,
        required: f.required,
        options: f.options,
      })),
    );
  }
}
