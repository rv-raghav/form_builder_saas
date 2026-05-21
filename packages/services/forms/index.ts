import { eq, and, desc, asc, ilike, or, count, ne } from "drizzle-orm";
import { db } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  usersTable,
  type SelectUser,
  type SelectForm,
  type SelectFormField,
} from "@repo/database/schema";
import {
  createFormSchema,
  updateFormSchema,
  slugifyTitle,
  type FormFieldInput,
} from "@repo/validators/forms";
import { FormsError } from "./errors";

export type FormFieldDto = {
  id: string;
  type: string;
  label: string;
  placeholder: string | null;
  required: boolean;
  sort_order: number;
  options: string[] | null;
};

export type FormDto = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  visibility: "public" | "unlisted";
  theme: string;
  published_at: string | null;
  created_at: string;
  updated_at: string | null;
  owner_id: string;
  owner_email?: string;
  fields: FormFieldDto[];
  response_count?: number;
};

export type FormListItemDto = Omit<FormDto, "fields"> & { field_count: number };

function toFieldDto(field: SelectFormField): FormFieldDto {
  return {
    id: field.id,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    sort_order: field.sortOrder,
    options: field.options,
  };
}

function toFormDto(
  form: SelectForm,
  fields: SelectFormField[],
  extras?: { owner_email?: string; response_count?: number },
): FormDto {
  return {
    id: form.id,
    title: form.title,
    slug: form.slug,
    description: form.description,
    status: form.status,
    visibility: form.visibility,
    theme: form.theme,
    published_at: form.publishedAt?.toISOString() ?? null,
    created_at: form.createdAt?.toISOString() ?? new Date().toISOString(),
    updated_at: form.updatedAt?.toISOString() ?? null,
    owner_id: form.userId,
    owner_email: extras?.owner_email,
    fields: fields.sort((a, b) => a.sortOrder - b.sortOrder).map(toFieldDto),
    response_count: extras?.response_count,
  };
}

function toListItem(form: SelectForm, fieldCount: number, ownerEmail?: string): FormListItemDto {
  return {
    id: form.id,
    title: form.title,
    slug: form.slug,
    description: form.description,
    status: form.status,
    visibility: form.visibility,
    theme: form.theme,
    published_at: form.publishedAt?.toISOString() ?? null,
    created_at: form.createdAt?.toISOString() ?? new Date().toISOString(),
    updated_at: form.updatedAt?.toISOString() ?? null,
    owner_id: form.userId,
    owner_email: ownerEmail,
    field_count: fieldCount,
  };
}

function canViewAllForms(role: string): boolean {
  return role === "admin" || role === "superadmin";
}

function assertAuthenticated(actor: SelectUser | null): asserts actor is SelectUser {
  if (!actor) throw new FormsError("Authentication required.", 401);
}

async function ensureUniqueSlug(slug: string, excludeFormId?: string): Promise<string> {
  let candidate = slug;
  let n = 1;
  while (true) {
    const conditions = [eq(formsTable.slug, candidate)];
    if (excludeFormId) conditions.push(ne(formsTable.id, excludeFormId));

    const existing = await db
      .select({ id: formsTable.id })
      .from(formsTable)
      .where(and(...conditions))
      .limit(1);

    if (existing.length === 0) return candidate;
    candidate = `${slug}-${n++}`;
  }
}

async function loadFields(formId: string): Promise<SelectFormField[]> {
  return db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.sortOrder));
}

async function replaceFields(formId: string, fields: FormFieldInput[]): Promise<void> {
  await db.delete(formFieldsTable).where(eq(formFieldsTable.formId, formId));

  if (fields.length === 0) return;

  await db.insert(formFieldsTable).values(
    fields.map((f, index) => ({
      formId,
      sortOrder: f.sort_order ?? index,
      type: f.type,
      label: f.label,
      placeholder: f.placeholder ?? null,
      required: f.required ?? false,
      options:
        f.type === "single_select" || f.type === "multi_select"
          ? (f.options ?? [])
          : null,
    })),
  );
}

async function getFormForActor(
  actor: SelectUser,
  formId: string,
): Promise<{ form: SelectForm; fields: SelectFormField[] }> {
  const [form] = await db
    .select()
    .from(formsTable)
    .where(eq(formsTable.id, formId))
    .limit(1);

  if (!form) throw new FormsError("Form not found.", 404);
  if (!canViewAllForms(actor.role) && form.userId !== actor.id) {
    throw new FormsError("You do not have permission to access this form.", 403);
  }

  const fields = await loadFields(formId);
  return { form, fields };
}

