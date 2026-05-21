import { eq, desc, asc, and, count, gte } from "drizzle-orm";
import { db } from "@repo/database";
import {
  formsTable,
  formFieldsTable,
  formResponsesTable,
  type SelectUser,
  type SelectFormField,
  type SelectFormResponse,
} from "@repo/database/schema";
import { FormsError } from "./errors";

function canViewAllForms(role: string): boolean {
  return role === "admin" || role === "superadmin";
}

async function authorizeForm(actor: SelectUser, formId: string) {
  const [form] = await db
    .select()
    .from(formsTable)
    .where(eq(formsTable.id, formId))
    .limit(1);
  if (!form) throw new FormsError("Form not found.", 404);
  if (!canViewAllForms(actor.role) && form.userId !== actor.id) {
    throw new FormsError("You do not have permission to access this form.", 403);
  }
  return form;
}

export type ResponseListItem = {
  id: string;
  submitted_at: string;
  preview: string;
};

export type AnswerRow = {
  field_id: string;
  label: string;
  type: string;
  value: unknown;
};

export type ResponseDetail = {
  id: string;
  form_id: string;
  submitted_at: string;
  answers: AnswerRow[];
};

export type AnalyticsSummary = {
  total_responses: number;
  by_day: { date: string; count: number }[];
};

async function loadFields(formId: string): Promise<SelectFormField[]> {
  return db
    .select()
    .from(formFieldsTable)
    .where(eq(formFieldsTable.formId, formId))
    .orderBy(asc(formFieldsTable.sortOrder));
}

function previewFromAnswers(
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

function toDetail(row: SelectFormResponse, fields: SelectFormField[]): ResponseDetail {
  const answersRaw = row.answers as Record<string, unknown>;
  const answers: AnswerRow[] = [...fields]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((field) => ({
      field_id: field.id,
      label: field.label,
      type: field.type,
      value: answersRaw[field.id] ?? null,
    }));
  return {
    id: row.id,
    form_id: row.formId,
    submitted_at: row.submittedAt?.toISOString() ?? "",
    answers,
  };
}

function bucketResponsesByUtcDay(rows: { submittedAt: Date | null }[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of rows) {
    const d = r.submittedAt ? new Date(r.submittedAt) : new Date();
    const key = d.toISOString().slice(0, 10);
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

export class FormResponsesService {
  async analytics(actor: SelectUser, formId: string): Promise<AnalyticsSummary> {
    await authorizeForm(actor, formId);

    const [totalRow] = await db
      .select({ value: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));
    const total = Number(totalRow?.value ?? 0);

    const days = 14;
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const recent = await db
      .select({ submittedAt: formResponsesTable.submittedAt })
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.formId, formId),
          gte(formResponsesTable.submittedAt, start),
        ),
      );

    const countsByDay = bucketResponsesByUtcDay(recent);

    const by_day: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      by_day.push({ date: key, count: countsByDay.get(key) ?? 0 });
    }

    return { total_responses: total, by_day };
  }

  async list(
    actor: SelectUser,
    formId: string,
    opts: { page?: number; page_size?: number },
  ): Promise<{ results: ResponseListItem[]; count: number }> {
    await authorizeForm(actor, formId);
    const fields = await loadFields(formId);

    const page = Math.max(1, opts.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, opts.page_size ?? 20));
    const offset = (page - 1) * pageSize;

    const [countRow] = await db
      .select({ value: count() })
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId));
    const total = Number(countRow?.value ?? 0);

    const rows = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt))
      .limit(pageSize)
      .offset(offset);

    return {
      count: total,
      results: rows.map((r) => ({
        id: r.id,
        submitted_at: r.submittedAt?.toISOString() ?? "",
        preview: previewFromAnswers(r.answers as Record<string, unknown>, fields),
      })),
    };
  }

  async get(
    actor: SelectUser,
    formId: string,
    responseId: string,
  ): Promise<ResponseDetail> {
    await authorizeForm(actor, formId);
    const fields = await loadFields(formId);

    const [row] = await db
      .select()
      .from(formResponsesTable)
      .where(
        and(
          eq(formResponsesTable.id, responseId),
          eq(formResponsesTable.formId, formId),
        ),
      )
      .limit(1);

    if (!row) throw new FormsError("Response not found.", 404);
    return toDetail(row, fields);
  }
}

export const formResponsesService = new FormResponsesService();
