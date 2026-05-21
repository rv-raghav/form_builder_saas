import { asc, count, eq } from "drizzle-orm";
import { db } from "./index";
import { formFieldsTable, formResponsesTable, formsTable } from "./schema";

type SampleRow = Record<string, unknown> & { _daysAgo: number };

const specs: { slug: string; samples: SampleRow[] }[] = [
  {
    slug: "demo-event-rsvp",
    samples: [
      {
        _daysAgo: 12,
        "Full name": "Alice Chen",
        Email: "alice@example.com",
        Attendance: "Yes, attending",
      },
      {
        _daysAgo: 8,
        "Full name": "Bob Singh",
        Email: "bob@example.com",
        Attendance: "Maybe",
      },
      {
        _daysAgo: 3,
        "Full name": "Casey Rivera",
        Email: "casey@example.com",
        Attendance: "No",
      },
      {
        _daysAgo: 1,
        "Full name": "Devon Lee",
        Email: "devon@example.com",
        Attendance: "Yes, attending",
      },
    ],
  },
  {
    slug: "demo-community-signup",
    samples: [
      {
        _daysAgo: 11,
        "Display name": "PixelPioneer",
        Interests: ["Design", "Engineering"],
      },
      {
        _daysAgo: 5,
        "Display name": "EventMaven",
        Interests: ["Events", "Marketing"],
      },
      {
        _daysAgo: 0,
        "Display name": "CodeCraft",
        Interests: ["Engineering"],
      },
    ],
  },
  {
    slug: "demo-product-feedback",
    samples: [
      {
        _daysAgo: 9,
        "What did you like?": "Fast UX and keyboard shortcuts!",
        "Rating (1-10)": 9,
      },
      {
        _daysAgo: 6,
        "What did you like?": "Clear empty states.",
        "Rating (1-10)": 8,
      },
      {
        _daysAgo: 2,
        "What did you like?": "Would love dark mode tweaks.",
        "Rating (1-10)": 7,
      },
    ],
  },
];

/** Sample responses for seeded demo forms (skipped if form already has any responses). */
export async function seedResponses(): Promise<void> {
  for (const spec of specs) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, spec.slug))
      .limit(1);

    if (!form) continue;

    const [{ value: existingCount }] = await db
      .select({ value: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, form.id));

    if (Number(existingCount ?? 0) > 0) continue;

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, form.id))
      .orderBy(asc(formFieldsTable.sortOrder));

    const byLabel = Object.fromEntries(fields.map((f) => [f.label, f.id]));

    for (const sample of spec.samples) {
      const daysAgo = sample._daysAgo;
      const answers: Record<string, unknown> = {};
      for (const [label, val] of Object.entries(sample)) {
        if (label === "_daysAgo") continue;
        const id = byLabel[label];
        if (id) answers[id] = val;
      }

      const submittedAt = new Date();
      submittedAt.setUTCHours(12, 0, 0, 0);
      submittedAt.setUTCDate(submittedAt.getUTCDate() - daysAgo);

      await db.insert(formResponsesTable).values({
        formId: form.id,
        answers,
        submittedAt,
      });
    }

    console.log(`Seeded demo responses for: ${spec.slug}`);
  }
}