export class FormsService {
  async list(
    actor: SelectUser,
    params: { search?: string; status?: string; page?: number; page_size?: number } = {},
  ): Promise<{ results: FormListItemDto[]; count: number }> {
    assertAuthenticated(actor);

    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, params.page_size ?? 20));
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (!canViewAllForms(actor.role)) {
      conditions.push(eq(formsTable.userId, actor.id));
    }
    if (params.status === "draft" || params.status === "published") {
      conditions.push(eq(formsTable.status, params.status));
    }
    if (params.search?.trim()) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        or(ilike(formsTable.title, term), ilike(formsTable.slug, term)),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ value: count() })
      .from(formsTable)
      .where(whereClause);

    const forms = await db
      .select()
      .from(formsTable)
      .where(whereClause)
      .orderBy(desc(formsTable.updatedAt))
      .limit(pageSize)
      .offset(offset);

    const results: FormListItemDto[] = [];
    for (const form of forms) {
      const fieldRows = await db
        .select({ value: count() })
        .from(formFieldsTable)
        .where(eq(formFieldsTable.formId, form.id));
      let ownerEmail: string | undefined;
      if (canViewAllForms(actor.role) && form.userId !== actor.id) {
        const [owner] = await db
          .select({ email: usersTable.email })
          .from(usersTable)
          .where(eq(usersTable.id, form.userId))
          .limit(1);
        ownerEmail = owner?.email;
      }
      results.push(
        toListItem(form, Number(fieldRows[0]?.value ?? 0), ownerEmail),
      );
    }

    return { results, count: Number(countRow?.value ?? 0) };
  }

  async get(actor: SelectUser, formId: string): Promise<FormDto> {
    assertAuthenticated(actor);
    const { form, fields } = await getFormForActor(actor, formId);
    let ownerEmail: string | undefined;
    if (canViewAllForms(actor.role)) {
      const [owner] = await db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.id, form.userId))
        .limit(1);
      ownerEmail = owner?.email;
    }
    return toFormDto(form, fields, { owner_email: ownerEmail });
  }

  async create(actor: SelectUser, body: unknown): Promise<FormDto> {
    assertAuthenticated(actor);

    const parsed = createFormSchema.safeParse(body);
    if (!parsed.success) {
      throw new FormsError(parsed.error.message, 400);
    }

    const baseSlug = parsed.data.slug ?? slugifyTitle(parsed.data.title);
    const slug = await ensureUniqueSlug(baseSlug);

    const [form] = await db
      .insert(formsTable)
      .values({
        userId: actor.id,
        title: parsed.data.title,
        slug,
        description: parsed.data.description ?? null,
        visibility: parsed.data.visibility,
        theme: parsed.data.theme,
        status: "draft",
      })
      .returning();

    if (!form) throw new FormsError("Failed to create form.", 500);

    await replaceFields(form.id, parsed.data.fields);
    const fields = await loadFields(form.id);
    return toFormDto(form, fields);
  }

  async update(actor: SelectUser, formId: string, body: unknown): Promise<FormDto> {
    assertAuthenticated(actor);
    const { form } = await getFormForActor(actor, formId);

    const parsed = updateFormSchema.safeParse(body);
    if (!parsed.success) {
      throw new FormsError(parsed.error.message, 400);
    }

    const updates: Partial<typeof formsTable.$inferInsert> = {};

    if (parsed.data.title !== undefined) updates.title = parsed.data.title;
    if (parsed.data.description !== undefined) {
      updates.description = parsed.data.description;
    }
    if (parsed.data.visibility !== undefined) {
      updates.visibility = parsed.data.visibility;
    }
    if (parsed.data.theme !== undefined) updates.theme = parsed.data.theme;

    if (parsed.data.slug !== undefined) {
      updates.slug = await ensureUniqueSlug(parsed.data.slug, formId);
    }

    const [updated] = await db
      .update(formsTable)
      .set(updates)
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) throw new FormsError("Form not found.", 404);

    if (parsed.data.fields !== undefined) {
      await replaceFields(formId, parsed.data.fields);
    }

    const fields = await loadFields(formId);
    return toFormDto(updated, fields);
  }

  async delete(actor: SelectUser, formId: string): Promise<void> {
    assertAuthenticated(actor);
    await getFormForActor(actor, formId);
    await db.delete(formsTable).where(eq(formsTable.id, formId));
  }

  async publish(actor: SelectUser, formId: string): Promise<FormDto> {
    assertAuthenticated(actor);
    const { form, fields } = await getFormForActor(actor, formId);

    if (fields.length === 0) {
      throw new FormsError("Add at least one field before publishing.", 400);
    }

    const [updated] = await db
      .update(formsTable)
      .set({
        status: "published",
        publishedAt: form.publishedAt ?? new Date(),
      })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) throw new FormsError("Form not found.", 404);
    return toFormDto(updated, fields);
  }

  async unpublish(actor: SelectUser, formId: string): Promise<FormDto> {
    assertAuthenticated(actor);
    const { form, fields } = await getFormForActor(actor, formId);

    const [updated] = await db
      .update(formsTable)
      .set({ status: "draft" })
      .where(eq(formsTable.id, formId))
      .returning();

    if (!updated) throw new FormsError("Form not found.", 404);
    return toFormDto(updated, fields);
  }

  async duplicate(actor: SelectUser, formId: string): Promise<FormDto> {
    assertAuthenticated(actor);
    const { form, fields } = await getFormForActor(actor, formId);

    const slug = await ensureUniqueSlug(`${form.slug}-copy`);
    const [copy] = await db
      .insert(formsTable)
      .values({
        userId: actor.id,
        title: `${form.title} (Copy)`,
        slug,
        description: form.description,
        visibility: form.visibility,
        theme: form.theme,
        status: "draft",
      })
      .returning();

    if (!copy) throw new FormsError("Failed to duplicate form.", 500);

    const fieldInputs: FormFieldInput[] = fields.map((f) => ({
      type: f.type as FormFieldInput["type"],
      label: f.label,
      placeholder: f.placeholder,
      required: f.required,
      sort_order: f.sortOrder,
      options: f.options,
    }));
    await replaceFields(copy.id, fieldInputs);

    const newFields = await loadFields(copy.id);
    return toFormDto(copy, newFields);
  }
}

export const formsService = new FormsService();

export { FormsError } from "./errors";
export type {
  PublicFormDto,
  PublicFormFieldDto,
  ExploreFormDto,
} from "./public-forms";
export { publicFormsService } from "./public-forms";

export { formResponsesService } from "./responses";
export type {
  AnalyticsSummary,
  AnswerRow,
  ResponseDetail,
  ResponseListItem,
} from "./responses";
