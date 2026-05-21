import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  usersTable,
  type SelectFormField,
} from "@repo/database/schema";
import { publicFormSubmitSchema } from "@repo/validators/forms";
import { FormsError } from "./errors";
import { notifyCreatorNewResponse } from "../email/new-response";

export type PublicFormFieldDto = {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  sort_order: number;
  options: string[] | null;
};

export type PublicFormDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  theme: string;
  fields: PublicFormFieldDto[];
};

export type ExploreFormDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  theme: string;
  field_count: number;
};

function toPublicFieldDto(f: SelectFormField): PublicFormFieldDto {
  return {
    id: f.id,
    type: f.type,
    label: f.label,
    placeholder: f.placeholder,
    required: f.required,
    sort_order: f.sortOrder,
    options: f.options,
  };
}

async function loadFieldsOrdered(formId: string): Promise<SelectFormField[]> {
  return db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.sortOrder));
}

async function loadPublishedBySlug(slug: string) {
  const [form] = await db
    .select()
    .from(formsTable)
    .where(eq(formsTable.slug, slug))
    .limit(1);

  if (!form) {
    throw new FormsError("Form not found.", 404, { code: "not_found" });
  }
  if (form.status !== "published") {
    throw new FormsError(
      "This form is not published yet. Check back later or contact the creator.",
      404,
      { code: "not_published" },
    );
  }
  return form;
}

/** First non-empty answer values joined for notifications (creator email). */
function previewFromCleanAnswers(
  answers: Record<string, unknown>,
  fields: SelectFormField[],
): string {
  const parts: string[] = [];
  const order = [...fields].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const f of order) {
    const v = answers[f.id];
    if (v === undefined || v === null || v === "") continue;
    const text = Array.isArray(v) ? v.join(", ") : String(v);
    if (text) parts.push(text.slice(0, 80));
    if (parts.length >= 2) break;
  }
  return parts.join(" · ") || "(empty)";
}

function isEmptyValue(v: unknown): boolean {
  if (v === undefined || v === null) return true;
  if (typeof v === "string") return v.trim() === "";
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function validateAnswers(
  fields: SelectFormField[],
  answers: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const fieldErrors: Record<string, string[]> = {};

  for (const field of fields) {
    const raw = answers[field.id];
    const empty = isEmptyValue(raw);

    if (field.required && empty) {
      fieldErrors[field.id] = [`${field.label} is required.`];
      continue;
    }
    if (empty) continue;

    try {
      switch (field.type) {
        case "short_text":
        case "long_text": {
          if (typeof raw !== "string") {
            fieldErrors[field.id] = ["Must be text."];
            continue;
          }
          const s = raw.trim();
          if (s.length > 10_000) {
            fieldErrors[field.id] = ["Too long."];
            continue;
          }
          out[field.id] = s;
          break;
        }
        case "email": {
          if (typeof raw !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim())) {
            fieldErrors[field.id] = ["Enter a valid email."];
            continue;
          }
          out[field.id] = raw.trim().toLowerCase();
          break;
        }
        case "number": {
          const n =
            typeof raw === "number" ? raw : Number(String(raw).trim());
          if (Number.isNaN(n)) {
            fieldErrors[field.id] = ["Enter a valid number."];
            continue;
          }
          out[field.id] = n;
          break;
        }
        case "single_select": {
          if (typeof raw !== "string") {
            fieldErrors[field.id] = ["Invalid selection."];
            continue;
          }
          const opts = field.options ?? [];
          if (!opts.includes(raw)) {
            fieldErrors[field.id] = ["Invalid option."];
            continue;
          }
          out[field.id] = raw;
          break;
        }
        case "multi_select": {
          const arr = Array.isArray(raw)
            ? raw
            : typeof raw === "string"
              ? raw.split(",").map((s) => s.trim()).filter(Boolean)
              : [];
          const opts = new Set(field.options ?? []);
          if (!arr.every((x): x is string => typeof x === "string" && opts.has(x))) {
            fieldErrors[field.id] = ["Invalid option(s)."];
            continue;
          }
          out[field.id] = arr;
          break;
        }
        default:
          fieldErrors[field.id] = ["Unsupported field type."];
      }
    } catch {
      fieldErrors[field.id] = ["Invalid value."];
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new FormsError("Please fix the errors below.", 400, { fieldErrors });
  }
  return out;
}

export class PublicFormsService {
  async getBySlug(slug: string): Promise<PublicFormDto> {
    const form = await loadPublishedBySlug(slug);
    const fields = await loadFieldsOrdered(form.id);
    return {
      id: form.id,
      title: form.title,
      slug: form.slug,
      description: form.description,
      theme: form.theme,
      fields: fields.map(toPublicFieldDto),
    };
  }

  async listExplore(): Promise<ExploreFormDto[]> {
    const rows = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.status, "published"),
          eq(formsTable.visibility, "public"),
        ),
      )
      .orderBy(desc(formsTable.updatedAt))
      .limit(100);

    const results: ExploreFormDto[] = [];
    for (const form of rows) {
      const fieldRows = await db
        .select()
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, form.id));

      results.push({
        id: form.id,
        title: form.title,
        slug: form.slug,
        description: form.description,
        theme: form.theme,
        field_count: fieldRows.length,
      });
    }
    return results;
  }

  async submit(slug: string, body: unknown): Promise<{ id: string }> {
    const parsed = publicFormSubmitSchema.safeParse(body);
    if (!parsed.success) {
      throw new FormsError("Invalid request body.", 400);
    }

    if (parsed.data.website != null && String(parsed.data.website).trim() !== "") {
      throw new FormsError("Submission rejected.", 400, { code: "spam" });
    }

    const form = await loadPublishedBySlug(slug);
    const fields = await loadFieldsOrdered(form.id);
    if (fields.length === 0) {
      throw new FormsError("This form has no fields.", 400);
    }

    const clean = validateAnswers(fields, parsed.data.answers);

    const [row] = await db
      .insert(formResponsesTable)
      .values({
        formId: form.id,
        answers: clean,
      })
      .returning({ id: formResponsesTable.id });

    if (!row) throw new FormsError("Failed to save response.", 500);

    const [owner] = await db
      .select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.id, form.userId))
      .limit(1);

    if (owner?.email) {
      const preview = previewFromCleanAnswers(clean, fields);
      void notifyCreatorNewResponse({
        to: owner.email,
        formTitle: form.title,
        formSlug: form.slug,
        responsePreview: preview,
      });
    }

    return { id: row.id };
  }
}

export const publicFormsService = new PublicFormsService();
